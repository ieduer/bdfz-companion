import React, { useState, useRef, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, SPACING, RADIUS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { isAuthenticated, fetchFromUserCenter } from '@/services/auth';

// Import local JSON textbook databases
import nahanData from '@/constants/books/nahan.json';
import bianchengData from '@/constants/books/biancheng.json';
import lunyuData from '@/constants/books/lunyu.json';
import hamletData from '@/constants/books/hamlet.json';
import yecaoData from '@/constants/books/yecao.json';
import chenQingBiaoData from '@/constants/books/chen_qing_biao.json';

const BOOKS_DATA: Record<string, any> = {
  nahan: nahanData,
  biancheng: bianchengData,
  lunyu: lunyuData,
  hamlet: hamletData,
  yecao: yecaoData,
  chen_qing_biao: chenQingBiaoData,
};

type ReaderTheme = 'paper' | 'mint' | 'charcoal' | 'dark';

export default function ReaderScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);

  // Params
  const titleParam = (searchParams.title as string) || '陳情表';
  const authorParam = (searchParams.author as string) || '李密';
  const articleId = (searchParams.articleId as string) || 'chen_qing_biao';

  const bookData = BOOKS_DATA[articleId] || BOOKS_DATA.chen_qing_biao;

  // Active chapter state
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const activeChapter = bookData.chapters[activeChapterIndex] || bookData.chapters[0];

  // Reading progress ref
  const currentProgressRef = useRef(0);

  const saveReadingProgress = async (currentPercent: number) => {
    try {
      const isAuth = await isAuthenticated();
      if (!isAuth) return;

      let siteKey = 'coread';
      if (articleId === 'nahan') siteKey = 'nh';
      else if (articleId === 'biancheng') siteKey = 'bc';
      else if (articleId === 'lunyu') siteKey = 'lun';
      else if (articleId === 'chen_qing_biao') siteKey = 'mf';
      else if (articleId === 'yecao') siteKey = 'yecao';
      else if (articleId === 'hamlet') siteKey = 'hamlet';

      await fetchFromUserCenter('/api/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteKey,
          itemKey: articleId,
          itemTitle: bookData.meta.zhTitle,
          itemGroup: bookData.meta.author,
          itemType: 'lesson',
          progressPercent: currentPercent,
          state: currentPercent >= 90 ? 'done' : 'in_progress',
        }),
      });
    } catch (err) {
      console.warn('Failed to save reading progress:', err);
    }
  };

  useEffect(() => {
    return () => {
      saveReadingProgress(currentProgressRef.current);
    };
  }, [activeChapterIndex]);

  // Settings states
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('serif');
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>('paper');
  const [showSettings, setShowSettings] = useState(false);
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Floating header/footer visibility (fades on scroll)
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const [showToolbar, setShowToolbar] = useState(true);

  // Theme styling definitions
  const THEME_COLORS: Record<ReaderTheme, { bg: string; text: string; accent: string; card: string; border: string }> = {
    paper: { bg: '#FDFBF7', text: '#1E293B', accent: '#4F46E5', card: '#FAF5EE', border: '#E2E8F0' },
    mint: { bg: '#F2F8F5', text: '#0F2C22', accent: '#0D9488', card: '#E6F0EB', border: '#D1E5DD' },
    charcoal: { bg: '#1E293B', text: '#F1F5F9', accent: '#6366F1', card: '#0F172A', border: '#334155' },
    dark: { bg: '#090D16', text: '#E2E8F0', accent: '#60A5FA', card: '#131A26', border: '#1F2937' },
  };

  const currentTheme = THEME_COLORS[readerTheme];

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const currentY = event.nativeEvent.contentOffset.y;
        const contentHeight = event.nativeEvent.contentSize?.height || 1;
        const layoutHeight = event.nativeEvent.layoutMeasurement?.height || 1;
        if (contentHeight > layoutHeight) {
          const pct = Math.min(100, Math.max(0, Math.round((currentY / (contentHeight - layoutHeight)) * 100)));
          currentProgressRef.current = pct;
        }

        if (currentY <= 0) {
          setShowToolbar(true);
        } else if (currentY > lastScrollY.current + 20) {
          setShowToolbar(false); // scroll down -> hide
          setShowSettings(false);
          setShowDirectoryModal(false);
        } else if (currentY < lastScrollY.current - 20) {
          setShowToolbar(true); // scroll up -> show
        }
        lastScrollY.current = currentY;
      },
    }
  );

  const getFontFamilyStyle = () => {
    switch (fontFamily) {
      case 'serif':
        return { fontFamily: 'Georgia' };
      case 'mono':
        return { fontFamily: 'SpaceMono' };
      default:
        return { fontFamily: 'System' };
    }
  };

  const paragraphs = activeChapter.segs.map((seg: any) => seg.zh || '');

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.bg }]}>
      {/* Top Floating App Bar */}
      {showToolbar && (
        <View
          style={[
            styles.appBar,
            {
              backgroundColor: currentTheme.card,
              borderBottomColor: currentTheme.border,
              paddingTop: insets.top + SPACING.xs,
            },
          ]}
        >
          <Pressable
            onPress={async () => {
              await saveReadingProgress(currentProgressRef.current);
              router.back();
            }}
            style={styles.appBarButton}
          >
            <Ionicons name="arrow-back-outline" size={24} color={currentTheme.text} />
          </Pressable>
          <View style={styles.appBarTitleContainer}>
            <Text style={[styles.appBarTitle, { color: currentTheme.text }]} numberOfLines={1}>
              {bookData.meta.zhTitle}
            </Text>
            <Text style={[styles.appBarSubtitle, { color: currentTheme.text, opacity: 0.7 }]}>
              {bookData.meta.author}
            </Text>
          </View>
          <Pressable onPress={() => setIsBookmarked(!isBookmarked)} style={styles.appBarButton}>
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={isBookmarked ? currentTheme.accent : currentTheme.text}
            />
          </Pressable>
          <Pressable onPress={() => { setShowSettings(!showSettings); setShowDirectoryModal(false); }} style={styles.appBarButton}>
            <Ionicons name="text-outline" size={22} color={currentTheme.text} />
          </Pressable>
        </View>
      )}

      {/* Main Text Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 70,
            paddingBottom: insets.bottom + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.readingFlow}>
          {/* Article Header */}
          <Text style={[styles.articleTitle, { color: currentTheme.text }]}>
            {activeChapter.zh || bookData.meta.zhTitle}
          </Text>
          <Text style={[styles.articleAuthor, { color: currentTheme.text, opacity: 0.6 }]}>
            {bookData.meta.author} {bookData.meta.year ? `(${bookData.meta.year})` : ''}
          </Text>

          <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />

          {/* Reading Paragraphs */}
          {paragraphs.map((p: string, idx: number) => (
            <Text
              key={idx}
              style={[
                styles.paragraph,
                getFontFamilyStyle(),
                {
                  fontSize: fontSize,
                  color: currentTheme.text,
                  lineHeight: fontSize * 1.85,
                  marginBottom: fontSize * 1.2,
                },
              ]}
            >
              {p}
            </Text>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Floating Bar */}
      {showToolbar && (
        <View
          style={[
            styles.bottomToolbar,
            {
              backgroundColor: currentTheme.card,
              borderTopColor: currentTheme.border,
              paddingBottom: insets.bottom + 8,
            },
          ]}
        >
          <Pressable onPress={() => { setShowDirectoryModal(!showDirectoryModal); setShowSettings(false); }} style={styles.toolbarButton}>
            <Ionicons name="list-outline" size={20} color={currentTheme.text} />
            <Text style={[styles.toolbarText, { color: currentTheme.text }]}>目錄</Text>
          </Pressable>
          <Pressable style={styles.toolbarButton}>
            <Ionicons name="create-outline" size={20} color={currentTheme.text} />
            <Text style={[styles.toolbarText, { color: currentTheme.text }]}>批註</Text>
          </Pressable>
          <Pressable style={styles.toolbarButton}>
            <Ionicons name="share-social-outline" size={20} color={currentTheme.text} />
            <Text style={[styles.toolbarText, { color: currentTheme.text }]}>分享</Text>
          </Pressable>
        </View>
      )}

      {/* Settings Bottom Overlay Panel */}
      {showSettings && (
        <View
          style={[
            styles.settingsPanel,
            {
              backgroundColor: currentTheme.card,
              borderTopColor: currentTheme.border,
              paddingBottom: insets.bottom + SPACING.lg,
            },
          ]}
        >
          <Text style={[styles.panelTitle, { color: currentTheme.text }]}>閱讀設定</Text>

          {/* Font Size Settings */}
          <View style={styles.panelRow}>
            <Text style={[styles.panelLabel, { color: currentTheme.text }]}>字型大小</Text>
            <View style={styles.fontSizeControls}>
              <Pressable
                onPress={() => setFontSize(Math.max(12, fontSize - 2))}
                style={[styles.sizeButton, { borderColor: currentTheme.border }]}
              >
                <Text style={{ fontSize: 13, color: currentTheme.text, fontWeight: '700' }}>A-</Text>
              </Pressable>
              <Text style={[styles.fontSizeDisplay, { color: currentTheme.text }]}>{fontSize}</Text>
              <Pressable
                onPress={() => setFontSize(Math.min(32, fontSize + 2))}
                style={[styles.sizeButton, { borderColor: currentTheme.border }]}
              >
                <Text style={{ fontSize: 15, color: currentTheme.text, fontWeight: '700' }}>A+</Text>
              </Pressable>
            </View>
          </View>

          {/* Font Family Selector */}
          <View style={styles.panelRow}>
            <Text style={[styles.panelLabel, { color: currentTheme.text }]}>閱讀字體</Text>
            <View style={styles.fontFamilyRow}>
              {(['sans', 'serif', 'mono'] as const).map((font) => (
                <Pressable
                  key={font}
                  onPress={() => setFontFamily(font)}
                  style={[
                    styles.fontFamilyButton,
                    { borderColor: currentTheme.border },
                    fontFamily === font && { backgroundColor: currentTheme.accent + '20', borderColor: currentTheme.accent },
                  ]}
                >
                  <Text
                    style={[
                      styles.fontFamilyButtonText,
                      { color: fontFamily === font ? currentTheme.accent : currentTheme.text },
                    ]}
                  >
                    {font === 'sans' ? '黑體' : font === 'serif' ? '宋體' : '等寬'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Theme Selector */}
          <View style={styles.panelRow}>
            <Text style={[styles.panelLabel, { color: currentTheme.text }]}>閱讀背景</Text>
            <View style={styles.themeRow}>
              {(['paper', 'mint', 'charcoal', 'dark'] as const).map((theme) => {
                const isSelected = readerTheme === theme;
                return (
                  <Pressable
                    key={theme}
                    onPress={() => setReaderTheme(theme)}
                    style={[
                      styles.themeBubble,
                      { backgroundColor: THEME_COLORS[theme].bg, borderColor: THEME_COLORS[theme].border },
                      isSelected && { borderWidth: 2, borderColor: THEME_COLORS[theme].accent },
                    ]}
                  />
                );
              })}
            </View>
          </View>
        </View>
      )}

      {/* Directory Modal (目錄) */}
      {showDirectoryModal && (
        <View
          style={[
            styles.directoryModal,
            {
              backgroundColor: currentTheme.card,
              borderTopColor: currentTheme.border,
              paddingBottom: insets.bottom + SPACING.lg,
            },
          ]}
        >
          <View style={styles.directoryHeader}>
            <Text style={[styles.panelTitle, { color: currentTheme.text }]}>目錄 - {bookData.meta.zhTitle}</Text>
            <Pressable onPress={() => setShowDirectoryModal(false)}>
              <Ionicons name="close" size={24} color={currentTheme.text} />
            </Pressable>
          </View>
          <ScrollView style={styles.directoryList} showsVerticalScrollIndicator={false}>
            {bookData.chapters.map((ch: any, idx: number) => (
              <Pressable
                key={ch.id}
                onPress={() => {
                  setActiveChapterIndex(idx);
                  setShowDirectoryModal(false);
                  scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                }}
                style={({ pressed }) => [
                  styles.directoryItem,
                  { backgroundColor: activeChapterIndex === idx ? currentTheme.accent + '20' : 'transparent' },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text
                  style={[
                    styles.directoryText,
                    { color: activeChapterIndex === idx ? currentTheme.accent : currentTheme.text },
                    activeChapterIndex === idx && { fontWeight: '700' },
                  ]}
                  numberOfLines={1}
                >
                  {ch.label} {ch.zh}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 94,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  appBarButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appBarTitleContainer: {
    flex: 1,
    marginLeft: SPACING.xs,
    justifyContent: 'center',
  },
  appBarTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  appBarSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  readingFlow: {
    maxWidth: 680,
    alignSelf: 'center',
    width: '100%',
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  articleAuthor: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  divider: {
    height: 1,
    width: 60,
    alignSelf: 'center',
    marginBottom: SPACING.xl,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 30,
    textAlign: 'justify',
  },
  bottomToolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    zIndex: 10,
  },
  toolbarButton: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: SPACING.xs,
  },
  toolbarText: {
    fontSize: 10,
    fontWeight: '600',
  },
  settingsPanel: {
    position: 'absolute',
    bottom: 64,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    zIndex: 11,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  panelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  panelLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  sizeButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontSizeDisplay: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 20,
    textAlign: 'center',
  },
  fontFamilyRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  fontFamilyButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  fontFamilyButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  themeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  themeBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
  },
  directoryModal: {
    position: 'absolute',
    bottom: 64,
    left: 0,
    right: 0,
    height: 350,
    borderTopWidth: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    zIndex: 12,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
  },
  directoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  directoryList: {
    flex: 1,
  },
  directoryItem: {
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    marginBottom: 4,
  },
  directoryText: {
    fontSize: 14,
  },
});
