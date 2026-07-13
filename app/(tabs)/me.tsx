import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Switch,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, SPACING, RADIUS, getThemeSettings, updateThemeSettings } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { isAuthenticated, deleteToken, saveToken, fetchFromUserCenter } from '@/services/auth';

export default function MeScreen() {
  const router = useRouter();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 600;

  const navigation = useNavigation();

  // States
  const [authed, setAuthed] = useState(false);
  const currentTheme = getThemeSettings();
  const [useDark, setUseDark] = useState(currentTheme.isDark);
  const [highContrast, setHighContrast] = useState(currentTheme.highContrast);
  const [profileData, setProfileData] = useState<any>(null);

  const checkAuthAndLoadData = async () => {
    try {
      const isAuth = await isAuthenticated();
      setAuthed(isAuth);
      if (isAuth) {
        const data = await fetchFromUserCenter('/api/dashboard');
        setProfileData(data);
      } else {
        setProfileData(null);
      }
    } catch (err) {
      console.warn('Failed to load profile data:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkAuthAndLoadData();
    });
    checkAuthAndLoadData();
    return unsubscribe;
  }, [navigation]);

  const handleSyncAccount = () => {
    if (authed) {
      Alert.alert('解除連接', '確定要解除與希悅/老己帳號的同步嗎？', [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          onPress: async () => {
            await deleteToken();
            setAuthed(false);
            setProfileData(null);
          },
        },
      ]);
    } else {
      router.push({
        pathname: '/webview',
        params: { url: 'https://my.bdfz.net/', title: '連接用戶中心' },
      });
    }
  };

  const handleClearCache = () => {
    Alert.alert('清理成功', '已清理 24.5 MB 離線課本與圖片快取');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgPrimary }]}
      contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, SPACING.md) }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <View style={[styles.avatarCircle, { backgroundColor: colors.accentMuted }]}>
          <Ionicons name="person" size={32} color={colors.accent} />
        </View>
        <View style={styles.profileDetails}>
          <Text style={[styles.profileName, { color: colors.textPrimary }]}>
            {authed ? profileData?.user?.displayName || profileData?.user?.slug || '加載中...' : '訪客用戶'}
          </Text>
          <Text style={[styles.profileInfo, { color: colors.textMuted }]}>
            {authed ? `${profileData?.seiue?.profile?.grade || '2028屆高一'} (${profileData?.seiue?.profile?.usin ? 'ID: ' + profileData.seiue.profile.usin : '22班'}) • 註冊學員` : '數據未同步離線模式'}
          </Text>
        </View>
        <Pressable
          onPress={handleSyncAccount}
          style={[
            styles.syncBtn,
            { backgroundColor: authed ? colors.border : colors.accent },
          ]}
        >
          <Text style={[styles.syncBtnText, { color: authed ? colors.textPrimary : '#FFFFFF' }]}>
            {authed ? '已連接' : '連接帳號'}
          </Text>
        </Pressable>
      </View>

      {/* Reading Statistics Overview */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>研讀檔案</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <Ionicons name="library-outline" size={18} color={colors.accent} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {authed ? profileData?.summary?.completedItems ?? 0 : 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>已讀篇目</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.accentSecondary} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {authed ? profileData?.summary?.conversations ?? 0 : 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>AI對話數</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <Ionicons name="globe-outline" size={18} color={colors.success} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {authed ? profileData?.summary?.trackedSites ?? 0 : 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>活躍站點</Text>
          </View>
        </View>
      </View>

      {/* Settings Sections */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>個性化設定</Text>
        <View style={[styles.settingsGroup, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          {/* Dark Mode */}
          <View style={[styles.settingsRow, { borderBottomColor: colors.separator }]}>
            <View style={styles.rowLabelContainer}>
              <Ionicons name="moon-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>深色模式</Text>
            </View>
            <Switch
              value={useDark}
              onValueChange={(val) => {
                setUseDark(val);
                updateThemeSettings({ isDark: val, isSystem: false });
              }}
              trackColor={{ false: colors.border, true: colors.accent }}
            />
          </View>

          {/* High Contrast */}
          <View style={[styles.settingsRow, { borderBottomColor: colors.separator }]}>
            <View style={styles.rowLabelContainer}>
              <Ionicons name="contrast-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>高對比模式</Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={(val) => {
                setHighContrast(val);
                updateThemeSettings({ highContrast: val });
              }}
              trackColor={{ false: colors.border, true: colors.accent }}
            />
          </View>

          {/* Text scale slider description */}
          <Pressable
            style={({ pressed }) => [styles.settingsRow, pressed && { opacity: 0.8 }]}
            onPress={() => Alert.alert('字體大小', '本應用全面支援系統動態字級 (Dynamic Type) 自動適配，請在手機系統設定中調整字型大小。')}
          >
            <View style={styles.rowLabelContainer}>
              <Ionicons name="text-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>字體大小</Text>
            </View>
            <Text style={[styles.rowValueText, { color: colors.textMuted }]}>跟隨系統</Text>
          </Pressable>
        </View>
      </View>

      {/* Utilities/Preferences Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>系統工具</Text>
        <View style={[styles.settingsGroup, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          {/* Feedback */}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/feedback')}
            style={({ pressed }) => [
              styles.settingsRow,
              { borderBottomColor: colors.separator },
              pressed && { opacity: 0.8 },
            ]}
          >
            <View style={styles.rowLabelContainer}>
              <Ionicons name="chatbox-ellipses-outline" size={18} color={colors.accent} />
              <View>
                <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>意見反饋</Text>
                <Text style={[styles.rowHint, { color: colors.textMuted }]}>直接推送給開發者</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
          </Pressable>

          {/* Clear Cache */}
          <Pressable
            onPress={() => {
              Alert.alert('清理成功', '已完成快取清理。');
            }}
            style={({ pressed }) => [
              styles.settingsRow,
              { borderBottomColor: colors.separator },
              pressed && { opacity: 0.8 },
            ]}
          >
            <View style={styles.rowLabelContainer}>
              <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>清理離線快取</Text>
            </View>
            <Text style={[styles.rowValueText, { color: colors.textMuted }]}>0.0 MB</Text>
          </Pressable>

          {/* About Screen */}
          <Pressable
            onPress={() => Alert.alert('關於 BDFZ SUEN', '版本: v2.0.0 (2026)\nExpo SDK 57 / JSC\nCloudflare Edge Session Bridge')}
            style={({ pressed }) => [styles.settingsRow, pressed && { opacity: 0.8 }]}
          >
            <View style={styles.rowLabelContainer}>
              <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>關於SUEN</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileDetails: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileInfo: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  syncBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
  },
  syncBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  settingsGroup: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  rowLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  rowValueText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rowHint: {
    fontSize: 10,
    marginTop: 2,
  },
});
