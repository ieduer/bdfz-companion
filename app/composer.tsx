import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, SPACING, RADIUS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const DRAFT_TITLE_KEY = 'bdfz_composer_draft_title';
const DRAFT_BODY_KEY = 'bdfz_composer_draft_body';

export default function ComposerScreen() {
  const router = useRouter();
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  // States
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const savedTitle = await SecureStore.getItemAsync(DRAFT_TITLE_KEY);
        const savedBody = await SecureStore.getItemAsync(DRAFT_BODY_KEY);
        if (savedTitle) setTitle(savedTitle);
        if (savedBody) setBody(savedBody);
      } catch (e) {
        console.error('Failed to load draft', e);
      }
    };
    loadDraft();
  }, []);

  // Save draft on change
  const saveDraft = async (t: string, b: string) => {
    try {
      await SecureStore.setItemAsync(DRAFT_TITLE_KEY, t);
      await SecureStore.setItemAsync(DRAFT_BODY_KEY, b);
    } catch (e) {
      console.error('Failed to save draft', e);
    }
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    saveDraft(text, body);
  };

  const handleBodyChange = (text: string) => {
    setBody(text);
    saveDraft(title, text);
  };

  // Helper to insert formatting tags
  const insertFormat = (tagStart: string, tagEnd = '') => {
    // Basic append to body for simple mobile use
    const newBody = body + tagStart + tagEnd;
    setBody(newBody);
    saveDraft(title, newBody);
  };

  const handleAttachFile = () => {
    // Simulate picking file
    const mockFiles = ['learning_notes.pdf', 'recitation_record.m4a', 'textbook_screenshot.png'];
    const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    if (attachments.includes(randomFile)) return;
    setAttachments([...attachments, randomFile]);
  };

  const handlePublish = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('提示', '請填寫標題與內容');
      return;
    }

    // Simulate sending to forum
    Alert.alert('發布成功', '帖子已發布至彣彰論壇', [
      {
        text: '確定',
        onPress: async () => {
          // Clear draft
          await SecureStore.deleteItemAsync(DRAFT_TITLE_KEY);
          await SecureStore.deleteItemAsync(DRAFT_BODY_KEY);
          router.back();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.bgPrimary }]}
    >
      {/* Header */}
      <View
        style={[
          styles.appBar,
          {
            backgroundColor: colors.bgSecondary,
            borderBottomColor: colors.border,
            paddingTop: insets.top + SPACING.xs,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.appBarButton}>
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>取消</Text>
        </Pressable>
        <Text style={[styles.appBarTitle, { color: colors.textPrimary }]}>撰寫帖子</Text>
        <Pressable onPress={handlePublish} style={[styles.publishButton, { backgroundColor: colors.accent }]}>
          <Text style={styles.publishButtonText}>發布</Text>
        </Pressable>
      </View>

      {/* Editor or Preview Pane */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabToggleRow}>
          <Pressable
            onPress={() => setIsPreview(false)}
            style={[styles.tabToggleBtn, !isPreview && { borderBottomColor: colors.accent }]}
          >
            <Text style={[styles.tabToggleText, { color: !isPreview ? colors.accent : colors.textMuted }]}>
              編輯
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setIsPreview(true)}
            style={[styles.tabToggleBtn, isPreview && { borderBottomColor: colors.accent }]}
          >
            <Text style={[styles.tabToggleText, { color: isPreview ? colors.accent : colors.textMuted }]}>
              預覽
            </Text>
          </Pressable>
        </View>

        {!isPreview ? (
          <View style={styles.formContainer}>
            {/* Title Input */}
            <TextInput
              style={[styles.titleInput, { color: colors.textPrimary }]}
              placeholder="請輸入標題..."
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={handleTitleChange}
            />
            <View style={[styles.lineDivider, { backgroundColor: colors.border }]} />

            {/* Body Input */}
            <TextInput
              style={[styles.bodyInput, { color: colors.textPrimary }]}
              placeholder="分享你的想法、研讀問題、筆記或學習心得... (支援 Markdown)"
              placeholderTextColor={colors.textMuted}
              value={body}
              onChangeText={handleBodyChange}
              multiline
              textAlignVertical="top"
            />
          </View>
        ) : (
          <View style={styles.previewContainer}>
            <Text style={[styles.previewTitle, { color: colors.textPrimary }]}>
              {title || '無標題'}
            </Text>
            <View style={[styles.lineDivider, { backgroundColor: colors.border }]} />
            <Text style={[styles.previewBody, { color: colors.textSecondary }]}>
              {body || '*無內容*'}
            </Text>
          </View>
        )}

        {/* Attachment Display */}
        {attachments.length > 0 && (
          <View style={styles.attachmentsSection}>
            <Text style={[styles.attachmentHeading, { color: colors.textSecondary }]}>附件 ({attachments.length})</Text>
            <View style={styles.attachmentsList}>
              {attachments.map((file, idx) => (
                <View key={idx} style={[styles.attachmentChip, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                  <Ionicons name="document-text-outline" size={14} color={colors.accent} />
                  <Text style={[styles.attachmentName, { color: colors.textSecondary }]} numberOfLines={1}>{file}</Text>
                  <Pressable onPress={() => setAttachments(attachments.filter(f => f !== file))}>
                    <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Editor Toolbars (only in edit mode) */}
      {!isPreview && (
        <View
          style={[
            styles.formatToolbar,
            {
              backgroundColor: colors.bgSecondary,
              borderTopColor: colors.border,
              paddingBottom: Math.max(insets.bottom, SPACING.xs),
            },
          ]}
        >
          <Pressable onPress={() => insertFormat('**', '**')} style={styles.formatBtn}>
            <Ionicons name="logo-markdown" size={20} color={colors.textSecondary} />
          </Pressable>
          <Pressable onPress={() => insertFormat('### ')} style={styles.formatBtn}>
            <Text style={[styles.formatBtnText, { color: colors.textSecondary }]}>H</Text>
          </Pressable>
          <Pressable onPress={() => insertFormat('> ')} style={styles.formatBtn}>
            <Text style={[styles.formatBtnText, { color: colors.textSecondary }]}>”</Text>
          </Pressable>
          <Pressable onPress={() => insertFormat('- ')} style={styles.formatBtn}>
            <Ionicons name="list-outline" size={20} color={colors.textSecondary} />
          </Pressable>
          <Pressable onPress={() => insertFormat('[連結](https://', ')') } style={styles.formatBtn}>
            <Ionicons name="link-outline" size={18} color={colors.textSecondary} />
          </Pressable>
          <Pressable onPress={handleAttachFile} style={[styles.formatBtn, { marginLeft: 'auto' }]}>
            <Ionicons name="attach" size={22} color={colors.accent} />
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    height: 94,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
  },
  appBarButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '500',
  },
  appBarTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  publishButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: RADIUS.full,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  tabToggleRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
    marginBottom: SPACING.md,
  },
  tabToggleBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '700',
    paddingVertical: SPACING.xs,
  },
  lineDivider: {
    height: 1,
  },
  bodyInput: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 250,
    paddingVertical: SPACING.xs,
  },
  previewContainer: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  previewBody: {
    fontSize: 15,
    lineHeight: 22,
  },
  attachmentsSection: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  attachmentHeading: {
    fontSize: 12,
    fontWeight: '700',
  },
  attachmentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  attachmentName: {
    fontSize: 12,
    maxWidth: 150,
  },
  formatToolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  formatBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formatBtnText: {
    fontSize: 18,
    fontWeight: '800',
  },
});
