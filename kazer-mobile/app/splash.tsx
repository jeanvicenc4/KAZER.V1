import * as React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { KazerMark } from '../components/KazerMark';
import { useTheme } from '../src/theme';

/**
 * Splash — the KAZER mark draws itself, then the tagline, then we move on.
 */
export default function SplashScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const ring = useSharedValue(0);
  const tagline = useSharedValue(0);

  React.useEffect(() => {
    ring.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) }),
        withTiming(0.94, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );

    // Reanimated's withTiming has no `delay`; the pause is expressed as a
    // two-step sequence instead.
    tagline.value = withSequence(
      withTiming(0, { duration: 500 }),
      withTiming(1, { duration: 700, easing: Easing.out(Easing.quad) }),
    );

    const timer = setTimeout(() => router.replace('/'), 2200);
    return () => clearTimeout(timer);
  }, [ring, tagline, router]);

  const markStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ring.value }],
    opacity: Math.min(1, ring.value * 1.4),
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: tagline.value,
    transform: [{ translateY: (1 - tagline.value) * 8 }],
  }));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.void,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View style={markStyle}>
        <KazerMark size={64} />
      </Animated.View>

      <Animated.View style={[{ marginTop: 24 }, taglineStyle]}>
        <Text
          style={{
            color: theme.colors.goldText,
            fontSize: 15,
            fontWeight: '600',
            letterSpacing: 2.4,
          }}
        >
          KAZER
        </Text>
        <Text
          style={{
            color: theme.colors.text3,
            fontSize: 13,
            marginTop: 10,
            textAlign: 'center',
          }}
        >
          Pergunte. O KAZER executa.
        </Text>
      </Animated.View>
    </View>
  );
}
