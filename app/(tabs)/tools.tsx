import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  useWindowDimensions,
  Linking,
  Alert,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, SPACING, RADIUS } from '@/constants/theme';
import { CATEGORIES, ConnectionMode, SiteLink, SiteCategory } from '@/constants/sites';
import { Ionicons } from '@expo/vector-icons';
import { isAuthenticated, fetchFromUserCenter } from '@/services/auth';

export default function ToolsScreen() {
  const router = useRouter();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 600;
  const navigation = useNavigation();

  // Tabs: 'services' for links directory, 'data' for visualizations
  const [activeSection, setActiveSection] = useState<'services' | 'data'>('services');
  const [authed, setAuthed] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const loadDashboard = async () => {
    try {
      const isAuth = await isAuthenticated();
      setAuthed(isAuth);
      if (isAuth) {
        const data = await fetchFromUserCenter('/api/dashboard');
        setDashboardData(data);
      } else {
        setDashboardData(null);
      }
    } catch (err) {
      console.warn('Failed to load dashboard in ToolsScreen:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboard();
    });
    loadDashboard();
    return unsubscribe;
  }, [navigation]);

  // Compute stats and weeklyStudyHours
  const attendanceRate = authed
    ? Math.max(70, 100 - (dashboardData?.seiue?.absences?.total || 0) * 1.5).toFixed(1) + '%'
    : 'N/A';

  const weeklyDoneCount = authed ? dashboardData?.summary?.completedItems || 0 : 0;

  const totalStudyHours = authed
    ? ((dashboardData?.summary?.completedItems || 0) * 0.8 + (dashboardData?.summary?.conversations || 0) * 0.4).toFixed(1) + 'h'
    : '0h';

  // Weekly study hours wave (Hours computed dynamically from 7-day activity frequency)
  const getWeeklyStudyHours = () => {
    const defaultHours = [
      { day: '周一', hours: 0 },
      { day: '周二', hours: 0 },
      { day: '周三', hours: 0 },
      { day: '周四', hours: 0 },
      { day: '周五', hours: 0 },
      { day: '周六', hours: 0 },
      { day: '周日', hours: 0 },
    ];
    if (!authed || !dashboardData || !Array.isArray(dashboardData.activity)) {
      return defaultHours;
    }

    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(dateStr => {
      const dayActivities = dashboardData.activity.filter((a: any) => a.timestamp?.startsWith(dateStr)) || [];
      const hours = dayActivities.length > 0 ? 1.5 + dayActivities.length * 1.2 : 0.0;
      const dayLabel = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(dateStr).getDay()];
      return {
        day: dayLabel,
        hours: Math.min(10, hours),
      };
    });
  };

  const weeklyStudyHours = getWeeklyStudyHours();
  const maxHours = Math.max(...weeklyStudyHours.map((d) => d.hours)) || 1.0;

  // Subject completion rate mapping
  const subjectProgress = [
    { name: '語文基礎背誦', rate: authed ? (dashboardData?.progress?.sites?.find((s: any) => s.siteKey === 'mf')?.completionRate || 0) / 100 : 0.0, color: colors.accent },
    { name: '文言字詞義戰', rate: authed ? (dashboardData?.progress?.sites?.find((s: any) => s.siteKey === 'wy')?.completionRate || 0) / 100 : 0.0, color: colors.accentSecondary },
    { name: '課文共讀精讀', rate: authed ? (dashboardData?.progress?.overallCompletionRate || 0) / 100 : 0.0, color: colors.info },
  ];

  const handleLinkPress = async (link: SiteLink) => {
    if (link.connectionMode === ConnectionMode.EXTERNAL_BROWSER) {
      try {
        await Linking.openURL(link.href);
      } catch {
        Alert.alert('無法開啟瀏覽器', '請確認網路與系統瀏覽器狀態。');
      }
      return;
    }
    router.push({
      pathname: '/webview',
      params: { url: link.href, title: link.label },
    });
  };

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'learning': return 'flash-outline';
      case 'reference': return 'document-text-outline';
      case 'community': return 'chatbubbles-outline';
      case 'reading': return 'library-outline';
      case 'tools': return 'construct-outline';
      default: return 'construct-outline';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary, paddingTop: Math.max(insets.top, SPACING.md) }]}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>器用 & 數據</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          快速接入學伴工具箱，直觀追蹤今日學業波動
        </Text>
      </View>

      {/* Main tab switch */}
      <View style={[styles.tabContainer, { borderBottomColor: colors.separator }]}>
        <Pressable
          onPress={() => setActiveSection('services')}
          style={[styles.tabButton, activeSection === 'services' && { borderBottomColor: colors.accent }]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeSection === 'services' ? colors.accent : colors.textMuted },
              activeSection === 'services' && { fontWeight: '700' },
            ]}
          >
            工具矩陣
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveSection('data')}
          style={[styles.tabButton, activeSection === 'data' && { borderBottomColor: colors.accent }]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeSection === 'data' ? colors.accent : colors.textMuted },
              activeSection === 'data' && { fontWeight: '700' },
            ]}
          >
            學業數據
          </Text>
        </Pressable>
      </View>

      {/* Content Scroller */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeSection === 'services' ? (
          <View style={styles.servicesGrid}>
            {CATEGORIES.map((category) => (
              <View
                key={category.id}
                style={[styles.catSection, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
              >
                {/* Category Header */}
                <View style={styles.catHeader}>
                  <Ionicons name={getCategoryIcon(category.id) as any} size={18} color={colors.accent} />
                  <Text style={[styles.catLabel, { color: colors.textPrimary }]}>{category.label}</Text>
                  <Text style={[styles.nodeCountText, { color: colors.textMuted }]}>
                    {category.links.length} 個節點
                  </Text>
                </View>

                {/* Grid of Site Links */}
                <View style={styles.linksWrapper}>
                  {category.links.map((link, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => handleLinkPress(link)}
                      style={({ pressed }) => [
                        styles.linkBtn,
                        { backgroundColor: colors.bgPrimary, borderColor: colors.border },
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <Text style={[styles.linkBtnText, { color: colors.textSecondary }]} numberOfLines={1}>
                        {link.label}
                      </Text>
                      <Ionicons name="chevron-forward" size={12} color={colors.textMuted} />
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ) : (
          authed ? (
            <View style={styles.dataDashboard}>
              {/* Grid for statistics in wide view */}
              <View style={isWide ? styles.wideRow : null}>
                {/* Summary Statistics Card */}
                <View
                  style={[
                    styles.dataCard,
                    { backgroundColor: colors.bgSecondary, borderColor: colors.border },
                    isWide && styles.wideHalf,
                  ]}
                >
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>學業摘要</Text>
                  <View style={styles.statsSummaryGrid}>
                    <View style={styles.statSummaryItem}>
                      <Text style={[styles.statValue, { color: colors.accent }]}>{attendanceRate}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>希悅出勤率</Text>
                    </View>
                    <View style={styles.statSummaryItem}>
                      <Text style={[styles.statValue, { color: colors.accentSecondary }]}>{weeklyDoneCount}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>本周完成指令</Text>
                    </View>
                    <View style={styles.statSummaryItem}>
                      <Text style={[styles.statValue, { color: colors.info }]}>{totalStudyHours}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>累計自主研讀</Text>
                    </View>
                  </View>
                </View>

                {/* Progress bar charts */}
                <View
                  style={[
                    styles.dataCard,
                    { backgroundColor: colors.bgSecondary, borderColor: colors.border },
                    isWide && styles.wideHalf,
                  ]}
                >
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>專題完成率</Text>
                  <View style={styles.progressBarsList}>
                    {subjectProgress.map((sub, idx) => (
                      <View key={idx} style={styles.progressBarItem}>
                        <View style={styles.progressBarHeader}>
                          <Text style={[styles.progressBarLabel, { color: colors.textSecondary }]}>
                            {sub.name}
                          </Text>
                          <Text style={[styles.progressBarPercent, { color: colors.textSecondary }]}>
                            {Math.round(sub.rate * 100)}%
                          </Text>
                        </View>
                        <View style={[styles.barBg, { backgroundColor: colors.border }]}>
                          <View style={[styles.barFill, { backgroundColor: sub.color, width: `${sub.rate * 100}%` }]} />
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* Custom Bar Chart - Weekly Study Hours */}
              <View style={[styles.dataCard, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>近七日研讀時數波形 (小時)</Text>

                <View style={styles.chartContainer}>
                  {weeklyStudyHours.map((d, idx) => {
                    const barHeight = maxHours > 0 ? (d.hours / maxHours) * 120 : 0; // max height 120
                    return (
                      <View key={idx} style={styles.chartCol}>
                        <Text style={[styles.chartValText, { color: colors.textSecondary }]}>
                          {d.hours.toFixed(1)}
                        </Text>
                        <View style={[styles.chartBarBg, { backgroundColor: colors.border }]}>
                          <View
                            style={[
                              styles.chartBarFill,
                              { backgroundColor: colors.accent, height: barHeight },
                            ]}
                          />
                        </View>
                        <Text style={[styles.chartLabel, { color: colors.textMuted }]}>{d.day}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          ) : (
            <View style={[styles.dataCard, { backgroundColor: colors.bgSecondary, borderColor: colors.border, alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.md }]}>
              <Ionicons name="stats-chart-outline" size={32} color={colors.textMuted} />
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 18, paddingHorizontal: SPACING.md }}>
                連接帳號後即可在此查看今日學習時數及學業數據波形
              </Text>
              <Pressable
                onPress={() => router.push('/(tabs)/me')}
                style={({ pressed }) => [
                  { backgroundColor: colors.accent, paddingVertical: 8, paddingHorizontal: 16, borderRadius: RADIUS.md },
                  pressed && { opacity: 0.8 }
                ]}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>前往連接帳號</Text>
              </Pressable>
            </View>
          )
        )}
      </ScrollView>
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
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  tabButton: {
    paddingVertical: SPACING.md,
    marginRight: SPACING.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
  },
  servicesGrid: {
    gap: SPACING.md,
  },
  catSection: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.md,
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  catLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  nodeCountText: {
    fontSize: 11,
    marginLeft: 'auto',
    fontWeight: '500',
  },
  linksWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  linkBtn: {
    width: '48%', // dynamic double column
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  linkBtnText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  dataDashboard: {
    gap: SPACING.md,
  },
  wideRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  wideHalf: {
    flex: 1,
  },
  dataCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  statsSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  statSummaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  progressBarsList: {
    gap: SPACING.sm,
  },
  progressBarItem: {
    gap: SPACING.xs,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarPercent: {
    fontSize: 11,
    fontWeight: '600',
  },
  barBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: SPACING.md,
  },
  chartCol: {
    alignItems: 'center',
    flex: 1,
  },
  chartValText: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  chartBarBg: {
    width: 14,
    height: 120,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 7,
  },
  chartLabel: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
  },
});
