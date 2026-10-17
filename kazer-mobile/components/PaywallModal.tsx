/**
 * PaywallModal — components.md §12.
 * Opened when a MAX-only capability is requested (mission execution, artifact
 * creation, unlimited Skills) on a lower plan.
 *
 * Copy is fixed by the product spec and must not be reworded.
 */

import React, { useCallback } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Stop } from 'react-native-svg';
import { planDefinitions } from '@kazer/core';

import { useTheme } from '../hooks/useTheme';
import { Button } from './Button';
import { KazerMark } from './KazerMark';
import { subscribeToPlan } from '../src/store/planStore';
import { successFeedback, tapFeedback } from '../src/services/native';

export const paywallCopy = {
  title: 'Desbloqueie o KAZER MAX',
  subtitle: 'Execução de tarefas, agentes e criação de artefatos.',
  price: 'R$ 59,99/mês',
  primary: 'Ativar KAZER MAX',
  dismiss: 'Continuar no plano atual',
  /** Inline notice shown before the modal takes over. */
  notice: 'Execução de tarefas está disponível no KAZER MAX — R$ 59,99/mês',
} as const;

const benefits: string[] =
  planDefinitions.find((plan) => plan.id === 'max')?.highlights.slice(0, 5) ?? [];

export interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribed?: () => void;
  /** What triggered the gate — shown as context above the title. */
  context?: string;
}

export function PaywallModal({
  visible,
  onClose,
  onSubscribed,
  context,
}: PaywallModalProps): React.JSX.Element {
  const { colors } = useTheme();

  const handleSubscribe = useCallback(() => {
    successFeedback();
    void subscribeToPlan('max').then(() => {
      onSubscribed?.();
      onClose();
    });
  }, [onClose, onSubscribed]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        accessibilityViewIsModal
        accessibilityLiveRegion="polite"
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.72)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          onPress={onClose}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />

        <View
          accessibilityRole="alert"
          accessibilityLabel={`${paywallCopy.title}. ${paywallCopy.subtitle} ${paywallCopy.price}`}
          style={{
            width: '100%',
            maxWidth: 420,
            borderRadius: 20,
            padding: 24,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.goldBorder,
            shadowColor: colors.gold,
            shadowOpacity: 0.22,
            shadowRadius: 32,
            shadowOffset: { width: 0, height: 8 },
            elevation: 12,
          }}
        >
          {/* Metallic crown ring — gradient restricted to the logo and paywall */}
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              overflow: 'hidden',
            }}
          >
            <Svg width={56} height={56} style={{ position: 'absolute' }}>
              <Defs>
                <LinearGradient id="paywallRing" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor="#FED25F" />
                  <Stop offset="0.35" stopColor="#E2AE43" />
                  <Stop offset="0.6" stopColor="#AD7B37" />
                  <Stop offset="1" stopColor="#F2CD64" />
                </LinearGradient>
              </Defs>
            </Svg>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                borderWidth: 1,
                borderColor: colors.goldBorder,
                backgroundColor: colors.inset,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <KazerMark size={24} />
            </View>
          </View>

          {context ? (
            <View
              style={{
                alignSelf: 'flex-start',
                paddingHorizontal: 8,
                height: 22,
                justifyContent: 'center',
                borderRadius: 4,
                backgroundColor: colors.goldWash,
                marginBottom: 10,
              }}
            >
              <Text className="type-micro" style={{ color: colors.goldText }}>
                {context}
              </Text>
            </View>
          ) : null}

          <Text style={{ color: colors.text, fontSize: 24, lineHeight: 30, fontWeight: '500' }}>
            {paywallCopy.title}
          </Text>

          <Text className="type-body" style={{ color: colors.text2, marginTop: 6 }}>
            {paywallCopy.subtitle}
          </Text>

          <View className="flex-row items-baseline mt-4">
            <Text
              style={{
                color: colors.text,
                fontSize: 36,
                lineHeight: 42,
                fontWeight: '500',
                letterSpacing: -0.8,
              }}
            >
              R$ 59,99
            </Text>
            <Text className="type-bodySm ml-1" style={{ color: colors.text3 }}>
              /mês
            </Text>
          </View>

          <View className="mt-4 gap-2">
            {benefits.map((benefit) => (
              <View key={benefit} className="flex-row items-center gap-2">
                <Feather name="check" size={14} color={colors.gold} />
                <Text className="type-bodySm flex-1" style={{ color: colors.text2 }}>
                  {benefit}
                </Text>
              </View>
            ))}
          </View>

          <Button
            label={paywallCopy.primary}
            onPress={handleSubscribe}
            fullWidth
            size="lg"
            style={{ marginTop: 20 }}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={paywallCopy.dismiss}
            onPress={() => {
              tapFeedback();
              onClose();
            }}
            style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 4 }}
          >
            <Text className="type-caption" style={{ color: colors.text3 }}>
              {paywallCopy.dismiss}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/** Inline version of the paywall message, shown before the modal opens. */
export function PaywallNotice(): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={paywallCopy.notice}
      accessibilityRole="alert"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 10,
        backgroundColor: colors.goldWash,
        borderWidth: 1,
        borderColor: colors.goldBorder,
      }}
    >
      <Feather name="lock" size={14} color={colors.goldText} />
      <Text className="type-caption flex-1" style={{ color: colors.goldText }}>
        {paywallCopy.notice}
      </Text>
    </View>
  );
}