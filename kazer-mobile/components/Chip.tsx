/**
 * Chip — small selectable pill used for modes, filters, follow-ups and
 * mission shortcuts. Radius 6/999 per tokens.md §5.
 */

import React from 'react';
import { Pressable, Text, View, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../hooks/useTheme';
import type { IconName } from '../constants/icons';
import { touchTarget } from '../constants/tokens';

export type ChipTone = 'neutral' | 'gold' | 'violet' | 'cyan';

export interface ChipProps {
  label: string;
  onPress?: () => void;
  selected?: boolean;
  tone?: ChipTone;
  icon?: IconName;
  disabled?: boolean;
  compact?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function Chip({
  label,
  onPress,
  selected = false,
  tone = 'neutral',
  icon,
  disabled = false,
  compact = false,
  style,
  accessibilityLabel,
}: ChipProps): React.JSX.Element {
  const { colors } = useTheme();

  const tones: Record<ChipTone, { fg: string; bg: string; border: string }> = {
    neutral: {
      fg: selected ? colors.text : colors.text2,
      bg: selected ? colors.elevated : 'transparent',
      border: selected ? colors.lineActive : colors.line,
    },
    gold: {
      fg: selected ? colors.textInverse : colors.goldText,
      bg: selected ? colors.gold : colors.goldWash,
      border: selected ? colors.gold : colors.goldBorder,
    },
    violet: {
      fg: selected ? colors.textInverse : colors.violetSoft,
      bg: selected ? colors.violet : colors.violetWash,
      border: selected ? colors.violet : colors.violetBorder,
    },
    cyan: {
      fg: selected ? colors.textInverse : colors.cyan,
      bg: selected ? colors.cyan : colors.cyanWash,
      border: selected ? colors.cyan : colors.cyanBorder,
    },
  };

  const palette = tones[tone];
  const isDisabled = disabled || !onPress;

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: compact ? 10 : 12,
        height: compact ? 32 : 36,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.bg,
        opacity: isDisabled ? 0.45 : 1,
      }}
    >
      {icon ? <Feather name={icon} size={14} color={palette.fg} /> : null}
      <Text
        className="type-bodySm"
        style={{ color: palette.fg, fontWeight: '500' }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );

  if (!onPress) {
    return (
      <View accessible accessibilityLabel={accessibilityLabel ?? label} style={style}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected, disabled: isDisabled }}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, ...style })}
    >
      {content}
    </Pressable>
  );
}

/** Badge for counts and metadata (v3, "9 fontes"). */
export function Badge({
  label,
  tone = 'neutral',
  icon,
}: {
  label: string;
  tone?: ChipTone;
  icon?: IconName;
}): React.JSX.Element {
  const { colors } = useTheme();

  const tones: Record<ChipTone, { fg: string; bg: string }> = {
    neutral: { fg: colors.text3, bg: colors.inset },
    gold: { fg: colors.goldText, bg: colors.goldWash },
    violet: { fg: colors.violetSoft, bg: colors.violetWash },
    cyan: { fg: colors.cyan, bg: colors.cyanWash },
  };

  const palette = tones[tone];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 6,
        height: 20,
        borderRadius: 4,
        backgroundColor: palette.bg,
      }}
    >
      {icon ? <Feather name={icon} size={11} color={palette.fg} /> : null}
      <Text className="type-micro" style={{ color: palette.fg }}>
        {label}
      </Text>
    </View>
  );
}

/**
 * Demo marker. Required wherever a list is backed by mock content, so nobody
 * mistakes the demo for live data.
 */
export function DemoNote({
  label = 'Dados de demonstração',
  className = '',
}: {
  label?: string;
  className?: string;
}): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View
      className={`flex-row items-center gap-2 ${className}`}
      accessible
      accessibilityLabel={label}
    >
      <View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.text3,
        }}
      />
      <Text className="type-micro" style={{ color: colors.text3 }}>
        {label}
      </Text>
    </View>
  );
}

/** Section header with an optional action — real sections only. */
export function SectionHeader({
  title,
  action,
  onActionPress,
}: {
  title: string;
  action?: string;
  onActionPress?: () => void;
}): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text className="eyebrow" style={{ color: colors.text3 }}>
        {title}
      </Text>
      {action && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action}
          onPress={onActionPress}
          hitSlop={8}
          style={{ minHeight: touchTarget, justifyContent: 'center' }}
        >
          <Text className="type-caption" style={{ color: colors.goldText }}>
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}