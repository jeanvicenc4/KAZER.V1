import * as React from 'react';
import { View, Text, Pressable, ScrollView, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { KazerLockup } from '../components/KazerMark';
import { useTheme, type ThemePreference } from '../src/theme';
import { demoProfile, models } from '@kazer/core';

export default function SettingsScreen() {
  const { theme, preference, setPreference } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [notifications, setNotifications] = React.useState(true);
  const [model, setModel] = React.useState(demoProfile.defaultModel);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.base }}>
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.line,
        }}
      >
        <KazerLockup size={22} />
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 24,
            fontWeight: '500',
            letterSpacing: -0.3,
            marginTop: 16,
          }}
        >
          Perfil
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
        {/* Profile card */}
        <View
          style={{
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.colors.line,
            backgroundColor: theme.colors.surface,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: theme.colors.goldWash,
              borderWidth: 1,
              borderColor: theme.colors.gold,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: theme.colors.goldText, fontSize: 16, fontWeight: '600' }}>
              AC
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '500' }}>
              {demoProfile.fullName}
            </Text>
            <Text style={{ color: theme.colors.text3, fontSize: 13, marginTop: 2 }}>
              {demoProfile.email}
            </Text>
          </View>
        </View>

        {/* Plan */}
        <Section title="Assinatura">
          <View
            style={{
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.colors.gold,
              backgroundColor: theme.colors.goldWash,
              padding: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '500' }}>
                KAZER Pro
              </Text>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 999,
                  backgroundColor: theme.colors.goldWash,
                }}
              >
                <Text style={{ color: theme.colors.goldText, fontSize: 10, fontWeight: '600' }}>
                  PRO
                </Text>
              </View>
            </View>
            <Text style={{ color: theme.colors.text2, fontSize: 13, marginTop: 6 }}>
              R$ 29,90/mês · renova em 17 de novembro
            </Text>
            <Pressable
              onPress={() => router.push('/modal/paywall')}
              accessibilityRole="button"
              accessibilityLabel="Ver planos"
              style={{
                height: 44,
                borderRadius: 10,
                backgroundColor: theme.colors.gold,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 14,
              }}
            >
              <Text style={{ color: theme.colors.textInverse, fontSize: 15, fontWeight: '600' }}>
                Conhecer o KAZER MAX
              </Text>
            </Pressable>
          </View>
        </Section>

        {/* Theme */}
        <Section title="Tema">
          {(
            [
              ['dark', 'Escuro'],
              ['light', 'Claro'],
              ['system', 'Sistema'],
            ] as const
          ).map(([value, label]) => (
            <Row key={value} label={label} last={value === 'system'}>
              <Pressable
                onPress={() => setPreference(value as ThemePreference)}
                accessibilityRole="radio"
                accessibilityState={{ selected: preference === value }}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  borderWidth: 1,
                  borderColor:
                    preference === value ? theme.colors.gold : theme.colors.lineActive,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {preference === value ? (
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: theme.colors.gold,
                    }}
                  />
                ) : null}
              </Pressable>
            </Row>
          ))}
        </Section>

        {/* Model */}
        <Section title="Modelo padrão">
          {models.slice(0, 3).map((m, index) => (
            <Row key={m.id} label={m.name} last={index === 2}>
              <Pressable
                onPress={() => setModel(m.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: model === m.id }}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  borderWidth: 1,
                  borderColor:
                    model === m.id ? theme.colors.gold : theme.colors.lineActive,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {model === m.id ? (
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: theme.colors.gold,
                    }}
                  />
                ) : null}
              </Pressable>
            </Row>
          ))}
        </Section>

        {/* Notifications */}
        <Section title="Notificações">
          <Row label="Push ao concluir missões" last>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: theme.colors.overlay, true: theme.colors.gold }}
              thumbColor={theme.colors.base}
              accessibilityLabel="Push ao concluir missões"
            />
          </Row>
        </Section>

        <Pressable
          onPress={() => router.replace('/login')}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
          style={{
            height: 46,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.colors.red,
            backgroundColor: theme.colors.redWash,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 24,
          }}
        >
          <Text style={{ color: theme.colors.red, fontSize: 15, fontWeight: '500' }}>
            Sair da conta
          </Text>
        </Pressable>

        <Text
          style={{
            color: theme.colors.text3,
            fontSize: 11,
            textAlign: 'center',
            marginTop: 20,
          }}
        >
          KAZER · dados de demonstração
        </Text>
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <View style={{ marginTop: 28 }}>
      <Text
        style={{
          color: theme.colors.text3,
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 1,
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.colors.line,
          backgroundColor: theme.colors.surface,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Row({
  label,
  children,
  last = false,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.colors.line,
        minHeight: 52,
      }}
    >
      <Text style={{ color: theme.colors.text, fontSize: 15 }}>{label}</Text>
      {children}
    </View>
  );
}
