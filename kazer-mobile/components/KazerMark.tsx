/**
 * KazerMark — the KAZER glyph.
 *
 * A geometric "K" built from an angular chevron plus a vertical stem, drawn as
 * plain SVG so it scales cleanly and picks up the metallic gold gradient
 * (tokens.md §1: the gradient is restricted to the logo, the primary ring and
 * the paywall crown).
 */

import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { useTheme } from '../hooks/useTheme';

export interface KazerMarkProps {
  size?: number;
  /** Flat text colour instead of the metallic gradient (inverted contexts). */
  muted?: boolean;
  /** Colour override — takes precedence over `muted`. */
  color?: string;
}

export function KazerMark({
  size = 24,
  muted = false,
  color,
}: KazerMarkProps): React.JSX.Element {
  const { colors } = useTheme();
  const paint = color ?? (muted ? colors.text3 : undefined);
  const fillOrStroke = paint ?? 'url(#kazerMetal)';

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="KAZER"
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <Defs>
          <LinearGradient id="kazerMetal" x1="4" y1="2" x2="28" y2="30">
            <Stop offset="0" stopColor="#F7DA8A" />
            <Stop offset="0.28" stopColor="#E8B950" />
            <Stop offset="0.56" stopColor="#B0822F" />
            <Stop offset="0.78" stopColor="#D9A63F" />
            <Stop offset="1" stopColor="#F2CE6E" />
          </LinearGradient>
        </Defs>

        {/* Faceted lozenge */}
        <Path d="M16 1.6 30.4 16 16 30.4 1.6 16 16 1.6Z" fill={fillOrStroke} />

        {/* Lower-right facet, darker for depth */}
        <Path
          d="M16 30.4 30.4 16 16 16v14.4Z"
          fill={paint ?? "#8A6224"}
          opacity={0.5}
        />

        {/* Chevron cut — the "execute" gesture */}
        <Path
          d="M11.2 9.4 20.8 16l-9.6 6.6v-5.1L16 16l-4.8-1.5V9.4Z"
          fill={colors.base}
        />
      </Svg>
    </View>
  );
}

/** The word "KAZER" in the display weight with tight tracking. */
function KazerWordmark({ size }: { size: number }): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <Text
      accessibilityRole="header"
      style={{
        color: colors.text,
        fontSize: size,
        lineHeight: Math.round(size * 1.15),
        fontWeight: '500',
        letterSpacing: size * 0.02,
      }}
    >
      KAZER
    </Text>
  );
}

/** Mark + wordmark, used in headers and the auth screens. */
export function KazerLockup({
  size = 24,
  withTagline = false,
}: {
  size?: number;
  withTagline?: boolean;
}): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center">
      <KazerMark size={size} />
      <View className="ml-2">
        <KazerWordmark size={Math.round(size * 0.66)} />
        {withTagline ? (
          <Text className="type-caption" style={{ color: colors.text3, marginTop: 2 }}>
            Pergunte. O KAZER executa.
          </Text>
        ) : null}
      </View>
    </View>
  );
}