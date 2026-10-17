/**
 * MissionTrace — the KAZER signature (components.md §1).
 *
 * A 2px vertical rail to the left of the answer. Each step lights up as the
 * stream advances: pending (dim ○) → active (pulsing ◐) → done (filled ●).
 * Never blinks, never a spinner.
 */

import React from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../hooks/useTheme';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { MissionStep } from '@kazer/core';

function StepNode({
  status,
  color,
}: {
  status: MissionStep['status'];
  color: string;
}): React.JSX.Element {
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    if (status !== 'active' || reducedMotion) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.35, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [pulse, reducedMotion, status]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: status === 'pending' ? 0.35 : 1,
  }));

  const size = 9;

  return (
    <Animated.View style={[{ width: size, height: size }, pulseStyle]}>
      {status === 'done' ? (
        // Filled node.
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          }}
        />
      ) : status === 'active' ? (
        // Half-filled node: filled left half, outlined right half.
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1.5,
            borderColor: color,
            overflow: 'hidden',
          }}
        >
          <View style={{ width: '50%', height: '100%', backgroundColor: color }} />
        </View>
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1.5,
            borderColor: colors.lineActive,
          }}
        />
      )}
    </Animated.View>
  );
}

export interface MissionTraceProps {
  steps: MissionStep[];
  /** Show the mono sub-line under the active/done step. */
  showDetail?: boolean;
  /** Collapsed rail: nodes only, used on narrow screens. */
  compact?: boolean;
  /**
   * Vertical rail of nodes only — no labels. Used inside the chat, where the
   * tool-run rows beside it already carry the labels. Rendering a full trace
   * there would overlap the answer.
   */
  railOnly?: boolean;
}

export function MissionTrace({
  steps,
  showDetail = true,
  compact = false,
  railOnly = false,
}: MissionTraceProps): React.JSX.Element {
  const { colors } = useTheme();

  if (railOnly) return <VerticalRail steps={steps} />;

  return (
    <View
      accessible
      accessibilityRole="list"
      accessibilityLabel="Missão Trace"
      style={{ flexDirection: 'row', gap: 12 }}
    >
      {/* The rail */}
      <View style={{ width: 2, paddingVertical: 3 }}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const nodeColor =
            step.status === 'done'
              ? colors.gold
              : step.status === 'active'
                ? colors.cyan
                : colors.lineActive;

          return (
            <View
              key={step.id}
              style={{ flex: 1, alignItems: 'center' }}
              accessibilityElementsHidden
            >
              {/* Connector above the node, tinted towards the active step */}
              {index > 0 ? (
                <View
                  style={{
                    flex: 1,
                    width: 2,
                    backgroundColor:
                      step.status === 'pending' ? colors.line : colors.goldBorder,
                  }}
                />
              ) : (
                <View style={{ height: 2 }} />
              )}

              <StepNode status={step.status} color={nodeColor} />

              {!isLast ? (
                <View
                  style={{
                    flex: 1,
                    width: 2,
                    backgroundColor:
                      step.status === 'done' ? colors.gold : colors.line,
                  }}
                />
              ) : (
                <View style={{ height: 2 }} />
              )}
            </View>
          );
        })}
      </View>

      {/* Step labels */}
      <View className="flex-1" style={{ gap: 10 }}>
        {steps.map((step) => (
          <View
            key={step.id}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${step.label}. ${statusLabel(step.status)}${
              step.detail ? `. ${step.detail}` : ''
            }`}
            accessibilityState={{ selected: step.status === 'active' }}
          >
            <Text
              className="type-bodySm"
              style={{
                color:
                  step.status === 'pending'
                    ? colors.text3
                    : step.status === 'active'
                      ? colors.text
                      : colors.text2,
                fontWeight: step.status === 'active' ? '500' : '400',
              }}
            >
              {step.label}
            </Text>

            {showDetail && !compact && step.detail ? (
              <Text
                className="type-codeSm mt-1"
                style={{
                  color: colors.text3,
                  fontFamily: 'monospace',
                }}
                numberOfLines={2}
              >
                {step.detail}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * VerticalRail — the signature element in its condensed form.
 * A 2px rail with one node per step, connected top to bottom.
 */
function VerticalRail({ steps }: { steps: MissionStep[] }): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View
      accessible
      accessibilityRole="list"
      accessibilityLabel="Progresso da missão"
      style={{ width: 12, alignItems: 'center' }}
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const accent =
          step.status === 'done'
            ? colors.gold
            : step.status === 'active'
              ? colors.cyan
              : colors.lineActive;

        return (
          <View key={step.id} style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                marginTop: 3,
                borderWidth: step.status === 'pending' ? 1 : 0,
                borderColor: colors.lineActive,
                backgroundColor: step.status === 'done' ? accent : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {step.status === 'active' ? (
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: accent,
                  }}
                />
              ) : null}
            </View>

            {!isLast ? (
              <View
                style={{
                  width: 2,
                  height: 18,
                  backgroundColor:
                    step.status === 'done' ? colors.goldBorder : colors.line,
                }}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function statusLabel(status: MissionStep['status']): string {
  if (status === 'done') return 'concluído';
  if (status === 'active') return 'em andamento';
  return 'pendente';
}

/** Staggered entrance used by panels: 40ms per item, capped at 6 (tokens.md §7). */
export function useCascadeDelay(index: number, reducedMotion: boolean): number {
  const { durations } = useTheme().theme.motion;
  if (reducedMotion) return 0;
  return Math.min(index, 6) * durations.cascadeStep;
}