/**
 * MessageBubble — components.md §3.
 * The KAZER does not use chat bubbles: the agent answer is flowing content
 * with the Mission Trace on its left; the user turn is a surface block with a
 * hairline border and a 4px bottom-right corner.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { setStringAsync } from 'expo-clipboard';
import type { Artifact, Message, Source } from '@kazer/core';

import { useTheme } from '../hooks/useTheme';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { MissionTrace } from './MissionTrace';
import { ToolRunList } from './ToolRunRow';
import { Markdown } from './Markdown';
import { FollowUpChips } from './FollowUpChips';
import { ArtifactCard } from './ArtifactCard';
import { buildMissionSteps } from '../src/utils/missionTrace';

export interface MessageBubbleProps {
  message: Message;
  sources?: Source[];
  artifacts?: Artifact[];
  /** Live draft: the answer is still arriving. */
  streaming?: boolean;
  interrupted?: boolean;
  activeCitation?: number | null;
  onCitationPress?: (index: number) => void;
  onFollowUp?: (text: string) => void;
  onRegenerate?: () => void;
  onArtifactPress?: (artifact: Artifact) => void;
}

/** fade + y:8px → 0, 320ms, easeOut (SKILL.md §4). */
function useEntrance(reducedMotion: boolean, index: number) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const delay = reducedMotion ? 0 : Math.min(index, 3) * 40;
    const timer = setTimeout(() => {
      progress.value = reducedMotion
        ? withTiming(1, { duration: 100 })
        : withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) });
    }, delay);
    return () => clearTimeout(timer);
  }, [index, progress, reducedMotion]);

  return useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: reducedMotion ? [] : [{ translateY: (1 - progress.value) * 8 }],
  }));
}

function ReasoningBlock({ text }: { text: string }): React.JSX.Element {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Bloco de raciocínio"
      accessibilityState={{ expanded }}
      onPress={() => setExpanded((current) => !current)}
      style={{
        borderLeftWidth: 2,
        borderLeftColor: colors.violet,
        backgroundColor: colors.violetWash,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}
    >
      <View className="flex-row items-center gap-2">
        <Feather name="cpu" size={13} color={colors.violetSoft} />
        <Text className="type-micro" style={{ color: colors.violetSoft }}>
          Raciocínio
        </Text>
        <View className="flex-1" />
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={colors.violetSoft}
        />
      </View>

      {expanded ? (
        <Text
          className="type-codeSm mt-2"
          style={{ color: colors.text2, fontFamily: 'monospace' }}
        >
          {text}
        </Text>
      ) : null}
    </Pressable>
  );
}

function MessageActions({
  content,
  onRegenerate,
}: {
  content: string;
  onRegenerate?: () => void;
}): React.JSX.Element {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);

  const copy = (): void => {
    void setStringAsync(content)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  };

  return (
    <View className="flex-row items-center gap-1">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Copiar resposta"
        onPress={copy}
        hitSlop={8}
        style={{ minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8 }}
      >
        <Feather name={copied ? 'check' : 'copy'} size={14} color={copied ? colors.green : colors.text3} />
        <Text className="type-micro" style={{ color: copied ? colors.green : colors.text3 }}>
          {copied ? 'Copiado' : 'Copiar'}
        </Text>
      </Pressable>

      {onRegenerate ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Regenerar resposta"
          onPress={onRegenerate}
          hitSlop={8}
          style={{ minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8 }}
        >
          <Feather name="refresh-cw" size={14} color={colors.text3} />
          <Text className="type-micro" style={{ color: colors.text3 }}>
            Refazer
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function MessageBubble({
  message,
  sources,
  artifacts,
  streaming = false,
  interrupted = false,
  activeCitation,
  onCitationPress,
  onFollowUp,
  onRegenerate,
  onArtifactPress,
}: MessageBubbleProps): React.JSX.Element {
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const entrance = useEntrance(reducedMotion, 0);

  const steps = useMemo(
    () =>
      buildMissionSteps({
        mode: message.mode,
        toolRuns: message.toolRuns,
        streaming,
        hasSources: (message.citations?.length ?? 0) > 0,
        hasArtifact: (message.artifactIds?.length ?? 0) > 0,
      }),
    [message.artifactIds, message.citations, message.mode, message.toolRuns, streaming],
  );

  if (message.role === 'user') {
    return (
      <Animated.View style={entrance}>
        <View
          style={{
            alignSelf: 'flex-end',
            maxWidth: '92%',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 14,
            // Bottom-right 4px is the authorship mark, not decoration.
            borderBottomRightRadius: 4,
            borderWidth: 1,
            borderColor: colors.line,
            backgroundColor: colors.surface,
          }}
          accessible
          accessibilityLabel={`Você: ${message.content}`}
        >
          <Text className="type-body" style={{ color: colors.text }}>
            {message.content}
          </Text>
        </View>
      </Animated.View>
    );
  }

  const attached = (message.artifactIds ?? [])
    .map((id) => artifacts?.find((artifact) => artifact.id === id))
    .filter((artifact): artifact is Artifact => Boolean(artifact));

  return (
    <Animated.View style={entrance}>
      <View className="gap-3">
        <MissionTrace steps={steps} />

        {message.reasoning ? <ReasoningBlock text={message.reasoning} /> : null}

        {message.content ? (
          <Markdown
            content={message.content}
            sources={sources}
            activeCitation={activeCitation}
            onCitationPress={onCitationPress}
          />
        ) : null}

        {attached.length > 0 ? (
          <View className="gap-2">
            <Text className="eyebrow" style={{ color: colors.text3 }}>
              Artefatos
            </Text>
            {attached.map((artifact) => (
              <ArtifactCard
                key={artifact.id}
                artifact={artifact}
                layout="row"
                onPress={onArtifactPress}
              />
            ))}
          </View>
        ) : null}

        {message.toolRuns && message.toolRuns.length > 0 ? (
          <ToolRunList runs={message.toolRuns} />
        ) : null}

        {interrupted ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              padding: 12,
              borderRadius: 10,
              backgroundColor: colors.amberWash,
              borderWidth: 1,
              borderColor: colors.amber,
            }}
          >
            <Feather name="alert-triangle" size={14} color={colors.amber} />
            <Text className="type-bodySm flex-1" style={{ color: colors.amber }}>
              Resposta interrompida.
            </Text>
          </View>
        ) : null}

        {!streaming && message.content ? (
          <MessageActions content={message.content} onRegenerate={onRegenerate} />
        ) : null}

        {message.followUps && message.followUps.length > 0 && !streaming ? (
          <FollowUpChips prompts={message.followUps} onSelect={onFollowUp} />
        ) : null}
      </View>
    </Animated.View>
  );
}