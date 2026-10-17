/**
 * SourcesSheet — the mobile version of the "Fontes" side panel
 * (screens.md: below `lg` the panel becomes a bottom sheet).
 * Search → list of source cards → footer count.
 */

import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { Source } from '@kazer/core';

import { useTheme } from '../hooks/useTheme';
import { Sheet } from './Sheet';
import { Input } from './Input';
import { SourceCard, SourcePanelFooter } from './SourceCard';
import { EmptyState } from './EmptyState';
import { SkeletonSources } from './Skeleton';
import { DemoNote } from './Chip';

export function SourcesSheet({
  visible,
  onClose,
  sources,
  readCount,
  loading = false,
  activeCitation,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  sources: Source[];
  readCount?: number;
  loading?: boolean;
  activeCitation?: number | null;
  onSelect?: (source: Source) => void;
}): React.JSX.Element {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sources;
    return sources.filter(
      (source) =>
        source.title.toLowerCase().includes(q) || source.domain.toLowerCase().includes(q),
    );
  }, [query, sources]);

  const savedCount = sources.filter((source) => saved[source.id]).length;

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Fontes"
      description="Cada afirmação da resposta está ancorada em uma fonte."
      initialDetent={0.6}
    >
      <View className="px-4 pb-2">
        <Input
          placeholder="Filtrar por domínio ou título"
          value={query}
          onChangeText={setQuery}
          icon="search"
          autoCorrect={false}
          onClear={() => setQuery('')}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? <SkeletonSources /> : null}

        {!loading && filtered.length === 0 ? (
          <EmptyState
            icon="search"
            title="Nenhuma fonte"
            description="Ajuste a busca para encontrar outro documento."
          />
        ) : null}

        {!loading
          ? filtered.map((source) => (
              <View key={source.id} className="mb-2">
                <SourceCard
                  source={{
                    ...source,
                    saved: source.saved || Boolean(saved[source.id]),
                  }}
                  active={activeCitation === source.index}
                  onPress={(selected) => onSelect?.(selected)}
                  onToggleSave={(selected) =>
                    setSaved((current) => ({
                      ...current,
                      [selected.id]: !current[selected.id],
                    }))
                  }
                />
              </View>
            ))
          : null}

        <SourcePanelFooter
          count={sources.length}
          readCount={readCount ?? sources.length}
          savedCount={savedCount}
          onSaveAll={() => {
            setSaved(
              sources.reduce<Record<string, boolean>>((accumulator, source) => {
                accumulator[source.id] = true;
                return accumulator;
              }, {}),
            );
          }}
        />

        <DemoNote />
      </ScrollView>
    </Sheet>
  );
}

/** Header chip that opens the sheet: `Fontes (5)`. */
export function SourcesTrigger({
  count,
  onPress,
}: {
  count: number;
  onPress: () => void;
}): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir fontes, ${count} disponíveis`}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        height: 36,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: pressed ? colors.elevated : 'transparent',
      })}
    >
      <Feather name="book-open" size={13} color={colors.text3} />
      <Text className="type-bodySm" style={{ color: colors.text2 }}>
        {`Fontes (${count})`}
      </Text>
    </Pressable>
  );
}