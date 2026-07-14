import { useFonts } from 'expo-font';
import { Stack, ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import 'react-native-reanimated';

import AppUpdatePrompt from '@/components/AppUpdatePrompt';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

import { useIsDark } from '@/constants/theme';

function RootLayoutNav() {
  const isDark = useIsDark();

  const theme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: '#0F172A',
          card: '#0F172A',
          border: '#334155',
          primary: '#6366F1',
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: '#FFFFFF',
          card: '#FFFFFF',
          border: '#E2E8F0',
          primary: '#4F46E5',
        },
      };

  return (
    <ThemeProvider value={theme}>
      <AppUpdatePrompt />
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0F172A' : '#FFFFFF'}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="webview" />
        <Stack.Screen name="read" />
        <Stack.Screen name="post" />
        <Stack.Screen name="composer" />
        <Stack.Screen name="feedback" />
        <Stack.Screen name="search" />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
