import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  SharedValue,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/theme';

interface GradientProgressProps {
  progress: SharedValue<number>;
  visible: SharedValue<boolean>;
}

export default function GradientProgress({ progress, visible }: GradientProgressProps) {
  const containerStyle = useAnimatedStyle(() => ({
    opacity: visible.value ? 1 : 0,
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.min(progress.value * 100, 100)}%` as any,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.bar, barStyle]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    zIndex: 100,
  },
  bar: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
});
