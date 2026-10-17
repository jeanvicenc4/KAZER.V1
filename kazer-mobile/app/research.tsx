import * as React from 'react';
import { View, Text, Pressable, ScrollView, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { KazerLockup } from '../components/KazerMark';
import { useTheme } from '../src/theme';

const RESEARCH = {
  question:
    'Compare o preço real por milhão de tokens dos principais provedores de IA disponíveis no Brasil em 2026.',
  answer:
    'Os provedores que entregam o melhor custo-benefício para uso em produção no Brasil mudam de posição dependendo do volume: em uso ocasional, um modelo de entrada rápida custa menos; acima de 50 milhões de tokens por mês, o desconto regional e o cache de prefixo mudam completamente a conta.',
  reads: 12,
  cited: 5,
  queries: 4,
};

const SOURCES = [
  {
    index: 1,
    domain: 'techreport.com.br',
    title: 'Preço dos modelos de IA no Brasil em 2026 — comparativo',
    snippet:
      'O levantamento comparou 9 provedores e 14 modelos considerando preço por milhão de tokens de entrada e saída.',
  },
  {
    index: 2,
    domain: 'finops.dev',
    title: 'FinOps para equipes de produto que adotam LLMs',
    snippet:
      'Empresas que passaram a limitar o gasto por time reduziram o custo mensal com modelos em 47%.',
  },
  {
    index: 3,
    domain: 'planalto-tech.com.br',
    title: 'OpenAI anuncia preços adjusted para o mercado brasileiro',
    snippet:
      'A partir de outubro, a empresa passa a Billing em reais com desconto de 6% no consumo via API.',
  },
  {
    index: 4,
    domain: 'englatam.dev',
    title: 'Custo real de um agente de IA em produção',
    snippet:
      'Replanejamento, chamadas de ferramenta e re-tentativas respondem por até 3,1 vezes o custo da geração final.',
  },
  {
    index: 5,
    domain: 'docs.kazer.dev',
    title: 'Guia de caching para reduzir tokens de entrada',
    snippet:
      'O cache de prefixo reduz em média 68% dos tokens de entrada em conversas longas.',
  },
];

export default function ResearchScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tab, setTab] = React.useState<'resumo' | 'fontes'>('resumo');

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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            style={{ width: 32, height: 32, justifyContent: 'center' }}
          >
            <Text style={{ color: theme.colors.text2, fontSize: 20 }}>‹</Text>
          </Pressable>
          <KazerLockup size={20} />
        </View>

        <Text
          style={{
            color: theme.colors.text,
            fontSize: 19,
            fontWeight: '500',
            letterSpacing: -0.2,
            marginTop: 14,
            lineHeight: 26,
          }}
        >
          {RESEARCH.question}
        </Text>
      </View>

      {/* Tabs */}
      <View
        style={{
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.line,
        }}
      >
        {(
          [
            ['resumo', 'Resumo'],
            ['fontes', `Fontes (${SOURCES.length})`],
          ] as const
        ).map(([id, label]) => (
          <Pressable
            key={id}
            onPress={() => setTab(id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === id }}
            style={{
              flex: 1,
              height: 46,
              alignItems: 'center',
              justifyContent: 'center',
              borderBottomWidth: tab === id ? 2 : 0,
              borderBottomColor: theme.colors.gold,
            }}
          >
            <Text
              style={{
                color: tab === id ? theme.colors.text : theme.colors.text3,
                fontSize: 14,
                fontWeight: tab === id ? '500' : '400',
              }}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
        {tab === 'resumo' ? (
          <>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.line,
                backgroundColor: theme.colors.surface,
                marginBottom: 20,
              }}
            >
              <Text style={{ color: theme.colors.text2, fontSize: 13 }}>
                <Text style={{ color: theme.colors.text, fontFamily: 'Geist Mono' }}>
                  {RESEARCH.reads}
                </Text>{' '}
                resultados lidos
              </Text>
              <View style={{ width: 1, height: 14, backgroundColor: theme.colors.line }} />
              <Text style={{ color: theme.colors.text2, fontSize: 13 }}>
                <Text style={{ color: theme.colors.goldText, fontFamily: 'Geist Mono' }}>
                  {RESEARCH.cited}
                </Text>{' '}
                citados
              </Text>
            </View>

            <Text
              style={{
                color: theme.colors.text,
                fontSize: 15,
                lineHeight: 24,
              }}
            >
              {RESEARCH.answer}
            </Text>

            <View style={{ flexDirection: 'row', gap: 6, marginTop: 14 }}>
              {[1, 2, 3, 4, 5].map((index) => (
                <View
                  key={index}
                  style={{
                    paddingHorizontal: 7,
                    paddingVertical: 3,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: theme.colors.gold,
                    backgroundColor: theme.colors.goldWash,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.goldText,
                      fontSize: 11,
                      fontFamily: 'Geist Mono',
                    }}
                  >
                    {index}
                  </Text>
                </View>
              ))}
            </View>

            <Text
              style={{
                color: theme.colors.text3,
                fontSize: 12,
                marginTop: 28,
                fontWeight: '600',
                letterSpacing: 0.6,
                textTransform: 'uppercase',
              }}
            >
              {RESEARCH.queries} consultas em paralelo
            </Text>
            {['preço llm brasil 2026', 'custo token produção', 'openai anthropic pricing brazil'].map(
              (query) => (
                <Text
                  key={query}
                  style={{
                    color: theme.colors.text3,
                    fontSize: 12,
                    fontFamily: 'Geist Mono',
                    marginTop: 6,
                  }}
                >
                  · {query}
                </Text>
              ),
            )}
          </>
        ) : (
          <View style={{ gap: 12 }}>
            {SOURCES.map((source) => (
              <Pressable
                key={source.index}
                onPress={() => void Linking.openURL('https://kazer.app')}
                accessibilityRole="link"
                accessibilityLabel={`${source.title} — ${source.domain}`}
                style={{
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.colors.line,
                  backgroundColor: theme.colors.surface,
                  padding: 14,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: theme.colors.gold,
                      backgroundColor: theme.colors.goldWash,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: theme.colors.goldText, fontSize: 10 }}>
                      {source.index}
                    </Text>
                  </View>
                  <Text style={{ color: theme.colors.text3, fontSize: 12 }}>
                    {source.domain}
                  </Text>
                </View>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 14,
                    fontWeight: '500',
                    marginTop: 8,
                    lineHeight: 19,
                  }}
                >
                  {source.title}
                </Text>
                <Text
                  style={{
                    color: theme.colors.text2,
                    fontSize: 13,
                    lineHeight: 18,
                    marginTop: 4,
                  }}
                >
                  {source.snippet}
                </Text>
              </Pressable>
            ))}
            <Text
              style={{
                color: theme.colors.text3,
                fontSize: 11,
                textAlign: 'center',
                marginTop: 6,
              }}
            >
              Dados de demonstração
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
