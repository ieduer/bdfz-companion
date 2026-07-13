import { useColorScheme } from '@/components/useColorScheme';

export const PALETTE = {
  // Common Colors
  white: '#FFFFFF',
  black: '#000000',

  // Slate/Gray Neutrals for Light Theme
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
  slate950: '#020617',

  // Indigo Accent
  indigo50: '#EEF2FF',
  indigo100: '#E0E7FF',
  indigo500: '#6366F1',
  indigo600: '#4F46E5',
  indigo700: '#4338CA',

  // Jade / Teal secondary
  teal50: '#F0FDFA',
  teal500: '#14B8A6',
  teal600: '#0D9488',

  // Semantics
  red500: '#EF4444',
  red600: '#DC2626',
  amber500: '#F59E0B',
  emerald500: '#10B981',
} as const;

export const themeColors = {
  light: {
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F8FAFC',
    bgElevated: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    border: '#E2E8F0',
    borderHover: '#CBD5E1',
    separator: '#F1F5F9',
    accent: '#4F46E5', // Indigo
    accentSecondary: '#0D9488', // Teal
    accentMuted: '#EEF2FF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  dark: {
    bgPrimary: '#0F172A',
    bgSecondary: '#020617',
    bgElevated: '#1E293B',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    border: '#334155',
    borderHover: '#475569',
    separator: '#1E293B',
    accent: '#6366F1',
    accentSecondary: '#14B8A6',
    accentMuted: '#1E1B4B',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#60A5FA',
  },
  highContrastLight: {
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F1F5F9',
    bgElevated: '#FFFFFF',
    textPrimary: '#000000',
    textSecondary: '#1E293B',
    textMuted: '#334155',
    border: '#000000',
    borderHover: '#000000',
    separator: '#CBD5E1',
    accent: '#312E81',
    accentSecondary: '#115E59',
    accentMuted: '#E0E7FF',
    success: '#047857',
    warning: '#B45309',
    error: '#B91C1C',
    info: '#1D4ED8',
  },
  highContrastDark: {
    bgPrimary: '#000000',
    bgSecondary: '#000000',
    bgElevated: '#0F172A',
    textPrimary: '#FFFFFF',
    textSecondary: '#F8FAFC',
    textMuted: '#E2E8F0',
    border: '#FFFFFF',
    borderHover: '#FFFFFF',
    separator: '#334155',
    accent: '#818CF8',
    accentSecondary: '#2DD4BF',
    accentMuted: '#312E81',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
  }
};

export const COLORS = {
  ...themeColors.dark,
  // Legacy Fallbacks for Unconverted Components
  bg: '#0F172A',
  bgCard: '#1E293B',
  bgCardHover: '#1E293B',
  bgOverlay: 'rgba(15, 23, 42, 0.95)',
  border: '#334155',
  borderLight: '#475569',
  cyberCyan: '#3B82F6',
  cyberPink: '#6366F1',
  cyberPurple: '#4F46E5',
  cyberAmber: '#F59E0B',
  cyberGreen: '#10B981',
  accent: '#6366F1',
  accentLight: '#818CF8',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  particle1: 'rgba(99, 102, 241, 0.08)',
  particle2: 'rgba(99, 102, 241, 0.06)',
  particle3: 'rgba(99, 102, 241, 0.07)',
  particle4: 'rgba(16, 185, 129, 0.05)',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
} as const;

export const FONTS = {
  mono: 'SpaceMono',
} as const;

export const SHADOWS = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
} as const;

export const TIMING = {
  cardStagger: 40,
  cardSpring: { damping: 24, stiffness: 200, mass: 0.8 },
  fadeIn: 250,
  pressScale: 0.96,
} as const;

import { useState, useEffect } from 'react';

// Global singleton state for theme overrides
let themeSettings = {
  isDark: true,          // Default to true (dark theme)
  isSystem: false,       // Default to false so manual switches take priority
  highContrast: false    // High contrast mode
};

// Simple event listeners registry
const themeListeners = new Set<() => void>();

export function updateThemeSettings(settings: Partial<typeof themeSettings>) {
  themeSettings = { ...themeSettings, ...settings };
  themeListeners.forEach(l => l());
}

export function getThemeSettings() {
  return themeSettings;
}

export function useIsDark() {
  const systemScheme = useColorScheme();
  const [localSettings, setLocalSettings] = useState(themeSettings);

  useEffect(() => {
    const handleUpdate = () => {
      setLocalSettings({ ...themeSettings });
    };
    themeListeners.add(handleUpdate);
    return () => {
      themeListeners.delete(handleUpdate);
    };
  }, []);

  return localSettings.isSystem
    ? systemScheme === 'dark'
    : localSettings.isDark;
}

// Dynamic Theme Hook for dynamic rendering
export function useTheme(highContrastOverride = false) {
  const isDark = useIsDark();
  const [localSettings, setLocalSettings] = useState(themeSettings);

  useEffect(() => {
    const handleUpdate = () => {
      setLocalSettings({ ...themeSettings });
    };
    themeListeners.add(handleUpdate);
    return () => {
      themeListeners.delete(handleUpdate);
    };
  }, []);

  const isHighContrast = localSettings.highContrast || highContrastOverride;

  if (isHighContrast) {
    return isDark ? themeColors.highContrastDark : themeColors.highContrastLight;
  }
  return isDark ? themeColors.dark : themeColors.light;
}
