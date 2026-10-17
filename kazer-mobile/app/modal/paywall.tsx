import * as React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { KazerMark } from '../../components/KazerMark';
import { useTheme } from '../../src/theme';

/**
 * PaywallModal — mobile.
 * Title: "Desbloqueie o KAZER MAX"
 * Subtitle: "Execução de tarefas, agentes e criação de artefatos."
 * Price: R$ 59,99/mês
 * CTA: "Ativar KAZER MAX" · Link: "Continuar no plano atual"
 */

const BENEFITS = [
  'Execução de tarefas e missões completas',
  'Agentes autônomos com tool calling',
  'Artefatos em PDF, DOCX, XLSX, CSV e código',
  'Execução em segundo plano com notificação',
  'Fila prioritária e Skills ilimitadas',
];

export default function PaywallModal() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.72)' }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.colors.gold,
            backgroundColor: theme.colors.surface,
            overflow: 'hidden',
          }}
        >
          <View style={{ height: 1, backgroundColor: theme.colors.gold }} />

          <View style={{ padding: 24, paddingBottom: insets.bottom + 20 }}>
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              style={{ position: 'absolute', right: 12, top: 16, padding: 8 }}
            >
              <Text style={{ color: theme.colors.text3, fontSize: 20 }}>×</Text>
            </Pressable>

            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  borderWidth: 2,
                  borderColor: theme.colors.gold,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <KazerMark size={28} />
              </View>

              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 23,
                  fontWeight: '500',
                  letterSpacing: -0.3,
                  marginTop: 16,
                  textAlign: 'center',
                }}
              >
                Desbloqueie o KAZER MAX
              </Text>
              <Text
                style={{
                  color: theme.colors.text2,
                  fontSize: 15,
                  lineHeight: 22,
                  marginTop: 6,
                  textAlign: 'center',
                }}
              >
                Execução de tarefas, agentes e criação de artefatos.
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 18 }}>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 34,
                    fontWeight: '500',
                    letterSpacing: -0.6,
                  }}
                >
                  R$ 59,99
                </Text>
                <Text style={{ color: theme.colors.text3, fontSize: 14 }}>/mês</Text>
              </View>
            </View>

            <View style={{ marginTop: 24, gap: 11 }}>
              {BENEFITS.map((benefit) => (
                <View key={benefit} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                  <Text style={{ color: theme.colors.gold, fontSize: 14, marginTop: 1 }}>✓</Text>
                  <Text style={{ color: theme.colors.text2, fontSize: 14, lineHeight: 20, flex: 1 }}>
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>

            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Ativar KAZER MAX"
              style={{
                height: 50,
                borderRadius: 10,
                backgroundColor: theme.colors.gold,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 26,
              }}
            >
              <Text style={{ color: theme.colors.textInverse, fontSize: 16, fontWeight: '600' }}>
                Ativar KAZER MAX
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Continuar no plano atual"
              style={{ marginTop: 12, alignItems: 'center', paddingVertical: 8 }}
            >
              <Text style={{ color: theme.colors.text3, fontSize: 13 }}>
                Continuar no plano atual
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
