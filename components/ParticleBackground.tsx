import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/theme';

interface Orb {
  size: number;
  color: string;
  startX: number;
  startY: number;
  driftX: number;
  driftY: number;
  duration: number;
}

const ORBS: Orb[] = [
  { size: 180, color: COLORS.particle1, startX: 0.1, startY: 0.15, driftX: 60, driftY: 40, duration: 8000 },
  { size: 140, color: COLORS.particle2, startX: 0.75, startY: 0.25, driftX: -50, driftY: 50, duration: 10000 },
  { size: 200, color: COLORS.particle3, startX: 0.4, startY: 0.7, driftX: 40, driftY: -60, duration: 12000 },
  { size: 120, color: COLORS.particle4, startX: 0.85, startY: 0.8, driftX: -70, driftY: -30, duration: 9000 },
  { size: 100, color: 'rgba(99, 102, 241, 0.06)', startX: 0.2, startY: 0.5, driftX: 30, driftY: 70, duration: 11000 },
];

function FloatingOrb({ orb, screenWidth, screenHeight }: { orb: Orb; screenWidth: number; screenHeight: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: orb.duration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [0, orb.driftX]);
    const translateY = interpolate(progress.value, [0, 1], [0, orb.driftY]);
    const scale = interpolate(progress.value, [0, 0.5, 1], [1, 1.15, 1]);

    return {
      transform: [{ translateX }, { translateY }, { scale }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          width: orb.size,
          height: orb.size,
          borderRadius: orb.size / 2,
          backgroundColor: orb.color,
          left: screenWidth * orb.startX - orb.size / 2,
          top: screenHeight * orb.startY - orb.size / 2,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function ParticleBackground() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.container} pointerEvents="none">
      {ORBS.map((orb, i) => (
        <FloatingOrb key={i} orb={orb} screenWidth={width} screenHeight={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
  },
});
