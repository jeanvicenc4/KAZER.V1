/**
 * ThinkingIndicator — components.md §9.
 * Never a spinner: three horizontal bars breathing in sequence (stagger 120ms)
 * in `--kazer-cyan`, with the label and the current step below.
 */

import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../hooks/useTheme';
import { useReducedMotion } from '../hooks/useReducedMotion';

function BreathingBar({ index, height }: { index: number; height: number }) {
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    if (reducedMotion) {
      opacity.value = 0.7;
      return;
    }
    opacity.value = withDelay(
      index * 120,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 640, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.35, { duration: 640, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, [index, opacity, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 28,
          height,
          borderRadius: 3,
          backgroundColor: colors.cyan,
        },
        animatedStyle,
      ]}
    />
  );
}

export function ThinkingIndicator({
  step,
  label = 'KAZER está pensando',
}: {
  step?: string | null;
  label?: string;
}): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={step ? `${label}. ${step}` : label}
      accessibilityRole="progressbar"
      style={{ paddingVertical: 8 }}
    >
      <View className="flex-row items-end" style={{ gap: 6, height: 18 }}>
        <BreathingBar index={0} height={8} />
        <BreathingBar index={1} height={14} />
        <BreathingBar index={2} height={18} />
      </View>

      <View className="mt-2">
        <Text className="type-caption" style={{ color: colors.text2 }}>
          {label}
          {step ? ` · ${step}` : ''}
        </Text>
      </View>
    </View>
  );
}