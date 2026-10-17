/**
 * Avatar — initials on a pill, gold hairline. Falls back to initials when the
 * profile has no avatar URL, which is the case in the demo.
 */

import React from 'react';
import { Image, Text, View } from 'react-native';

import { useTheme } from '../hooks/useTheme';

export function Avatar({
  name,
  uri,
  size = 40,
}: {
  name: string;
  uri?: string | null;
  size?: number;
}): React.JSX.Element {
  const { colors } = useTheme();

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  if (uri) {
    return (
      <Image
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Foto de ${name}`}
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${name}`}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.goldWash,
        borderWidth: 1,
        borderColor: colors.goldBorder,
      }}
    >
      <Text
        style={{
          color: colors.goldText,
          fontSize: Math.round(size * 0.36),
          lineHeight: Math.round(size * 0.44),
          fontWeight: '500',
          letterSpacing: 0.02,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}

/** Domain favicon with an initial fallback (components.md §5). */
export function Favicon({
  domain,
  favicon,
  size = 16,
}: {
  domain: string;
  favicon?: string;
  size?: number;
}): React.JSX.Element {
  const { colors } = useTheme();
  const letter = domain.replace(/^www\./, '').charAt(0).toUpperCase();

  if (favicon) {
    return (
      <Image
        source={{ uri: favicon }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.inset,
        borderWidth: 1,
        borderColor: colors.line,
      }}
    >
      <Text style={{ color: colors.text3, fontSize: size * 0.6, lineHeight: size * 0.8 }}>
        {letter}
      </Text>
    </View>
  );
}