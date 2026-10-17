/**
 * ModeSwitch — components.md §2.
 * Mobile renders a trigger plus a sheet with large options; the chip's ring
 * signals the semantic accent (cyan for Research, violet for Missão).
 */

import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { Mode } from '@kazer/core';

import { useTheme } from '../hooks/useTheme';
import { modeMeta } from '../constants/icons';
import { Sheet } from './Sheet';
import { tapFeedback } from '../src/services/native';

export function ModeSwitch({
  mode,
  onChange,
  disabled,
}: {
  mode: Mode;
  onChange: (mode: Mode) => void;
  disabled?: boolean;
}): React.JSX.Element {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  const meta = modeMeta[mode];
  const ring =
    mode === 'mission'
      ? colors.violet
      : mode === 'research'
        ? colors.cyan
        : colors.lineActive;

  const modes: Mode[] = ['chat', 'research', 'mission'];

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Modo: ${meta.label}. Toque para trocar`}
        accessibilityState={{ disabled: Boolean(disabled), expanded: open }}
        hitSlop={4}
        disabled={disabled}
        onPress={() => {
          tapFeedback();
          setOpen(true);
        }}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          height: 36,
          paddingHorizontal: 10,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: ring,
          backgroundColor: pressed ? colors.elevated : 'transparent',
          opacity: disabled ? 0.45 : 1,
        })}
      >
        <Feather name={meta.icon} size={14} color={ring === colors.lineActive ? colors.text2 : ring} />
        <Text
          className="type-bodySm"
          style={{ color: ring === colors.lineActive ? colors.text2 : ring }}
        >
          {meta.label}
        </Text>
        <Feather name="chevron-down" size={13} color={colors.text3} />
      </Pressable>

      <Sheet
        visible={open}
        onClose={() => setOpen(false)}
        title="Modo"
        description="Como o KAZER deve executar o seu pedido."
        initialDetent={0.6}
      >
        <View className="px-2 pb-4">
          {modes.map((value) => {
            const item = modeMeta[value];
            const selected = value === mode;
            const accent =
              value === 'mission'
                ? colors.violet
                : value === 'research'
                  ? colors.cyan
                  : colors.gold;

            return (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityState={{ selected }}
                onPress={() => {
                  tapFeedback();
                  onChange(value);
                  setOpen(false);
                }}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 16,
                  borderRadius: 14,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: selected ? accent : colors.line,
                  backgroundColor: selected
                    ? colors.elevated
                    : pressed
                      ? colors.surface
                      : 'transparent',
                })}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: selected ? accent : colors.inset,
                    borderWidth: 1,
                    borderColor: selected ? accent : colors.line,
                  }}
                >
                  <Feather
                    name={item.icon}
                    size={18}
                    color={selected ? colors.textInverse : colors.text2}
                  />
                </View>

                <View className="flex-1">
                  <Text className="type-body" style={{ color: colors.text }}>
                    {item.label}
                  </Text>
                  <Text className="type-caption" style={{ color: colors.text3, marginTop: 2 }}>
                    {item.hint}
                  </Text>
                </View>

                {selected ? (
                  <Feather name="check" size={18} color={accent} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </Sheet>
    </>
  );
}