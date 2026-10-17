/**
 * CitationChip — the inline `[1]` anchor (components.md §4).
 * Mono 12px on gold wash; tapping opens the source sheet and selects the card.
 */

import React from 'react';
import { Pressable, Text } from 'react-native';

import { useTheme } from '../hooks/useTheme';
import type { Source } from '@kazer/core';

export interface CitationChipProps {
  index: number;
  source?: Source;
  active?: boolean;
  onPress?: (index: number) => void;
}

export function CitationChip({
  index,
  source,
  active = false,
  onPress,
}: CitationChipProps): React.JSX.Element {
  const { colors } = useTheme();

  const backgroundColor = active ? colors.gold : colors.goldWash;
  const color = active ? colors.textInverse : colors.goldText;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        source
          ? `Fonte ${index}: ${source.title} — ${source.domain}`
          : `Abrir fonte ${index}`
      }
      onPress={() => onPress?.(index)}
      disabled={!onPress}
      hitSlop={6}
      style={({ pressed }) => ({
        marginLeft: 3,
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: active ? colors.gold : colors.goldBorder,
        backgroundColor,
        opacity: pressed ? 0.75 : 1,
        // Subtle superscript, as specified.
        marginTop: -4,
      })}
    >
      <Text
        style={{
          color,
          fontSize: 12,
          lineHeight: 16,
          fontFamily: 'monospace',
        }}
      >
        [{index}]
      </Text>
    </Pressable>
  );
}