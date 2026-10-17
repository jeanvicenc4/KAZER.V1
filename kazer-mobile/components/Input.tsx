/**
 * Input — text field on `--kazer-inset`, radius 10, hairline border.
 * Errors use the red wash; gold focus ring is the brand focus language.
 */

import React, { forwardRef, useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../hooks/useTheme';
import { touchTarget } from '../constants/tokens';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  hint?: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  /** Render the trailing clear affordance. */
  onClear?: () => void;
  containerStyle?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    error,
    hint,
    icon,
    onClear,
    containerStyle,
    style,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label ? (
        <Text className="type-caption" style={{ color: colors.text2, marginBottom: 6 }}>
          {label}
        </Text>
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          minHeight: touchTarget,
          paddingHorizontal: 12,
          borderRadius: 10,
          borderWidth: 1,
          backgroundColor: colors.inset,
          // Focus is always visible: 2px gold, offset kept in the border.
          borderColor: error
            ? colors.red
            : focused
              ? colors.gold
              : colors.line,
        }}
      >
        {icon ? <Feather name={icon} size={16} color={focused ? colors.gold : colors.text3} /> : null}

        <TextInput
          ref={ref}
          accessibilityLabel={label ?? rest.placeholder}
          placeholderTextColor={colors.text3}
          selectionColor={colors.gold}
          style={[
            {
              flex: 1,
              color: colors.text,
              paddingVertical: 12,
              fontSize: 15,
              lineHeight: 20,
            },
            style,
          ]}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />

        {onClear ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Limpar"
            onPress={onClear}
            hitSlop={8}
          >
            <Feather name="x" size={16} color={colors.text3} />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View className="flex-row items-center gap-1 mt-1">
          <Feather name="alert-circle" size={12} color={colors.red} />
          <Text className="type-caption" style={{ color: colors.red }}>
            {error}
          </Text>
        </View>
      ) : hint ? (
        <Text className="type-caption" style={{ color: colors.text3, marginTop: 4 }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
});