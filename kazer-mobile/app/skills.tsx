import * as React from 'react';
import { View, Text, Pressable, ScrollView, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { KazerLockup } from '../components/KazerMark';
import { useTheme } from '../src/theme';
import { demoSkills } from '@kazer/core';

const ICONS: Record<string, string> = {
  compass: '◈',
  file: '▤',
  code: '⟨⟩',
  trending: '↗',
  shield: '⬡',
};

const PERMISSION_LABELS: Record<string, string> = {
  'web.read': 'Ler a web',
  'files.write': 'Escrever arquivos',
  'shell.exec': 'Executar comandos',
  'code.run': 'Rodar código',
  'net.fetch': 'Buscar na rede',
};

export default function SkillsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [active, setActive] = React.useState<Record<string, boolean>>(
    Object.fromEntries(demoSkills.map((s) => [s.id, s.active])),
  );

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
          Skills
        </Text>
        <Text
          style={{
            color: theme.colors.text2,
            fontSize: 14,
            lineHeight: 21,
            marginTop: 6,
          }}
        >
          Cada Skill é um agente com propósito e permissões próprias. Você vê
          o que ela acessa antes de ativar.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 12 }}>
        {demoSkills.map((skill) => {
          const accent =
            skill.accent === 'violet'
              ? theme.colors.violet
              : skill.accent === 'cyan'
                ? theme.colors.cyan
                : theme.colors.gold;

          return (
            <View
              key={skill.id}
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.line,
                backgroundColor: theme.colors.surface,
                padding: 16,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: theme.colors.line,
                    backgroundColor: theme.colors.inset,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: accent, fontSize: 16 }}>{ICONS[skill.icon]}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '500' }}>
                    {skill.name}
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.text3,
                      fontSize: 11,
                      marginTop: 2,
                      fontFamily: 'Geist Mono',
                    }}
                  >
                    v{skill.version} · {skill.runs} execuções
                  </Text>
                </View>

                <Switch
                  value={active[skill.id]}
                  onValueChange={(value) =>
                    setActive((prev) => ({ ...prev, [skill.id]: value }))
                  }
                  trackColor={{ false: theme.colors.overlay, true: theme.colors.gold }}
                  thumbColor={theme.colors.base}
                  accessibilityLabel={`${active[skill.id] ? 'Desativar' : 'Ativar'} ${skill.name}`}
                />
              </View>

              <Text
                style={{
                  color: theme.colors.text2,
                  fontSize: 13,
                  lineHeight: 19,
                  marginTop: 12,
                }}
              >
                {skill.description}
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                {skill.permissions.map((permission) => (
                  <View
                    key={permission}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 5,
                      borderWidth: 1,
                      borderColor: theme.colors.line,
                      backgroundColor: theme.colors.inset,
                    }}
                  >
                    <Text style={{ color: theme.colors.text3, fontSize: 11 }}>
                      {PERMISSION_LABELS[permission] ?? permission}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        <Text
          style={{
            color: theme.colors.text3,
            fontSize: 11,
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          Dados de demonstração
        </Text>
      </ScrollView>
    </View>
  );
}
