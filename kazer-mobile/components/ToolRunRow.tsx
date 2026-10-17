/**
 * ToolRunRow — compact mono line inside the Mission Trace (components.md §6).
 * Tapping expands the raw output.
 */

import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { formatDuration } from '@kazer/core';
import type { ToolRun, ToolRunStatus } from '@kazer/core';

import { useTheme } from '../hooks/useTheme';

const STATUS_GLYPH: Record<ToolRunStatus, string> = {
  pending: '○',
  running: '◐',
  done: '●',
  error: '✕',
};

export function ToolRunRow({ run }: { run: ToolRun }): React.JSX.Element {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const statusColor =
    run.status === 'done'
      ? colors.green
      : run.status === 'running'
        ? colors.cyan
        : run.status === 'error'
          ? colors.red
          : colors.text3;

  const summary =
    run.status === 'done'
      ? (run.detail ?? 'executado')
      : run.status === 'running'
        ? 'executando…'
        : run.status === 'error'
          ? (run.output ?? 'falhou')
          : 'aguardando';

  return (
    <View style={{ marginLeft: 2 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${run.name}. ${summary}. ${formatDuration(run.durationMs)}`}
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((current) => !current)}
        style={({ pressed }) => ({
          minHeight: 32,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 8,
          borderRadius: 6,
          backgroundColor: pressed ? colors.inset : 'transparent',
        })}
      >
        <Text
          style={{
            color: statusColor,
            fontSize: 12,
            lineHeight: 16,
            fontFamily: 'monospace',
          }}
        >
          {STATUS_GLYPH[run.status]}
        </Text>

        <Text
          className="type-codeSm"
          numberOfLines={1}
          style={{
            color: colors.text2,
            fontFamily: 'monospace',
            flexShrink: 1,
          }}
        >
          {run.name}
        </Text>

        <Text
          className="type-codeSm flex-1"
          numberOfLines={1}
          style={{ color: colors.text3, fontFamily: 'monospace' }}
        >
          {summary}
        </Text>

        <Text
          className="type-codeSm"
          style={{ color: colors.text3, fontFamily: 'monospace' }}
        >
          {formatDuration(run.durationMs)}
        </Text>

        {run.output ? (
          <Feather
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={colors.text3}
          />
        ) : null}
      </Pressable>

      {expanded && run.output ? (
        <View
          style={{
            marginHorizontal: 8,
            marginBottom: 8,
            padding: 10,
            borderRadius: 6,
            backgroundColor: colors.inset,
            borderWidth: 1,
            borderColor: colors.line,
          }}
        >
          <Text
            className="type-codeSm"
            style={{ color: colors.text2, fontFamily: 'monospace' }}
          >
            {run.output}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** Group of tool runs with an "Execução" eyebrow label. */
export function ToolRunList({ runs }: { runs: ToolRun[] }): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={`Execução, ${runs.length} ferramentas`}
      style={{
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: colors.surface,
        paddingVertical: 4,
      }}
    >
      <View className="px-3 pt-2 pb-1">
        <Text className="eyebrow" style={{ color: colors.text3 }}>
          Execução
        </Text>
      </View>
      {runs.map((run) => (
        <ToolRunRow key={run.id} run={run} />
      ))}
    </View>
  );
}