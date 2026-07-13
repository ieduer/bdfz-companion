import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, SPACING, RADIUS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface Reply {
  id: string;
  author: string;
  authorRole: string;
  content: string;
  time: string;
  likes: number;
}

export default function PostScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  const title = (searchParams.title as string) || '如何理解《阿Q正傳》中「精神勝利法」的現代啟示？';

  const [replies, setReplies] = useState<Reply[]>([
    {
      id: '1',
      author: '王文達',
      authorRole: '特級教師',
      content: '李同學這個思考切點很有價值。阿Q的「精神勝利法」本質上是一種病態的心理防禦機制，在文學史和社會學中都具有深遠的隱喻。在現代生活中，我們要分清「積極心理建設」與「消極自欺迴避」的界限。',
      time: '30 分鐘前',
      likes: 12,
    },
    {
      id: '2',
      author: '張曉華',
      authorRole: '高二學生',
      content: '有時候複習累了，適度用一下自嘲來防禦好像也是一種喘息...不過確實不能像阿Q那樣，連真正的壓迫和屈辱都去美化成自己的勝利。',
      time: '15 分鐘前',
      likes: 5,
    },
  ]);

  const [replyText, setReplyText] = useState('');

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    const newReply: Reply = {
      id: (replies.length + 1).toString(),
      author: '張學伴 (我)',
      authorRole: '高一學生',
      content: replyText,
      time: '剛剛',
      likes: 0,
    };
    setReplies([...replies, newReply]);
    setReplyText('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.bgPrimary }]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Top Navigation Header */}
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
          <Ionicons name="arrow-back-outline" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.appBarTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          詳情
        </Text>
        <Pressable style={styles.appBarButton}>
          <Ionicons name="ellipsis-horizontal-outline" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* Main post and comments lists */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Original Post */}
        <View style={styles.originalPost}>
          <Text style={[styles.postTitle, { color: colors.textPrimary }]}>{title}</Text>
          <View style={styles.authorRow}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.accentMuted }]}>
              <Ionicons name="person-outline" size={16} color={colors.accent} />
            </View>
            <View style={styles.authorMeta}>
              <Text style={[styles.authorName, { color: colors.textPrimary }]}>李小明</Text>
              <Text style={[styles.postTime, { color: colors.textMuted }]}>
                高一學生 • 發表於 10 分鐘前
              </Text>
            </View>
          </View>
          <Text style={[styles.postBody, { color: colors.textSecondary }]}>
            魯迅先生筆下的阿Q，以自欺欺人的「精神勝利法」來迴避嚴酷的現實，這種現象在現代青年人中是否有類似的演變？比如網絡上的某些躺平心態、精神內耗的解嘲方式。
            {'\n\n'}
            我們在學習或生活中遇到重大挫敗時，適度的精神慰藉是良藥，還是走向阿Q式自毀的溫床？希望聽聽各位老師和同學們的看法！
          </Text>
        </View>

        {/* Divider */}
        <View style={[styles.sectionDivider, { backgroundColor: colors.separator }]} />

        {/* Replies List */}
        <View style={styles.repliesHeader}>
          <Text style={[styles.repliesTitle, { color: colors.textPrimary }]}>
            全部回覆 ({replies.length})
          </Text>
        </View>

        <View style={styles.repliesContainer}>
          {replies.map((reply) => (
            <View key={reply.id} style={[styles.replyItem, { borderBottomColor: colors.separator }]}>
              <View style={styles.replyHeader}>
                <Text style={[styles.replyAuthor, { color: colors.textPrimary }]}>{reply.author}</Text>
                <View style={[styles.roleBadge, { backgroundColor: colors.accentMuted }]}>
                  <Text style={[styles.roleBadgeText, { color: colors.accent }]}>
                    {reply.authorRole}
                  </Text>
                </View>
                <Text style={[styles.replyTime, { color: colors.textMuted }]}>{reply.time}</Text>
              </View>
              <Text style={[styles.replyContent, { color: colors.textSecondary }]}>
                {reply.content}
              </Text>
              <View style={styles.replyFooter}>
                <Pressable style={styles.likeButton}>
                  <Ionicons name="thumbs-up-outline" size={12} color={colors.textMuted} />
                  <Text style={[styles.likeText, { color: colors.textMuted }]}>{reply.likes}</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sticky Bottom Composer */}
      <View
        style={[
          styles.footerComposer,
          {
            backgroundColor: colors.bgSecondary,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, SPACING.sm),
          },
        ]}
      >
        <TextInput
          style={[styles.composeInput, { backgroundColor: colors.bgPrimary, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="寫下你的看法..."
          placeholderTextColor={colors.textMuted}
          value={replyText}
          onChangeText={setReplyText}
          multiline
        />
        <Pressable
          onPress={handleSendReply}
          style={[styles.sendButton, replyText.trim() ? { backgroundColor: colors.accent } : { backgroundColor: colors.border }]}
        >
          <Ionicons name="send" size={16} color={replyText.trim() ? '#FFFFFF' : colors.textMuted} />
        </Pressable>
      </View>
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
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
  },
  appBarButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appBarTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: SPACING.md,
  },
  originalPost: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 26,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorMeta: {
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
  },
  postTime: {
    fontSize: 11,
    marginTop: 1,
  },
  postBody: {
    fontSize: 14,
    lineHeight: 22,
  },
  sectionDivider: {
    height: 8,
    marginVertical: SPACING.lg,
  },
  repliesHeader: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  repliesTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  repliesContainer: {
    paddingHorizontal: SPACING.md,
  },
  replyItem: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    gap: SPACING.xs,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  replyAuthor: {
    fontSize: 13,
    fontWeight: '700',
  },
  roleBadge: {
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: RADIUS.xs,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  replyTime: {
    fontSize: 11,
    marginLeft: 'auto',
  },
  replyContent: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 2,
  },
  replyFooter: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  footerComposer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  composeInput: {
    flex: 1,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
});
