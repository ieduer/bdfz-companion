import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RADIUS, SPACING, useTheme } from '@/constants/theme';
import {
  FeedbackCategory,
  FeedbackRequestError,
  FeedbackSeverity,
  submitAppFeedback,
} from '@/services/feedback';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const CATEGORIES: Array<{ value: FeedbackCategory; label: string; icon: IoniconName }> = [
  { value: 'bug', label: '錯誤', icon: 'bug-outline' },
  { value: 'content', label: '內容', icon: 'document-text-outline' },
  { value: 'ui', label: '介面', icon: 'phone-portrait-outline' },
  { value: 'idea', label: '建議', icon: 'bulb-outline' },
  { value: 'account', label: '帳號', icon: 'person-circle-outline' },
  { value: 'other', label: '其他', icon: 'ellipsis-horizontal-circle-outline' },
];

const SEVERITIES: Array<{ value: FeedbackSeverity; label: string }> = [
  { value: 'low', label: '輕微' },
  { value: 'normal', label: '一般' },
  { value: 'high', label: '影響使用' },
  { value: 'urgent', label: '無法使用' },
];

export default function FeedbackScreen() {
  const router = useRouter();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [category, setCategory] = useState<FeedbackCategory>('bug');
  const [severity, setSeverity] = useState<FeedbackSeverity>('normal');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ feedbackId: string; notified: boolean } | null>(null);

  const handleSubmit = async () => {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    if (!cleanTitle || !cleanDescription) {
      setError('請填寫標題與詳細內容。');
      return;
    }

    Keyboard.dismiss();
    setSubmitting(true);
    setError('');
    setSuccess(null);
    try {
      const result = await submitAppFeedback({
        category,
        severity,
        title: cleanTitle,
        description: cleanDescription,
        reporterContact: contact,
      });
      setSuccess({
        feedbackId: result.feedbackId,
        notified: result.notification?.channel === 'telegram' && result.notification.sent === true,
      });
      setTitle('');
      setDescription('');
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      });
    } catch (requestError) {
      if (requestError instanceof FeedbackRequestError && requestError.status === 429) {
        setError('提交過於頻繁，請十分鐘後再試。');
      } else {
        setError('提交失敗，請檢查網絡後重試。你的內容仍保留在本頁。');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.bgPrimary }]}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + SPACING.xs,
            backgroundColor: colors.bgPrimary,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          accessibilityLabel="返回"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>意見反饋</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>直接送達 BDFZ 開發者</Text>
        </View>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(insets.bottom, SPACING.md) + SPACING.xl,
            width: Math.min(width, 760),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.introCard, { backgroundColor: colors.accentMuted, borderColor: colors.accent }]}>
          <View style={[styles.introIcon, { backgroundColor: colors.accent }]}>
            <Ionicons name="paper-plane" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.introCopy}>
            <Text style={[styles.introTitle, { color: colors.textPrimary }]}>你寫，我直接收到</Text>
            <Text style={[styles.introBody, { color: colors.textSecondary }]}>反饋會安全保存，並推送到開發者 Telegram。請勿填寫密碼、驗證碼或其他私密憑據。</Text>
          </View>
        </View>

        {success && (
          <View
            accessibilityLiveRegion="polite"
            style={[
              styles.statusCard,
              {
                backgroundColor: success.notified ? `${colors.success}18` : `${colors.warning}18`,
                borderColor: success.notified ? colors.success : colors.warning,
              },
            ]}
          >
            <Ionicons
              name={success.notified ? 'checkmark-circle' : 'time-outline'}
              size={24}
              color={success.notified ? colors.success : colors.warning}
            />
            <View style={styles.statusCopy}>
              <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
                {success.notified ? '已推送到開發者 Telegram' : '已保存，Telegram 推送待確認'}
              </Text>
              <Text style={[styles.statusBody, { color: colors.textMuted }]} numberOfLines={1}>
                反饋編號：{success.feedbackId}
              </Text>
            </View>
          </View>
        )}

        <FormSection title="反饋類型" colors={colors}>
          <View style={styles.chipGrid}>
            {CATEGORIES.map((item) => {
              const selected = category === item.value;
              return (
                <Pressable
                  key={item.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => setCategory(item.value)}
                  style={({ pressed }) => [
                    styles.categoryChip,
                    {
                      backgroundColor: selected ? colors.accentMuted : colors.bgSecondary,
                      borderColor: selected ? colors.accent : colors.border,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name={item.icon} size={18} color={selected ? colors.accent : colors.textMuted} />
                  <Text style={[styles.chipText, { color: selected ? colors.accent : colors.textSecondary }]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </FormSection>

        <FormSection title="影響程度" colors={colors}>
          <View style={[styles.segmented, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            {SEVERITIES.map((item) => {
              const selected = severity === item.value;
              return (
                <Pressable
                  key={item.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => setSeverity(item.value)}
                  style={({ pressed }) => [
                    styles.segment,
                    selected && { backgroundColor: colors.accent },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.segmentText, { color: selected ? '#FFFFFF' : colors.textMuted }]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </FormSection>

        <FormSection title="標題" colors={colors}>
          <TextInput
            accessibilityLabel="反饋標題"
            autoCapitalize="sentences"
            maxLength={160}
            onChangeText={setTitle}
            placeholder="一句話說明問題或建議"
            placeholderTextColor={colors.textMuted}
            returnKeyType="next"
            style={[styles.input, { backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.textPrimary }]}
            value={title}
          />
          <Text style={[styles.counter, { color: colors.textMuted }]}>{title.length}/160</Text>
        </FormSection>

        <FormSection title="詳細內容" colors={colors}>
          <TextInput
            accessibilityLabel="反饋詳細內容"
            maxLength={6000}
            multiline
            onChangeText={setDescription}
            placeholder="請描述發生了什麼、你期望的結果，以及可重現步驟"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              styles.descriptionInput,
              { backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.textPrimary },
            ]}
            textAlignVertical="top"
            value={description}
          />
          <Text style={[styles.counter, { color: colors.textMuted }]}>{description.length}/6000</Text>
        </FormSection>

        <FormSection title="聯絡方式（選填）" colors={colors}>
          <TextInput
            accessibilityLabel="聯絡方式"
            autoCapitalize="none"
            maxLength={240}
            onChangeText={setContact}
            placeholder="論壇名、郵箱或其他方便聯絡的方式"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.textPrimary }]}
            value={contact}
          />
        </FormSection>

        {error ? <Text accessibilityLiveRegion="polite" style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

        <Pressable
          accessibilityLabel="提交反饋"
          accessibilityRole="button"
          accessibilityState={{ disabled: submitting }}
          disabled={submitting}
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.submitButton,
            { backgroundColor: colors.accent },
            (pressed || submitting) && styles.submitPressed,
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="paper-plane-outline" size={19} color="#FFFFFF" />
              <Text style={styles.submitText}>提交並推送</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FormSection({
  title,
  colors,
  children,
}: {
  title: string;
  colors: ReturnType<typeof useTheme>;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    minHeight: 72,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  headerSubtitle: { fontSize: 11, marginTop: 2 },
  scrollContent: { alignSelf: 'center', paddingHorizontal: SPACING.md, paddingTop: SPACING.lg },
  introCard: {
    flexDirection: 'row',
    gap: SPACING.md,
    borderWidth: 1,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  introIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  introCopy: { flex: 1 },
  introTitle: { fontSize: 15, fontWeight: '800', marginBottom: SPACING.xs },
  introBody: { fontSize: 13, lineHeight: 20 },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statusCopy: { flex: 1 },
  statusTitle: { fontSize: 14, fontWeight: '800' },
  statusBody: { fontSize: 11, marginTop: 3 },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: SPACING.sm },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  categoryChip: {
    minWidth: '30%',
    flexGrow: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  chipText: { fontSize: 13, fontWeight: '700' },
  segmented: { flexDirection: 'row', borderWidth: 1, borderRadius: RADIUS.lg, padding: 3 },
  segment: { flex: 1, minHeight: 40, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  segmentText: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 13,
    fontSize: 15,
  },
  descriptionInput: { minHeight: 150, lineHeight: 22 },
  counter: { alignSelf: 'flex-end', fontSize: 10, marginTop: SPACING.xs },
  errorText: { fontSize: 13, lineHeight: 20, marginBottom: SPACING.md },
  submitButton: {
    minHeight: 54,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  submitPressed: { opacity: 0.72 },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.72 },
});
