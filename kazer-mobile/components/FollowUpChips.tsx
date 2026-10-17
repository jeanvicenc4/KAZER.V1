/**
 * FollowUpChips — the "continuar?" suggestions under an answer.
 * Wrapping chips with gold outline; 44px effective touch target.
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../hooks/useTheme';
import { tapFeedback } from '../src/services/native';

export function FollowUpChips({
  prompts,
  onSelect,
}: {
  prompts: string[];
  onSelect?: (prompt: string) => void;
}): React.JSX.Element | null {
  const { colors } = useTheme();

  if (prompts.length === 0) return null;

  return (
    <View
      className="gap-2"
      accessible
      accessibilityLabel={`Sugestões: ${prompts.length}`}
    >
      <View className="flex-row items-center gap-2">
        <Feather name="corner-down-right" size={13} color={colors.text3} />
        <Text className="eyebrow" style={{ color: colors.text3 }}>
          Continuar
        </Text>
      </View>

      <View className="flex-row flex-wrap" style={{ gap: 8 }}>
        {prompts.map((prompt) => (
          <Pressable
            key={prompt}
            accessibilityRole="button"
            accessibilityLabel={prompt}
            onPress={() => {
              tapFeedback();
              onSelect?.(prompt);
            }}
            style={({ pressed }) => ({
              minHeight: 36,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: colors.goldBorder,
              backgroundColor: pressed ? colors.gold : colors.goldWash,
            })}
          >
            <Text className="type-bodySm" style={{ color: colors.goldText }}>
              {prompt}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}