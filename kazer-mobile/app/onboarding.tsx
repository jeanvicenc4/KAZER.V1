import * as React from 'react';
import { View, Text, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../src/theme';
import { KazerLockup } from '../components/KazerMark';

const PAGES = [
  {
    title: 'Missões, não mensagens',
    body: 'Você descreve o resultado que quer. O KAZER planeja, executa as ferramentas e entrega pronto.',
    accent: 'gold' as const,
  },
  {
    title: 'Fontes verificáveis',
    body: 'Cada afirmação relevante carrega a citação que a sustenta. Dois cliques e você confere na origem.',
    accent: 'cyan' as const,
  },
  {
    title: 'Artefatos prontos',
    body: 'Relatórios, planilhas, código, landing pages. Versionados e vinculados à conversa de origem.',
    accent: 'violet' as const,
  },
];

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [index, setIndex] = React.useState(0);

  const page = PAGES[index];
  const accent = theme.colors[page.accent];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.base }}>
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <KazerLockup size={22} />
        <Pressable
          onPress={() => router.replace('/')}
          accessibilityRole="button"
          accessibilityLabel="Pular onboarding"
          style={{ padding: 8 }}
        >
          <Text style={{ color: theme.colors.text3, fontSize: 13 }}>Pular</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 28,
          justifyContent: 'center',
        }}
      >
        <Animated.View key={index} entering={FadeIn.duration(320)}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: accent,
              backgroundColor: `${accent}1A`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 28,
            }}
          >
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                borderWidth: 2,
                borderColor: accent,
              }}
            />
          </View>

          <Text
            style={{
              color: theme.colors.text,
              fontSize: 28,
              fontWeight: '500',
              lineHeight: 36,
              letterSpacing: -0.4,
            }}
          >
            {page.title}
          </Text>
          <Text
            style={{
              color: theme.colors.text2,
              fontSize: 16,
              lineHeight: 25,
              marginTop: 12,
            }}
          >
            {page.body}
          </Text>
        </Animated.View>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 28,
          paddingBottom: Math.max(insets.bottom, 24),
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <View style={{ flexDirection: 'row', gap: 6, flex: 1 }}>
          {PAGES.map((p, i) => (
            <Pressable
              key={p.title}
              onPress={() => setIndex(i)}
              accessibilityRole="button"
              accessibilityLabel={`Ir para o passo ${i + 1}`}
              style={{
                height: 6,
                width: i === index ? 24 : 6,
                borderRadius: 3,
                backgroundColor:
                  i === index ? theme.colors.gold : theme.colors.lineActive,
              }}
            />
          ))}
        </View>

        <Pressable
          onPress={() =>
            index === PAGES.length - 1 ? router.replace('/') : setIndex(index + 1)
          }
          accessibilityRole="button"
          accessibilityLabel={index === PAGES.length - 1 ? 'Começar' : 'Continuar'}
          style={{
            height: 44,
            paddingHorizontal: 24,
            borderRadius: 10,
            backgroundColor: theme.colors.gold,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: theme.colors.textInverse, fontSize: 15, fontWeight: '600' }}>
            {index === PAGES.length - 1 ? 'Começar' : 'Continuar'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
