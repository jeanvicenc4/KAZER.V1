/**
 * Button — components.md §11.
 * Primary / secondary / ghost / outline-gold / danger. Gold is the only
 * primary per screen; icons are 16px and never an arrow.
 *
 * The press feedback is a real 120ms transition (scale 0.97 + opacity), driven
 * by Reanimated — React Native's Pressable has no built-in transition, and
 * `transitionDuration` only exists in newer RN type definitions.
 */

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../hooks/useTheme';
import type { IconName } from '../constants/icons';
import { touchTarget } from '../constants/tokens';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline-gold'
  | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const HEIGHTS: Record<ButtonSize, number> = {
  sm: 36,
  md: touchTarget,
  lg: 52,
};

const PADDING: Record<ButtonSize, number> = {
  sm: 12,
  md: 16,
  lg: 20,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  fullWidth = false,
  disabled,
  style,
  onPressIn,
  onPressOut,
  ...rest
}: ButtonProps): React.JSX.Element {
  const { colors } = useTheme();

  const palette: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
    primary: { bg: colors.gold, fg: colors.textInverse, border: 'transparent' },
    secondary: { bg: colors.surface, fg: colors.text, border: colors.line },
    ghost: { bg: 'transparent', fg: colors.text2, border: 'transparent' },
    'outline-gold': { bg: 'transparent', fg: colors.goldText, border: colors.goldBorder },
    danger: { bg: colors.redWash, fg: colors.red, border: colors.redBorder },
  };

  const tone = palette[variant];
  const isDisabled = Boolean(disabled) || loading;

  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.03 }],
    opacity: isDisabled ? 0.45 : 1 - pressed.value * 0.12,
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPressIn={(event) => {
        pressed.value = withTiming(1, { duration: 120 });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.value = withTiming(0, { duration: 120 });
        onPressOut?.(event);
      }}
      style={[
        {
          minHeight: HEIGHTS[size],
          paddingHorizontal: PADDING[size],
          borderRadius: 10,
          borderWidth: 1,
          borderColor: tone.border,
          backgroundColor: tone.bg,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        variant === 'primary' && !isDisabled
          ? {
              shadowColor: colors.gold,
              shadowOpacity: 0.22,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 4 },
              elevation: 3,
            }
          : null,
        animatedStyle,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={tone.fg} />
      ) : icon ? (
        <Feather name={icon} size={16} color={tone.fg} />
      ) : null}
      <Text
        className={size === 'sm' ? 'type-bodySm' : 'type-body'}
        style={{ color: tone.fg, fontWeight: '500' }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

/** 44×44 icon-only control. Every icon button in KAZER is one of these. */
export function IconButton({
  icon,
  onPress,
  label,
  size = touchTarget,
  active = false,
  disabled = false,
  tint,
}: {
  icon: IconName;
  onPress: () => void;
  label: string;
  size?: number;
  active?: boolean;
  disabled?: boolean;
  tint?: string;
}): React.JSX.Element {
  const { colors } = useTheme();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: disabled ? 0.45 : 1 - pressed.value * 0.3,
    transform: [{ scale: 1 - pressed.value * 0.05 }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 120 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 120 });
      }}
      hitSlop={8}
      style={[
        {
          width: size,
          height: size,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active ? colors.goldWash : 'transparent',
        },
        animatedStyle,
      ]}
    >
      <Feather
        name={icon}
        size={20}
        color={tint ?? (active ? colors.goldText : colors.text2)}
      />
    </AnimatedPressable>
  );
}

/** Full-width row button used by sheets and settings lists. */
export function RowButton({
  icon,
  label,
  description,
  onPress,
  destructive = false,
  accessory,
}: {
  icon: IconName;
  label: string;
  description?: string;
  onPress: () => void;
  destructive?: boolean;
  accessory?: React.ReactNode;
}): React.JSX.Element {
  const { colors } = useTheme();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor:
      pressed.value > 0.5 ? colors.elevated : 'transparent',
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 120 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 120 });
      }}
      style={[
        {
          minHeight: touchTarget,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 10,
        },
        animatedStyle,
      ]}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: destructive ? colors.redWash : colors.inset,
          borderWidth: 1,
          borderColor: destructive ? colors.redBorder : colors.line,
        }}
      >
        <Feather
          name={icon}
          size={16}
          color={destructive ? colors.red : colors.text2}
        />
      </View>

      <View className="flex-1">
        <Text
          className="type-body"
          style={{ color: destructive ? colors.red : colors.text }}
        >
          {label}
        </Text>
        {description ? (
          <Text className="type-caption" style={{ color: colors.text3, marginTop: 2 }}>
            {description}
          </Text>
        ) : null}
      </View>

      {accessory}
    </AnimatedPressable>
  );
}
