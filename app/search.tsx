import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ScrollView,
  FlatList,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, SPACING, RADIUS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ConnectionMode, SERVICES } from '@/constants/sites';

interface SearchResult {
  id: string;
  title: string;
  type: 'book' | 'tool';
  typeLabel: string;
  meta: string;
  url?: string;
  connectionMode?: ConnectionMode;
  category?: 'textbook' | 'reading';
}

const BOOKS_LIST = [
  { id: 'nahan', title: '吶喊', author: '魯迅', category: 'reading' as const, categoryLabel: '課外名著', meta: '共讀書架 • 魯迅 著' },
  { id: 'biancheng', title: '邊城', author: '沈從文', category: 'reading' as const, categoryLabel: '課外名著', meta: '共讀書架 • 沈從文 著' },
  { id: 'lunyu', title: '論語', author: '孔子與孔門弟子', category: 'textbook' as const, categoryLabel: '必修教材', meta: '經典研讀 • 孔子與孔門弟子 著' },
  { id: 'creative_writing', title: '創意寫作', author: '中學生', category: 'reading' as const, categoryLabel: '課外名著', meta: '創意寫作共同平台' },
];

export default function SearchScreen() {
  const router = useRouter();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  // States (no mock search history initially)
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  }, []);

  // Build the complete search database dynamically
  const ALL_RESULTS: SearchResult[] = [
    ...BOOKS_LIST.map(b => ({
      id: b.id,
      title: b.title,
      type: 'book' as const,
      typeLabel: b.categoryLabel,
      meta: b.meta,
      category: b.category,
    })),
    ...SERVICES.map(s => ({
      id: s.id,
      title: s.label,
      type: 'tool' as const,
      typeLabel: '工具服務',
      meta: s.accessibilityLabel || s.url,
      url: s.url,
      connectionMode: s.connectionMode,
    })),
  ];

  // Filtering
  const filteredResults = query.trim()
    ? ALL_RESULTS.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.meta.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleResultPress = (item: SearchResult) => {
    // Add to recents
    if (!recentSearches.includes(query) && query.trim()) {
      setRecentSearches([query, ...recentSearches.slice(0, 4)]);
    }

    if (item.type === 'book') {
      let targetUrl = 'https://coread.bdfz.net/';
      if (item.id === 'nahan') targetUrl = 'https://nh.bdfz.net/';
      else if (item.id === 'biancheng') targetUrl = 'https://bc.bdfz.net/';
      else if (item.id === 'lunyu') targetUrl = 'https://lun.bdfz.net/';
      else if (item.id === 'creative_writing') targetUrl = 'https://youthwrite.bdfz.net/';

      router.push({
        pathname: '/webview',
        params: { url: targetUrl, title: item.title },
      });
    } else if (item.type === 'tool') {
      if (item.connectionMode === ConnectionMode.EXTERNAL_BROWSER && item.url) {
        Linking.openURL(item.url).catch(() => {
          Alert.alert('無法開啟瀏覽器', '請確認網路與系統瀏覽器狀態。');
        });
        return;
      }
      router.push({
        pathname: '/webview',
        params: { url: item.url || 'https://my.bdfz.net/', title: item.title },
      });
    }
  };

  const handleChipPress = (val: string) => {
    setQuery(val);
  };

  const handleClearHistory = () => {
    setRecentSearches([]);
  };

  const renderResultItem = ({ item }: { item: SearchResult }) => {
    const iconName = item.type === 'book' ? 'book-outline' : 'construct-outline';
    return (
      <Pressable
        onPress={() => handleResultPress(item)}
        style={({ pressed }) => [
          styles.resultItem,
          { borderBottomColor: colors.separator },
          pressed && { backgroundColor: colors.bgSecondary },
        ]}
      >
        <View style={[styles.iconBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <Ionicons name={iconName} size={16} color={colors.accent} />
        </View>
        <View style={styles.resultDetails}>
          <View style={styles.resultHeader}>
            <Text style={[styles.resultTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={[styles.typeBadge, { backgroundColor: colors.accentMuted }]}>
              <Text style={[styles.typeBadgeText, { color: colors.accent }]}>{item.typeLabel}</Text>
            </View>
          </View>
          <Text style={[styles.resultMeta, { color: colors.textMuted }]} numberOfLines={1}>
            {item.meta}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary, paddingTop: Math.max(insets.top, SPACING.xs) }]}>
      {/* Top Search Input Box */}
      <View style={styles.searchHeader}>
        <View style={[styles.searchBar, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.textPrimary }]}
            placeholder="搜尋課本、文章、門戶服務..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
        <Pressable onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>取消</Text>
        </Pressable>
      </View>

      {/* Conditional Search views */}
      {!query.trim() ? (
        <ScrollView style={styles.historyScroll} contentContainerStyle={styles.historyContent}>
          {recentSearches.length > 0 && (
            <View style={styles.recentSection}>
              <View style={styles.recentHeaderRow}>
                <Text style={[styles.recentTitle, { color: colors.textSecondary }]}>最近搜尋</Text>
                <Pressable onPress={handleClearHistory}>
                  <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                </Pressable>
              </View>
              <View style={styles.chipsContainer}>
                {recentSearches.map((item, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => handleChipPress(item)}
                    style={[styles.chip, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
                  >
                    <Text style={[styles.chipText, { color: colors.textSecondary }]}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      ) : (
        <FlatList
          data={filteredResults}
          renderItem={renderResultItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.resultsList, { paddingBottom: insets.bottom + SPACING.lg }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                沒有搜尋到與 "{query}" 相關的結果
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  cancelBtn: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  historyScroll: {
    flex: 1,
  },
  historyContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  recentSection: {
    gap: SPACING.sm,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: 4,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  resultsList: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    gap: SPACING.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultDetails: {
    flex: 1,
    gap: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  typeBadge: {
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: RADIUS.xs,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  resultMeta: {
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
