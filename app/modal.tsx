import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '@/constants/theme';

export default function AboutModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.handle} />

      <Text style={styles.brand}>BDFZ</Text>
      <Text style={styles.version}>v1.0.0</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>關於</Text>
        <Text style={styles.cardBody}>
          北大附中學習服務平台{'\n'}
          整合共讀書架、智批改、成績中心等學習工具{'\n'}
          為學生提供便捷高效的入口
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>技術棧</Text>
        <Text style={styles.cardBody}>
          React Native · Expo SDK 57{'\n'}
          Cloudflare Workers · D1 · R2{'\n'}
          統一帳號 · Session 橋接
        </Text>
      </View>

      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.closeBtnText}>關閉</Text>
      </Pressable>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textMuted,
    marginBottom: SPACING.xl,
  },
  brand: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 4,
  },
  version: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: SPACING.xl,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.accentLight,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  cardBody: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  closeBtn: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm + 4,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
