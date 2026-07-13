import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/theme';

const BARS_COUNT = 24;

interface TelemetryBarProps {
  index: number;
}

function TelemetryBar({ index }: TelemetryBarProps) {
  const heightProgress = useSharedValue(0.15 + 0.7 * Math.sin((index / BARS_COUNT) * Math.PI));

  useEffect(() => {
    // Phase shift animations for wave movement
    heightProgress.value = withRepeat(
      withTiming(0.2 + 0.8 * Math.random(), {
        duration: 1000 + Math.random() * 1500,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    height: `${heightProgress.value * 100}%` as any,
    opacity: 0.3 + 0.7 * heightProgress.value,
  }));

  // Alternate neon colors for that hacker telemetry look
  const barColor = index % 3 === 0
    ? COLORS.cyberCyan
    : index % 3 === 1
      ? COLORS.cyberPink
      : COLORS.cyberPurple;

  return (
    <Animated.View
      style={[
        styles.bar,
        { backgroundColor: barColor },
        animatedStyle
      ]}
    />
  );
}

export default function TelemetryWave() {
  return (
    <View style={styles.container}>
      {Array.from({ length: BARS_COUNT }).map((_, i) => (
        <TelemetryBar key={i} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    backgroundColor: 'rgba(0, 240, 255, 0.02)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.05)',
    marginVertical: 12,
    overflow: 'hidden',
  },
  bar: {
    width: 3,
    borderRadius: 1.5,
  },
});
