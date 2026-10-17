/**
 * Sheet — bottom sheet with three detents (25% peek / 60% half / 92% full),
 * drag-to-dismiss with snap points, per screens.md mobile rules.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../hooks/useTheme';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { sheetDetents, type SheetDetent } from '../constants/tokens';
import { touchTarget } from '../constants/tokens';

const SPRING = { damping: 24, stiffness: 260, mass: 0.7 } as const;

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  /** Detent the sheet opens at. */
  initialDetent?: SheetDetent;
  children: React.ReactNode;
  /** Hide the last detent when content is short. */
  maxDetent?: SheetDetent;
}

export function Sheet({
  visible,
  onClose,
  title,
  description,
  initialDetent = 0.25,
  children,
  maxDetent = 0.92,
}: SheetProps): React.JSX.Element | null {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const reducedMotion = useReducedMotion();

  const detents = useMemo(
    () => sheetDetents.filter((detent) => detent <= maxDetent),
    [maxDetent],
  );

  const [sheetHeight, setSheetHeight] = useState(windowHeight * 0.6);
  const [detentIndex, setDetentIndex] = useState(() =>
    Math.max(0, detents.indexOf(initialDetent)),
  );

  // 0 = closed, 1 = fully open (translate from below the screen).
  const progress = useSharedValue(0);
  const dragOffset = useSharedValue(0);
  const startDetent = useSharedValue(0);

  const detentTranslate = useMemo(
    () =>
      detents.map((detent) => windowHeight - sheetHeight * detent),
    [detents, sheetHeight, windowHeight],
  );

  const baseTranslate = detentTranslate[detentIndex] ?? detentTranslate[0] ?? 0;

  useEffect(() => {
    if (!visible) return;
    setDetentIndex(Math.max(0, detents.indexOf(initialDetent)));
    progress.value = reducedMotion
      ? withTiming(1, { duration: 100 })
      : withSpring(1, SPRING);
  }, [detents, initialDetent, progress, reducedMotion, visible]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.height;
    if (next > 0) setSheetHeight(next);
  }, []);

  const close = useCallback(() => {
    progress.value = reducedMotion
      ? withTiming(0, { duration: 100 }, (finished) => {
          if (finished) runOnJS(onClose)();
        })
      : withSpring(0, SPRING, (finished) => {
          if (finished) runOnJS(onClose)();
        });
  }, [onClose, progress, reducedMotion]);

  const snapTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(detents.length - 1, index));
      setDetentIndex(clamped);
    },
    [detents.length],
  );

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(visible)
        .onBegin(() => {
          startDetent.value = detentIndex;
        })
        .onUpdate((event) => {
          dragOffset.value = event.translationY;
        })
        .onEnd((event) => {
          const index = startDetent.value;
          const currentOffset = detentTranslate[index] ?? 0;
          const projected = currentOffset + event.translationY;

          if (event.translationY > 80 || event.velocityY > 900) {
            progress.value = withSpring(
              windowHeight,
              SPRING,
              (finished) => {
                if (finished) runOnJS(close)();
              },
            );
            return;
          }

          // Snap to whichever detent the projected position is closest to.
          let closest = 0;
          let smallest = Number.POSITIVE_INFINITY;
          for (let i = 0; i < detentTranslate.length; i += 1) {
            const distance = Math.abs((detentTranslate[i] ?? 0) - projected);
            if (distance < smallest) {
              smallest = distance;
              closest = i;
            }
          }
          runOnJS(snapTo)(closest);
        }),
    [
      close,
      detentIndex,
      detentTranslate,
      dragOffset,
      progress,
      snapTo,
      startDetent,
      visible,
      windowHeight,
    ],
  );

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          baseTranslate +
          (progress.value >= 1 ? dragOffset.value : progress.value * windowHeight),
      },
    ],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value === 0 ? 0 : Math.min(1, progress.value * 1.4),
  }));

  if (!visible) return null;

  const activeDetent = detents[detentIndex] ?? 0.25;
  const maxHeight = Math.min(windowHeight * 0.92, windowHeight - insets.top);

  return (
    <View style={{ position: 'absolute', inset: 0 }} pointerEvents="box-none">
      <Animated.View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.72)',
          },
          backdropStyle,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar painel"
          onPress={close}
          style={{ flex: 1 }}
        />
      </Animated.View>

      <GestureDetector gesture={gesture}>
        <Animated.View
          accessibilityViewIsModal
          accessibilityRole="adjustable"
          accessibilityLabel={title ?? 'Painel'}
          onLayout={handleLayout}
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              maxHeight,
              backgroundColor: colors.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderWidth: 1,
              borderColor: colors.lineStrong,
              borderBottomWidth: 0,
              paddingBottom: Math.max(insets.bottom, 12),
              overflow: 'hidden',
            },
            sheetStyle,
          ]}
        >
          {/* Drag handle */}
          <View
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel="Arrastar"
            style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 6 }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.overlay,
              }}
            />
          </View>

          {title || description ? (
            <View className="flex-row items-start px-4 pb-2">
              <View className="flex-1 pr-3">
                {title ? (
                  <Text className="type-h3" style={{ color: colors.text }}>
                    {title}
                  </Text>
                ) : null}
                {description ? (
                  <Text className="type-bodySm" style={{ color: colors.text3, marginTop: 2 }}>
                    {description}
                  </Text>
                ) : null}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fechar"
                onPress={close}
                hitSlop={8}
                style={{
                  width: touchTarget,
                  height: touchTarget,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Feather name="x" size={20} color={colors.text2} />
              </Pressable>
            </View>
          ) : null}

          <View
            style={{
              maxHeight: activeDetent * windowHeight - 64,
              paddingBottom: 8,
            }}
          >
            {children}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}