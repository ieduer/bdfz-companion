import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, SPACING, RADIUS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { isAuthenticated, fetchFromUserCenter } from '@/services/auth';
import { SERVICES, ConnectionMode } from '@/constants/sites';

interface CourseTask {
  id: string;
  title: string;
  subject: string;
  progress: number; // 0 to 1
  deadline: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 600;
  const navigation = useNavigation();

  // States
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [tasks, setTasks] = useState<CourseTask[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [resumeItem, setResumeItem] = useState<any>(null);

  const fetchDashboardAndTodos = async () => {
    try {
      const isAuth = await isAuthenticated();
      setAuthed(isAuth);
      if (isAuth) {
        // Fetch dashboard data
        const dashboard = await fetchFromUserCenter('/api/dashboard');
        setUserInfo({
          name: dashboard.user?.displayName || dashboard.user?.slug || 'BDFZ 學伴',
          cohort: dashboard.seiue?.profile?.grade || '2028屆',
          classLabel: dashboard.seiue?.profile?.usin ? `ID: ${dashboard.seiue.profile.usin}` : '高一 (22班)',
          avatar: dashboard.user?.avatarUrl || null,
        });

        // Map resume item
        const recent = dashboard.progress?.recentItems?.[0];
        if (recent) {
          setResumeItem({
            articleId: recent.itemKey,
            title: recent.itemTitle,
            author: recent.itemGroup || '語文',
            progress: (recent.meta?.progressPercent || recent.score || 50) / 100,
          });
        } else {
          setResumeItem(null);
        }

        // Fetch todos
        const todoData = await fetchFromUserCenter('/api/todos');
        if (todoData && Array.isArray(todoData.todos)) {
          const mappedTasks: CourseTask[] = todoData.todos.map((t: any) => ({
            id: String(t.id),
            title: t.text,
            subject: '任務',
            progress: t.done ? 1.0 : 0.0,
            deadline: t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : '無截止日',
          }));
          setTasks(mappedTasks);
        }
      } else {
        setUserInfo(null);
        setResumeItem(null);
        setTasks([]);
      }
    } catch (err) {
      console.warn('Failed to load dashboard/todos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDashboardAndTodos();
    });
    fetchDashboardAndTodos();
    return unsubscribe;
  }, [navigation]);

