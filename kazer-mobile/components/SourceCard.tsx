/**
 * SourceCard — components.md §5.
 * Favicon + domain, title (2 lines), snippet (3 lines), actions. States:
 * default · active (gold border, after a citation tap) · saved.
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { Source } from '@kazer/core';

import { useTheme } from '../hooks/useTheme';
import { Favicon } from './Avatar';
import { openUrl, tapFeedback } from '../src/services/native';

export interface SourceCardProps {
  source: Source;
  active?: boolean;
  onPress?: (source: Source) => void;
  onToggleSave?: (source: Source) => void;
  /** Number of lines for the snippet. */
  snippetLines?: number;
}

export function SourceCard({
  source,
  active = false,
  onPress,
  onToggleSave,
  snippetLines = 3,
}: SourceCardProps): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Fonte ${source.index}: ${source.title}. ${source.domain}`}
      accessibilityState={{ selected: active }}
      onPress={() => {
        tapFeedback();
        onPress?.(source);
      }}
      style={({ pressed }) => ({
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: active ? colors.goldBorder : colors.line,
        backgroundColor: active
          ? colors.goldWash
          : pressed
            ? colors.elevated
            : colors.surface,
      })}
    >
      <View className="flex-row items-center gap-2">
        <Favicon domain={source.domain} favicon={source.favicon} />
        <Text className="type-micro flex-1" numberOfLines={1} style={{ color: colors.text3 }}>
          {source.domain}
        </Text>
        {source.cited ? (
          <View
            style={{
              paddingHorizontal: 6,
              height: 20,
              borderRadius: 4,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.goldWash,
            }}
          >
            <Text className="type-micro" style={{ color: colors.goldText }}>
              {source.index}
            </Text>
          </View>
        ) : null}
      </View>

      <Text
        className="type-bodySm mt-2"
        numberOfLines={2}
        style={{ color: colors.text, lineHeight: 20 }}
      >
        {source.title}
      </Text>

      <Text
        className="type-caption mt-1"
        numberOfLines={snippetLines}
        style={{ color: colors.text2, lineHeight: 18 }}
      >
        {source.snippet}
      </Text>

      <View className="flex-row items-center gap-2 mt-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Abrir ${source.domain}`}
          onPress={() => void openUrl(source.url)}
          hitSlop={8}
          style={({ pressed }) => ({
            minHeight: 32,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 8,
            borderRadius: 6,
            backgroundColor: pressed ? colors.inset : 'transparent',
          })}
        >
          <Feather name="external-link" size={14} color={colors.text3} />
          <Text className="type-micro" style={{ color: colors.text3 }}>
            Abrir
          </Text>
        </Pressable>

        {onToggleSave ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={source.saved ? 'Remover dos salvos' : 'Salvar fonte'}
            onPress={() => onToggleSave(source)}
            hitSlop={8}
            style={({ pressed }) => ({
              minHeight: 32,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 8,
              borderRadius: 6,
              backgroundColor: pressed ? colors.inset : 'transparent',
            })}
          >
            <Feather
              name={source.saved ? 'check' : 'bookmark'}
              size={14}
              color={source.saved ? colors.green : colors.text3}
            />
            <Text
              className="type-micro"
              style={{ color: source.saved ? colors.green : colors.text3 }}
            >
              {source.saved ? 'Salva' : 'Salvar'}
            </Text>
          </Pressable>
        ) : null}

        <View className="flex-1" />

        <Text className="type-micro" style={{ color: colors.text3, fontFamily: 'monospace' }}>
          {Math.round(source.relevance * 100)}%
        </Text>
      </View>
    </Pressable>
  );
}

/** Panel footer: `5 fontes · 12 lidas` + save-all. */
export function SourcePanelFooter({
  count,
  readCount,
  savedCount,
  onSaveAll,
}: {
  count: number;
  readCount: number;
  savedCount?: number;
  onSaveAll?: () => void;
}): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center justify-between py-3">
      <Text className="type-micro" style={{ color: colors.text3 }}>
        {count} fontes · {readCount} lidas
        {savedCount ? ` · ${savedCount} salvas` : ''}
      </Text>
      {onSaveAll ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Salvar todas as fontes"
          onPress={onSaveAll}
          hitSlop={8}
        >
          <Text className="type-caption" style={{ color: colors.goldText }}>
            Salvar todas
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}