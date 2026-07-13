import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  useWindowDimensions,
  FlatList,
  Image,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, SPACING, RADIUS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { isAuthenticated, fetchFromUserCenter } from '@/services/auth';

interface BookItem {
  id: string;
  title: string;
  author: string;
  category: 'textbook' | 'reading';
  categoryLabel: string;
  progress: number; // 0 to 1
  chaptersCount: number;
  coverColor: string;
  coverUrl?: string;
}

export default function LearnScreen() {
  const router = useRouter();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 600;
  const navigation = useNavigation();

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'textbook' | 'reading'>('all');

  const BOOKS: BookItem[] = [
    { id: 'nahan', title: '吶喊', author: '魯迅', category: 'reading', categoryLabel: '課外名著', progress: 0.0, chaptersCount: 15, coverColor: '#EEF2FF', coverUrl: 'https://img.bdfz.net/book-covers/nh.jpg' },
    { id: 'biancheng', title: '邊城', author: '沈從文', category: 'reading', categoryLabel: '課外名著', progress: 0.0, chaptersCount: 21, coverColor: '#F0FDFA', coverUrl: 'https://img.bdfz.net/book-covers/bc.jpg' },
    { id: 'lunyu', title: '論語', author: '孔子與孔門弟子', category: 'reading', categoryLabel: '課外名著', progress: 0.0, chaptersCount: 20, coverColor: '#FEF3C7', coverUrl: 'https://img.bdfz.net/book-covers/lun.jpg' },
    { id: 'creative_writing', title: '創意寫作', author: '中學生', category: 'reading', categoryLabel: '課外名著', progress: 0.0, chaptersCount: 1, coverColor: '#225E87' },
    { id: 'yw_textbook', title: '語文課本', author: '普通高中教科書', category: 'textbook', categoryLabel: '必修教材', progress: 0.0, chaptersCount: 12, coverColor: '#A82C18', coverUrl: 'https://img.bdfz.net/20250503004.webp' },
  ];

  const [books, setBooks] = useState<BookItem[]>(BOOKS);

  const loadProgress = async () => {
    try {
      const isAuth = await isAuthenticated();
      if (!isAuth) {
        setBooks(BOOKS);
        return;
      }
      const data = await fetchFromUserCenter('/api/progress');
      if (data && Array.isArray(data.items)) {
        const updatedBooks = BOOKS.map(book => {
          let match = null;
          if (book.id === 'nahan') {
            match = data.items.find((item: any) => item.siteKey === 'nh');
          } else if (book.id === 'biancheng') {
            match = data.items.find((item: any) => item.siteKey === 'bc');
          } else if (book.id === 'lunyu') {
            match = data.items.find((item: any) => item.siteKey === 'lun' || item.siteKey === 'kz');
          } else if (book.id === 'creative_writing') {
            match = data.items.find((item: any) => item.siteKey === 'youthwrite');
          } else if (book.id === 'yw_textbook') {
            match = data.items.find((item: any) => item.siteKey === 'yw' || item.itemTitle === '語文課本');
          }

          if (match) {
            return {
              ...book,
              progress: (match.meta?.progressPercent || match.score || 0) / 100,
            };
          }
          return book;
        });
        setBooks(updatedBooks);
      }
    } catch (err) {
      console.warn('Failed to fetch learning progress:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProgress();
    });
    loadProgress();
    return unsubscribe;
  }, [navigation]);

  // Filtering
  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.includes(searchQuery) || book.author.includes(searchQuery);
    const matchesCategory = activeCategory === 'all' || book.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBookPress = (book: BookItem) => {
    let targetUrl = 'https://coread.bdfz.net/';
    if (book.id === 'nahan') targetUrl = 'https://nh.bdfz.net/';
    else if (book.id === 'biancheng') targetUrl = 'https://bc.bdfz.net/';
    else if (book.id === 'lunyu') targetUrl = 'https://lun.bdfz.net/';
    else if (book.id === 'creative_writing') targetUrl = 'https://youthwrite.bdfz.net/';
    else if (book.id === 'yw_textbook') targetUrl = 'https://yw.bdfz.net/';

    router.push({
      pathname: '/webview',
      params: {
        url: targetUrl,
        title: book.title,
      },
    });
  };

  const renderBookCard = ({ item }: { item: BookItem }) => {
    return (
      <Pressable
        onPress={() => handleBookPress(item)}
        style={({ pressed }) => [
          styles.bookCard,
          { backgroundColor: colors.bgSecondary, borderColor: colors.border },
          pressed && { opacity: 0.95 },
        ]}
      >
        {/* Book cover simulator */}
        <View style={[styles.bookCover, { backgroundColor: item.coverColor, overflow: 'hidden' }]}>
          {item.coverUrl ? (
            <Image
              source={{ uri: item.coverUrl }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : (
            <>
              <Text style={[styles.coverText, { color: '#FFFFFF' }]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={[styles.coverAuthor, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                {item.author}
              </Text>
              <View style={[styles.coverTag, { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }]}>
                <Text style={[styles.coverTagText, { color: colors.accent }]}>
                  {item.categoryLabel}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Book info details */}
        <View style={styles.bookInfo}>
          <Text style={[styles.bookTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.bookAuthor, { color: colors.textMuted }]}>
            [著] {item.author}
          </Text>
          <Text style={[styles.bookMeta, { color: colors.textMuted }]}>
            共 {item.chaptersCount} 章節
          </Text>

          <View style={styles.progressRow}>
            <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.accent, width: `${item.progress * 100}%` }]} />
            </View>
            <Text style={[styles.progressPercent, { color: colors.textSecondary }]}>
              {Math.round(item.progress * 100)}%
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary, paddingTop: Math.max(insets.top, SPACING.md) }]}>
      {/* Title Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>披覽 · 學習矩陣</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          研讀經典課文、精讀必考科目與共讀名著
        </Text>
      </View>

      {/* Filter Options */}
      <View style={styles.filterRow}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="搜尋書名或作者..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.tabsRow}>
          {(['all', 'textbook', 'reading'] as const).map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.tabButton,
                activeCategory === cat && { backgroundColor: colors.accentMuted, borderColor: colors.accent },
              ]}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  { color: activeCategory === cat ? colors.accent : colors.textSecondary },
                  activeCategory === cat && { fontWeight: '600' },
                ]}
              >
                {cat === 'all' ? '全部' : cat === 'textbook' ? '必修教材' : '課外名著'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Grid or List list representation */}
      <FlatList
        data={filteredBooks}
        renderItem={renderBookCard}
        keyExtractor={(item) => item.id}
        numColumns={isWide ? 2 : 1}
        key={isWide ? 'grid' : 'list'}
        contentContainerStyle={[styles.booksList, { paddingBottom: insets.bottom + SPACING.xl }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              沒有找到符合的書籍
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  filterRow: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  searchInput: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    fontSize: 14,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: 2,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  booksList: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  bookCard: {
    flex: 1,
    flexDirection: 'row',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.md,
    marginHorizontal: 2,
  },
  bookCover: {
    width: 90,
    height: 120,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    padding: SPACING.sm,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  coverText: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  coverAuthor: {
    fontSize: 10,
    fontWeight: '600',
  },
  coverTag: {
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  coverTagText: {
    fontSize: 8,
    fontWeight: '700',
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  bookAuthor: {
    fontSize: 12,
    fontWeight: '500',
  },
  bookMeta: {
    fontSize: 11,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 8,
  },
  progressBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