  const handleAddTodo = async () => {
    if (!newTodoText.trim()) return;
    try {
      if (authed) {
        await fetchFromUserCenter('/api/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: newTodoText.trim() }),
        });
        setNewTodoText('');
        fetchDashboardAndTodos();
      } else {
        const newId = String(Date.now());
        setTasks([...tasks, { id: newId, title: newTodoText.trim(), subject: '任務', progress: 0, deadline: '今日' }]);
        setNewTodoText('');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleToggleTodo = async (task: CourseTask) => {
    const isDone = task.progress >= 1.0;
    try {
      setTasks(tasks.map(t => t.id === task.id ? { ...t, progress: isDone ? 0.0 : 1.0 } : t));
      if (authed) {
        await fetchFromUserCenter(`/api/todos/${task.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ done: !isDone }),
        });
        fetchDashboardAndTodos();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleDeleteTodo = async (taskId: string) => {
    Alert.alert('刪除任務', '確定要刪除此任務嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '確定',
        onPress: async () => {
          try {
            setTasks(tasks.filter(t => t.id !== taskId));
            if (authed) {
              await fetchFromUserCenter(`/api/todos/${taskId}`, {
                method: 'DELETE',
              });
              fetchDashboardAndTodos();
            }
          } catch (err) {
            console.warn(err);
          }
        }
      }
    ]);
  };

  // Quick Action site triggers pulled dynamically from registry
  const quickActionIds = ['ai_gaokao', 'chinese_course', 'seiue_attendance', 'co_reading', 'forum'];
  const QUICK_ACTIONS = quickActionIds.map(id => {
    const service = SERVICES.find(s => s.id === id);
    let icon = 'construct-outline';
    if (id === 'ai_gaokao') icon = 'school-outline';
    else if (id === 'chinese_course') icon = 'book-outline';
    else if (id === 'seiue_attendance') icon = 'calendar-outline';
    else if (id === 'co_reading') icon = 'library-outline';
    else if (id === 'forum') icon = 'chatbox-ellipses-outline';
    return {
      label: service?.label || '未知服務',
      icon,
      href: service?.url || 'https://bdfz.net/',
      connectionMode: service?.connectionMode || ConnectionMode.WEBVIEW,
    };
  });



  const handleActionPress = (action: { label: string; href: string }) => {
    router.push({
      pathname: '/webview',
      params: { url: action.href, title: action.label },
    });
  };

  const handleSearchPress = () => {
    router.push('/search');
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bgPrimary }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgPrimary }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: Math.max(insets.top, SPACING.md) + (isWide ? 0 : 8) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greetingText, { color: colors.textMuted }]}>
            {authed ? '歡迎回來' : '訪客模式'}
          </Text>
          <Text style={[styles.nameText, { color: colors.textPrimary }]}>
            {authed ? userInfo?.name || 'BDFZ 學伴' : '請登錄以同步學習進度'}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/me')}
          style={[styles.avatarCircle, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
        >
          <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Global Search Trigger */}
      <Pressable
        onPress={handleSearchPress}
        style={[styles.searchBar, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
      >
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <Text style={[styles.searchText, { color: colors.textMuted }]}>搜尋課本、文章、論壇討論...</Text>
      </Pressable>

      {/* Resume Card (Continue Learning) */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>繼續學習</Text>
        {resumeItem ? (
          <Pressable
            onPress={() => {
              let targetUrl = 'https://coread.bdfz.net/';
              const aid = resumeItem.articleId;
              if (aid === 'nahan' || aid === 'nh') targetUrl = 'https://nh.bdfz.net/';
              else if (aid === 'biancheng' || aid === 'bc') targetUrl = 'https://bc.bdfz.net/';
              else if (aid === 'lunyu' || aid === 'lun') targetUrl = 'https://lun.bdfz.net/';
              else if (aid === 'creative_writing' || aid === 'youthwrite') targetUrl = 'https://youthwrite.bdfz.net/';
              else if (aid === 'yw_textbook' || aid === 'yw') targetUrl = 'https://yw.bdfz.net/';

              router.push({
                pathname: '/webview',
                params: {
                  url: targetUrl,
                  title: resumeItem.title,
                },
              });
            }}
            style={({ pressed }) => [
              styles.resumeCard,
              {
                backgroundColor: colors.bgSecondary,
                borderColor: colors.border,
              },
              pressed && { opacity: 0.95 },
            ]}
          >
            <View style={styles.resumeHeader}>
              <View style={[styles.subjectBadge, { backgroundColor: colors.accentMuted }]}>
                <Text style={[styles.subjectText, { color: colors.accent }]}>
                  高中閱讀
                </Text>
              </View>
              <Text style={[styles.resumeProgressText, { color: colors.textSecondary }]}>
                已讀 {Math.round(resumeItem.progress * 100)}%
              </Text>
            </View>
            <Text style={[styles.resumeTitle, { color: colors.textPrimary }]}>
              《{resumeItem.title}》學習進度回顧
            </Text>
            <Text style={[styles.resumeMeta, { color: colors.textMuted }]} numberOfLines={1}>
              著作作者: [著] {resumeItem.author}
            </Text>
            <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: colors.accent,
                    width: `${Math.round(resumeItem.progress * 100)}%`,
                  },
                ]}
              />
            </View>
          </Pressable>
        ) : (
          <View style={[styles.resumeCard, { backgroundColor: colors.bgSecondary, borderColor: colors.border, alignItems: 'center', paddingVertical: SPACING.lg, gap: SPACING.sm }]}>
            <Ionicons name="book-outline" size={24} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 18 }}>
              尚無最近使用記錄。從下方的「常用入口」或「學習」分頁開啟課程吧！
            </Text>
          </View>
        )}
      </View>

      {/* Quick Actions (Sites Carousel) */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>常用入口</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actionsCarousel}
        >
          {QUICK_ACTIONS.map((action, idx) => (
            <Pressable
              key={idx}
              onPress={() => handleActionPress(action)}
              style={({ pressed }) => [
                styles.actionItem,
                { backgroundColor: colors.bgSecondary, borderColor: colors.border },
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: colors.accentMuted }]}>
                <Ionicons name={action.icon as any} size={22} color={colors.accent} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Active Tasks / Missions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>今日學習任務</Text>

        {/* New Todo input block */}
        <View style={[styles.newTodoInputBlock, { borderColor: colors.border, backgroundColor: colors.bgSecondary }]}>
          <TextInput
            style={[styles.newTodoInput, { color: colors.textPrimary }]}
            placeholder="新增今日學習待辦..."
            placeholderTextColor={colors.textMuted}
            value={newTodoText}
            onChangeText={setNewTodoText}
            onSubmitEditing={handleAddTodo}
          />
          <Pressable onPress={handleAddTodo} style={[styles.addTodoBtn, { backgroundColor: colors.accent }]}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.tasksList}>
          {tasks.length === 0 ? (
            <View style={styles.emptyTasksContainer}>
              <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 18 }}>
                {authed ? '目前沒有待辦任務，請在上方輸入框添加！' : '尚無今日學習任務，請連接帳號以同步，或在上方手動添加！'}
              </Text>
            </View>
          ) : (
            tasks.map((task) => {
              const isDone = task.progress >= 1.0;
              return (
                <Pressable
                  key={task.id}
                  onPress={() => handleToggleTodo(task)}
                  onLongPress={() => handleDeleteTodo(task.id)}
                  style={({ pressed }) => [
                    styles.taskItemRow,
                    {
                      backgroundColor: colors.bgSecondary,
                      borderColor: colors.border,
                    },
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Ionicons
                    name={isDone ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={isDone ? colors.success : colors.textSecondary}
                    style={styles.todoCheckbox}
                  />
                  <View style={styles.todoTextContainer}>
                    <Text
                      style={[
                        styles.todoText,
                        {
                          color: isDone ? colors.textMuted : colors.textPrimary,
                          textDecorationLine: isDone ? 'line-through' : 'none',
                        },
                      ]}
                    >
                      {task.title}
                    </Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>
                      截止: {task.deadline}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleDeleteTodo(task.id)}
                    style={styles.todoDeleteBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </Pressable>
                </Pressable>
              );
            })
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  searchText: {
    fontSize: 14,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  resumeCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  resumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
  },
  subjectText: {
    fontSize: 11,
    fontWeight: '600',
  },
  resumeProgressText: {
    fontSize: 11,
    fontWeight: '500',
  },
  resumeTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  resumeMeta: {
    fontSize: 12,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionsCarousel: {
    gap: SPACING.md,
    paddingRight: SPACING.md,
  },
  actionItem: {
    width: 90,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
  },
  gridContainer: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  gridHalf: {
    flex: 1,
  },
  tasksList: {
    gap: SPACING.sm,
  },
  taskItem: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskSubject: {
    fontSize: 11,
    fontWeight: '700',
  },
  taskDeadline: {
    fontSize: 11,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  taskProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  taskProgressBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  taskProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  taskProgressPercent: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionMoreLink: {
    fontSize: 13,
    fontWeight: '500',
  },
  threadsList: {
    gap: 0,
  },
  threadItem: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    gap: SPACING.xs,
  },
  threadTitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  threadMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  threadAuthor: {
    fontSize: 11,
  },
  threadDot: {
    fontSize: 11,
    marginHorizontal: SPACING.xs,
  },
  threadTime: {
    fontSize: 11,
  },
  threadReplies: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 4,
  },
  threadRepliesCount: {
    fontSize: 11,
    fontWeight: '600',
  },
  newTodoInputBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  newTodoInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  addTodoBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTasksContainer: {
    paddingVertical: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  todoCheckbox: {
    marginRight: SPACING.md,
  },
  todoTextContainer: {
    flex: 1,
  },
  todoText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  todoDeleteBtn: {
    padding: 6,
    marginLeft: SPACING.sm,
  },
});
