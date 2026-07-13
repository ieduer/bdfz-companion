import { Tabs, useRouter, usePathname } from 'expo-router';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, SPACING, RADIUS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const TABS = [
  { name: 'index', label: 'Home', icon: 'home-outline', iconActive: 'home' },
  { name: 'learn', label: 'Learn', icon: 'book-outline', iconActive: 'book' },
  { name: 'community', label: 'Community', icon: 'chatbubbles-outline', iconActive: 'chatbubbles' },
  { name: 'tools', label: 'Tools', icon: 'grid-outline', iconActive: 'grid' },
  { name: 'me', label: 'Me', icon: 'person-outline', iconActive: 'person' },
];

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isWide = width >= 600;
  const colors = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const getActiveTab = () => {
    if (pathname === '/' || pathname === '/(tabs)') return 'index';
    if (pathname.includes('/learn')) return 'learn';
    if (pathname.includes('/community')) return 'community';
    if (pathname.includes('/tools')) return 'tools';
    if (pathname.includes('/me')) return 'me';
    return 'index';
  };

  const activeTab = getActiveTab();

  const handleTabPress = (name: string) => {
    if (name === 'index') {
      router.push('/(tabs)');
    } else {
      router.push(`/(tabs)/${name}`);
    }
  };

  const content = (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          display: isWide ? 'none' : 'flex',
          backgroundColor: colors.bgPrimary,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIcon: ({ color, focused }) => {
          const tab = TABS.find((t) => t.name === route.name);
          if (!tab) return null;
          return (
            <Ionicons
              name={(focused ? tab.iconActive : tab.icon) as any}
              size={22}
              color={color}
            />
          );
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn' }} />
      <Tabs.Screen name="community" options={{ title: 'Community' }} />
      <Tabs.Screen name="tools" options={{ title: 'Tools' }} />
      <Tabs.Screen name="me" options={{ title: 'Me' }} />
    </Tabs>
  );

  if (isWide) {
    return (
      <View style={[styles.wideContainer, { backgroundColor: colors.bgPrimary }]}>
        {/* Left Sidebar / Rail */}
        <View
          style={[
            styles.sidebar,
            {
              backgroundColor: colors.bgSecondary,
              borderRightColor: colors.border,
              paddingTop: insets.top + SPACING.lg,
              paddingBottom: insets.bottom + SPACING.lg,
            },
          ]}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={[styles.logoText, { color: colors.accent }]}>BDFZ</Text>
            <Text style={[styles.logoSub, { color: colors.textMuted }]}>Companion</Text>
          </View>

          {/* Navigation Items */}
          <View style={styles.sidebarNav}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.name;
              return (
                <Pressable
                  key={tab.name}
                  onPress={() => handleTabPress(tab.name)}
                  style={({ pressed }) => [
                    styles.sidebarItem,
                    isActive && { backgroundColor: colors.accentMuted },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Ionicons
                    name={(isActive ? tab.iconActive : tab.icon) as any}
                    size={24}
                    color={isActive ? colors.accent : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.sidebarItemText,
                      { color: isActive ? colors.accent : colors.textSecondary },
                      isActive && { fontWeight: '600' },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Main Content Area */}
        <View style={styles.wideMainContent}>{content}</View>
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  wideContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 220,
    borderRightWidth: 1,
    paddingHorizontal: SPACING.md,
  },
  logoContainer: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  logoSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  sidebarNav: {
    flex: 1,
    gap: SPACING.xs,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.md,
  },
  sidebarItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  wideMainContent: {
    flex: 1,
  },
});
