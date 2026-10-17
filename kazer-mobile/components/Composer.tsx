/**
 * Composer — components.md §2.
 * Auto-expanding textarea (max 140px), mode switch on the left, model picker
 * and the gold send button on the right. The send button becomes stop while
 * streaming. Sits above the keyboard (KeyboardAvoidingView in the screen).
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  NativeSyntheticEvent,
  Pressable,
  Text,
  TextInput,
  TextInputContentSizeChangeEventData,
  TextInputProps,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { Mode, ModelId } from '@kazer/core';

import { useTheme } from '../hooks/useTheme';
import { composerMaxHeight } from '../constants/tokens';
import { ModeSwitch } from './ModeSwitch';
import { ModelPicker } from './ModelPicker';
import { modeMeta } from '../constants/icons';
import { tapFeedback } from '../src/services/native';

export interface ComposerProps {
  mode: Mode;
  model: ModelId;
  onModeChange: (mode: Mode) => void;
  onModelChange: (model: ModelId) => void;
  onSend: (text: string) => void;
  onStop?: () => void;
  streaming?: boolean;
  disabled?: boolean;
  /** Prefill, e.g. when a follow-up chip is tapped. */
  draft?: string;
  onDraftChange?: (value: string) => void;
  onAttach?: () => void;
  inputProps?: Pick<TextInputProps, 'autoFocus' | 'onFocus' | 'onBlur'>;
}

export function Composer({
  mode,
  model,
  onModeChange,
  onModelChange,
  onSend,
  onStop,
  streaming = false,
  disabled = false,
  draft,
  onDraftChange,
  onAttach,
  inputProps,
}: ComposerProps): React.JSX.Element {
  const { colors } = useTheme();
  const [internal, setInternal] = useState('');
  const [height, setHeight] = useState(24);
  const inputRef = useRef<TextInput>(null);

  const value = draft ?? internal;
  const canSend = value.trim().length > 0 && !disabled;

  const setValue = useCallback(
    (next: string) => {
      if (onDraftChange) onDraftChange(next);
      else setInternal(next);
    },
    [onDraftChange],
  );

  /**
   * Height is derived from the line count rather than from
   * `onContentSizeChange`: on web the reported content height tracks the
   * flex container, which makes the field grow to its own maximum.
   */
  const handleSizeChange = (): void => {
    const lines = value.split('\n').length;
    const next = Math.min(lines * 21 + 8, composerMaxHeight);
    setHeight(Math.max(24, next));
  };

  const submit = (): void => {
    if (!canSend) return;
    tapFeedback();
    onSend(value.trim());
    setValue('');
    setHeight(24);
  };

  const sendColor = mode === 'mission' ? colors.violet : colors.gold;

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: colors.base,
        borderTopWidth: 1,
        borderTopColor: colors.line,
      }}
    >
      <View
        style={{
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.lineStrong,
          backgroundColor: colors.inset,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        <TextInput
          ref={inputRef}
          accessibilityLabel={modeMeta[mode].placeholder}
          placeholder={modeMeta[mode].placeholder}
          placeholderTextColor={colors.text3}
          selectionColor={sendColor}
          multiline
          value={value}
          editable={!disabled}
          onChangeText={setValue}
          onContentSizeChange={handleSizeChange}
          onSubmitEditing={submit}
          blurOnSubmit={false}
          style={{
            minHeight: 24,
            maxHeight: composerMaxHeight,
            height,
            color: colors.text,
            fontSize: 15,
            lineHeight: 21,
            paddingTop: 2,
          }}
          {...inputProps}
        />

        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center gap-1">
            <ModeSwitch mode={mode} onChange={onModeChange} disabled={disabled} />
            <ModelPicker model={model} onChange={onModelChange} disabled={disabled} />
          </View>

          <View className="flex-row items-center gap-1">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Anexar arquivo"
              onPress={() => onAttach?.()}
              hitSlop={6}
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Feather name="paperclip" size={18} color={colors.text3} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={streaming ? 'Parar resposta' : 'Enviar'}
              accessibilityState={{ disabled: !streaming && !canSend }}
              hitSlop={4}
              onPress={() => {
                if (streaming) {
                  onStop?.();
                  return;
                }
                submit();
              }}
              style={({ pressed }) => ({
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: streaming ? colors.elevated : sendColor,
                borderWidth: streaming ? 1 : 0,
                borderColor: colors.line,
                opacity: !streaming && !canSend ? 0.45 : pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              {streaming ? (
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    backgroundColor: colors.text,
                  }}
                />
              ) : (
                <Feather name="arrow-up" size={20} color={colors.textInverse} />
              )}
            </Pressable>
          </View>
        </View>
      </View>

      <Text className="type-micro mt-2" style={{ color: colors.text3 }}>
        {streaming
          ? 'KAZER está executando. Toque no botão quadrado para parar.'
          : modeMeta[mode].hint}
      </Text>
    </View>
  );
}