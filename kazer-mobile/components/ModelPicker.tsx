/**
 * ModelPicker — components.md §2.
 * Chip with the short model name; the sheet lists every model with its plan
 * requirement, locking the ones the current plan cannot reach.
 */

import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { models } from '@kazer/core';
import type { ModelId, Plan } from '@kazer/core';

import { useTheme } from '../hooks/useTheme';
import { Sheet } from './Sheet';
import { tapFeedback } from '../src/services/native';
import { usePlan } from '../hooks/usePlan';

const PLAN_ORDER: Record<Plan, number> = { free: 0, pro: 1, max: 2 };

export function ModelPicker({
  model,
  onChange,
  disabled,
}: {
  model: ModelId;
  onChange: (model: ModelId) => void;
  disabled?: boolean;
}): React.JSX.Element {
  const { colors } = useTheme();
  const { plan } = usePlan();
  const [open, setOpen] = useState(false);

  const selected = models.find((item) => item.id === model) ?? models[0];

  const available = models.filter(
    (item) => PLAN_ORDER[plan] >= PLAN_ORDER[item.minPlan],
  );
  const locked = models.filter(
    (item) => PLAN_ORDER[plan] < PLAN_ORDER[item.minPlan],
  );

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Modelo: ${selected?.name ?? model}. Toque para trocar`}
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
          gap: 4,
          height: 36,
          paddingHorizontal: 10,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: colors.line,
          backgroundColor: pressed ? colors.elevated : 'transparent',
          opacity: disabled ? 0.45 : 1,
        })}
      >
        <Text className="type-bodySm" style={{ color: colors.text2 }}>
          {selected?.short ?? model}
        </Text>
        <Feather name="chevron-down" size={13} color={colors.text3} />
      </Pressable>

      <Sheet
        visible={open}
        onClose={() => setOpen(false)}
        title="Modelo"
        description="Escolha o modelo que executa a sua pergunta."
        initialDetent={0.6}
      >
        <View className="px-2 pb-4">
          {available.map((item) => {
            const isSelected = item.id === model;

            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={item.name}
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  onChange(item.id);
                  setOpen(false);
                }}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 14,
                  borderRadius: 14,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: isSelected ? colors.goldBorder : colors.line,
                  backgroundColor: isSelected
                    ? colors.goldWash
                    : pressed
                      ? colors.elevated
                      : 'transparent',
                })}
              >
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="type-body" style={{ color: colors.text }}>
                      {item.name}
                    </Text>
                    {item.reasoning ? (
                      <View
                        style={{
                          paddingHorizontal: 6,
                          height: 20,
                          borderRadius: 4,
                          justifyContent: 'center',
                          backgroundColor: colors.violetWash,
                        }}
                      >
                        <Text className="type-micro" style={{ color: colors.violetSoft }}>
                          raciocínio
                        </Text>
                      </View>
                    ) : null}
                    {item.fast ? (
                      <View
                        style={{
                          paddingHorizontal: 6,
                          height: 20,
                          borderRadius: 4,
                          justifyContent: 'center',
                          backgroundColor: colors.cyanWash,
                        }}
                      >
                        <Text className="type-micro" style={{ color: colors.cyan }}>
                          rápido
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text className="type-caption mt-1" style={{ color: colors.text3 }}>
                    {item.description}
                  </Text>
                </View>

                {isSelected ? (
                  <Feather name="check" size={18} color={colors.gold} />
                ) : null}
              </Pressable>
            );
          })}

          {locked.length > 0 ? (
            <View className="mt-1">
              <Text className="eyebrow mb-2" style={{ color: colors.text3 }}>
                Disponível no KAZER MAX
              </Text>
              {locked.map((item) => (
                <View
                  key={item.id}
                  accessibilityLabel={`${item.name}, bloqueado no plano atual`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 14,
                    borderRadius: 14,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: colors.line,
                    opacity: 0.6,
                  }}
                >
                  <Feather name="lock" size={16} color={colors.text3} />
                  <View className="flex-1">
                    <Text className="type-body" style={{ color: colors.text2 }}>
                      {item.name}
                    </Text>
                    <Text className="type-caption mt-1" style={{ color: colors.text3 }}>
                      {item.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Sheet>
    </>
  );
}