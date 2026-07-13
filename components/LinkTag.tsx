import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, TIMING } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface LinkTagProps {
  label: string;
  accentColor: string;
  onPress: () => void;
}

export default function LinkTag({ label, accentColor, onPress }: LinkTagProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.91, TIMING.cardSpring); }}
      onPressOut={() => { scale.value = withSpring(1, TIMING.cardSpring); }}
      style={[
        styles.tag,
        { borderColor: `${accentColor}33` },
        animatedStyle,
      ]}
    >
      <Text style={styles.tagText}>{label}</Text>
      <View style={[styles.tagIndicator, { backgroundColor: accentColor }]} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    margin: 4,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tagIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginLeft: 6,
    opacity: 0.6,
  },
});
