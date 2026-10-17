/**
 * Skeletons — components.md §10.
 * 90° shimmer from `--kazer-elevated`; static opacity under reduced motion.
 */

import React, { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../hooks/useTheme';
import { useReducedMotion } from '../hooks/useReducedMotion';

function useShimmer(reducedMotion: boolean) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      progress.value = 0.5;
      return;
    }
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.linear }),
      -1,
      false,
    );
  }, [progress, reducedMotion]);

  return progress;
}

function SkeletonBlock({
  width,
  height,
  radius,
  style,
}: {
  width?: number | `${number}%`;
  height: number;
  radius?: number;
  style?: ViewStyle;
}): React.JSX.Element {
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const progress = useShimmer(reducedMotion);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: reducedMotion ? 0.6 : 0.35 + progress.value * 0.45,
    transform: reducedMotion ? [] : [{ translateX: progress.value * -24 }],
  }));

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius ?? 6,
          backgroundColor: colors.elevated,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: '55%',
            backgroundColor: colors.overlay,
            opacity: 0.5,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

/** Three text lines at 92% / 78% / 60% — used while an answer streams in. */
export function SkeletonText({ lines = 3 }: { lines?: number }): React.JSX.Element {
  const widths = ['92%', '78%', '60%'] as const;

  return (
    <View className="gap-2" accessibilityLabel="Carregando conteúdo">
      {Array.from({ length: lines }, (_, index) => (
        <SkeletonBlock
          key={index}
          width={widths[index % widths.length]}
          height={index === lines - 1 ? 12 : 14}
        />
      ))}
    </View>
  );
}

/** Four source cards. */
export function SkeletonSources({ count = 4 }: { count?: number }): React.JSX.Element {
  return (
    <View className="gap-3" accessibilityLabel="Carregando fontes">
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          className="p-4 rounded-kazer-lg"
          style={{ borderWidth: 1, borderColor: 'transparent' }}
        >
          <View className="flex-row items-center gap-2">
            <SkeletonBlock width={16} height={16} radius={8} />
            <SkeletonBlock width={96} height={10} />
          </View>
          <SkeletonBlock width="88%" height={12} style={{ marginTop: 10 }} />
          <SkeletonBlock width="64%" height={12} style={{ marginTop: 6 }} />
        </View>
      ))}
    </View>
  );
}

/** Six history rows. */
export function SkeletonList({ count = 6 }: { count?: number }): React.JSX.Element {
  return (
    <View className="gap-2" accessibilityLabel="Carregando lista">
      {Array.from({ length: count }, (_, index) => (
        <View key={index} className="flex-row items-center gap-3 py-3">
          <SkeletonBlock width={32} height={32} radius={10} />
          <View className="flex-1 gap-1">
            <SkeletonBlock width="72%" height={12} />
            <SkeletonBlock width="44%" height={10} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Grid placeholder for the artifacts screen. */
export function SkeletonGrid({ count = 6 }: { count?: number }): React.JSX.Element {
  return (
    <View
      className="flex-row flex-wrap"
      style={{ marginHorizontal: -6 }}
      accessibilityLabel="Carregando artefatos"
    >
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={{ width: '50%', paddingHorizontal: 6, paddingBottom: 12 }}>
          <SkeletonBlock width="100%" height={148} radius={14} />
        </View>
      ))}
    </View>
  );
}

export { SkeletonBlock };