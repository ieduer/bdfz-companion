import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import { COLORS, RADIUS, SHADOWS, SPACING, TIMING } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GlassCardProps {
  icon: string;
  title: string;
  subtitle: string;
  accentColor?: string;
  index: number;
  onPress: () => void;
}

export default function GlassCard({
  icon,
  title,
  subtitle,
  accentColor = COLORS.accent,
  index,
  onPress,
}: GlassCardProps) {
  const scale = useSharedValue(1);
  const borderOpacity = useSharedValue(0.08);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(255, 255, 255, ${borderOpacity.value})`,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(TIMING.pressScale, TIMING.cardSpring);
    borderOpacity.value = withSpring(0.2, TIMING.cardSpring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, TIMING.cardSpring);
    borderOpacity.value = withSpring(0.08, TIMING.cardSpring);
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(index * TIMING.cardStagger)
        .duration(500)
        .springify()
        .damping(16)
        .stiffness(120)}
      style={styles.wrapper}
    >
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, animatedStyle, glowStyle]}
      >
        {/* Accent glow dot */}
        <View
          style={[
            styles.accentDot,
            { backgroundColor: accentColor, shadowColor: accentColor },
          ]}
        />

        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  accentDot: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.25,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  icon: {
    fontSize: 36,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
  },
});
