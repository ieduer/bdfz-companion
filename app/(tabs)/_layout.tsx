import { SymbolView } from 'expo-symbols';
import { Link, Tabs, useRouter, usePathname } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useResponsive } from '@/hooks/useResponsive';

export default function TabLayout() {
  const { isTablet } = useResponsive();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();

  // Tablet Layout (Navigation Rail on the left)
  if (isTablet) {
    const activeColor = Colors[colorScheme].tint;
    const inactiveColor = Colors[colorScheme].tabIconDefault;

    const navItems = [
      {
        name: 'index',
        title: '學伴首頁',
        icon: { ios: 'house.fill', android: 'home', web: 'home' },
        route: '/',
      },
      {
        name: 'two',
        title: '語文學習',
        icon: { ios: 'book.fill', android: 'book', web: 'book' },
        route: '/two',
      },
    ];

    return (
      <View style={[styles.tabletContainer, { backgroundColor: Colors[colorScheme].background }]}>
        {/* Navigation Rail / Sidebar */}
        <View style={[styles.rail, { borderRightColor: Colors[colorScheme].tabIconDefault + '33' }]}>
          <Text style={[styles.railTitle, { color: Colors[colorScheme].text }]}>BDFZ 學伴</Text>
          <View style={styles.railItems}>
            {navItems.map((item) => {
              const isActive =
                (item.route === '/' && pathname === '/') ||
                (item.route !== '/' && pathname.startsWith(item.route));
              const color = isActive ? activeColor : inactiveColor;

              return (
                <Pressable
                  key={item.name}
                  onPress={() => router.push(item.route as any)}
                  style={({ pressed }) => [
                    styles.railItem,
                    isActive && styles.railItemActive,
                    pressed && { opacity: 0.7 }
                  ]}
                >
                  <SymbolView
                    name={item.icon as any}
                    tintColor={color}
                    size={26}
                  />
                  <Text style={[styles.railItemLabel, { color }]}>{item.title}</Text>
                </Pressable>
              );
            })}
          </View>
          <Link href="/modal" asChild>
            <Pressable style={styles.railFooter}>
              <SymbolView
                name={{ ios: 'info.circle.fill', android: 'info', web: 'info' }}
                tintColor={inactiveColor}
                size={24}
              />
            </Pressable>
          </Link>
        </View>

        {/* Content Area */}
        <View style={styles.tabletContent}>
          <Tabs
            screenOptions={{
              tabBarStyle: { display: 'none' }, // Hide bottom tab bar
              headerShown: true,
              headerStyle: { backgroundColor: Colors[colorScheme].background },
              headerTintColor: Colors[colorScheme].text,
            }}
          >
            <Tabs.Screen name="index" options={{ title: '學伴首頁' }} />
            <Tabs.Screen name="two" options={{ title: '語文學習' }} />
          </Tabs>
        </View>
      </View>
    );
  }

  // Mobile Layout (Bottom Tabs)
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: {
          backgroundColor: Colors[colorScheme].background,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '學伴',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'house.fill', android: 'home', web: 'home' }}
              tintColor={color}
              size={26}
            />
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable style={{ marginRight: 15 }}>
                {({ pressed }) => (
                  <SymbolView
                    name={{ ios: 'info.circle', android: 'info', web: 'info' }}
                    size={25}
                    tintColor={Colors[colorScheme].text}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: '學習',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'book.fill', android: 'book', web: 'book' }}
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabletContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  rail: {
    width: 110,
    alignItems: 'center',
    paddingVertical: 20,
    borderRightWidth: 1,
  },
  railTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  railItems: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  railItem: {
    width: '80%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  railItemActive: {
    backgroundColor: '#0284c71a',
  },
  railItemLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  railFooter: {
    padding: 10,
  },
  tabletContent: {
    flex: 1,
  },
});

