/**
 * ArtifactCard — components.md §7.
 * Preview 96px + type/name + version badge + size. On a locked plan the card
 * renders with an overlay: never hidden, always explained.
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { formatBytes } from '@kazer/core';
import type { Artifact } from '@kazer/core';

import { useTheme } from '../hooks/useTheme';
import { artifactIcons, artifactTypeLabels } from '../constants/icons';

export interface ArtifactCardProps {
  artifact: Artifact;
  onPress?: (artifact: Artifact) => void;
  /** Compact list row (inside a chat message). */
  layout?: 'grid' | 'row';
  locked?: boolean;
}

export function ArtifactCard({
  artifact,
  onPress,
  layout = 'grid',
  locked = false,
}: ArtifactCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const icon = artifactIcons[artifact.type];

  if (layout === 'row') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${artifact.name}, versão ${artifact.version}, ${formatBytes(
          artifact.sizeBytes,
        )}`}
        onPress={() => onPress?.(artifact)}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 12,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.line,
          backgroundColor: pressed ? colors.elevated : colors.surface,
        })}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.goldWash,
            borderWidth: 1,
            borderColor: colors.goldBorder,
          }}
        >
          <Feather name={icon} size={18} color={colors.goldText} />
        </View>

        <View className="flex-1">
          <Text className="type-bodySm" numberOfLines={1} style={{ color: colors.text }}>
            {artifact.name}
          </Text>
          <Text className="type-micro mt-1" style={{ color: colors.text3 }}>
            {artifactTypeLabels[artifact.type]} · v{artifact.version} ·{' '}
            {formatBytes(artifact.sizeBytes)}
          </Text>
        </View>

        <Feather name="chevron-right" size={16} color={colors.text3} />
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${artifact.name}, versão ${artifact.version}, ${formatBytes(
        artifact.sizeBytes,
      )}${locked ? '. Disponível no KAZER MAX' : ''}`}
      onPress={() => onPress?.(artifact)}
      style={({ pressed }) => ({
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: colors.surface,
        overflow: 'hidden',
        opacity: pressed ? 0.9 : 1,
      })}
    >
      {/* Preview / type icon */}
      <View
        style={{
          height: 96,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.inset,
          borderBottomWidth: 1,
          borderBottomColor: colors.line,
        }}
      >
        <Feather name={icon} size={26} color={colors.goldText} />
        <Text className="type-micro mt-2" style={{ color: colors.text3 }}>
          {artifactTypeLabels[artifact.type]}
        </Text>
      </View>

      <View className="p-3">
        <Text className="type-bodySm" numberOfLines={2} style={{ color: colors.text }}>
          {artifact.name}
        </Text>

        <View className="flex-row items-center gap-2 mt-2">
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
              v{artifact.version}
            </Text>
          </View>
          <Text className="type-micro" style={{ color: colors.text3 }}>
            {formatBytes(artifact.sizeBytes)}
          </Text>
        </View>
      </View>

      {locked ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.redWash,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Feather name="lock" size={18} color={colors.red} />
          <Text className="type-micro" style={{ color: colors.red }}>
            KAZER MAX
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/** Compact header used by the artifact preview sheet. */
export function ArtifactHeader({ artifact }: { artifact: Artifact }): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center gap-3">
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.goldWash,
          borderWidth: 1,
          borderColor: colors.goldBorder,
        }}
      >
        <Feather name={artifactIcons[artifact.type]} size={20} color={colors.goldText} />
      </View>
      <View className="flex-1">
        <Text className="type-body" numberOfLines={2} style={{ color: colors.text }}>
          {artifact.name}
        </Text>
        <Text className="type-micro mt-1" style={{ color: colors.text3 }}>
          {artifactTypeLabels[artifact.type]} · v{artifact.version} ·{' '}
          {formatBytes(artifact.sizeBytes)}
        </Text>
      </View>
    </View>
  );
}