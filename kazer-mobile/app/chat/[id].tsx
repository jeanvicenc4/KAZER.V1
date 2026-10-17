import * as React from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Composer } from '../../components/Composer';
import { Markdown } from '../../components/Markdown';
import { MissionTrace } from '../../components/MissionTrace';
import { ThinkingIndicator } from '../../components/ThinkingIndicator';
import { useTheme } from '../../src/theme';
import {
  createMockChatAdapter,
  demoMessages,
  models,
  type Message,
  type Mode,
  type ModelId,
  type Source,
} from '@kazer/core';

const SOURCES: Source[] = [
  {
    id: 'src_01',
    conversationId: 'conv_pricing',
    index: 1,
    title: 'Preço dos modelos de IA no Brasil em 2026 — comparativo',
    domain: 'techreport.com.br',
    url: 'https://techreport.com.br/ia/precos-modelos-2026',
    favicon: '',
    snippet:
      'O levantamento comparou 9 provedores e 14 modelos considerando preço por milhão de tokens.',
    publishedAt: '2026-08-21',
    saved: false,
    cited: true,
    readCount: 3,
    relevance: 0.94,
  },
  {
    id: 'src_02',
    conversationId: 'conv_pricing',
    index: 2,
    title: 'FinOps para equipes de produto que adotam LLMs',
    domain: 'finops.dev',
    url: 'https://finops.dev/blog/llm-cost-control',
    favicon: '',
    snippet: 'Equipes que limitaram o gasto por time reduziram o custo mensal em 47%.',
    publishedAt: '2026-05-14',
    saved: false,
    cited: true,
    readCount: 2,
    relevance: 0.88,
  },
];

/**
 * Pre-render the demo conversations so the static web export and the native
 * builds know which routes exist ahead of time.
 */
export function generateStaticParams(): { id: string }[] {
  return Object.keys(demoMessages).map((id) => ({ id }));
}

export default function ChatScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; q?: string }>();

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [mode, setMode] = React.useState<Mode>('chat');
  const [model, setModel] = React.useState('kazer-4');
  const [streaming, setStreaming] = React.useState(false);
  const [showSources, setShowSources] = React.useState(false);
  const [activeCitation, setActiveCitation] = React.useState<number | null>(null);
  const adapter = React.useMemo(() => createMockChatAdapter(), []);

  // Hydrate a stored conversation, or seed from ?q=
  React.useEffect(() => {
    if (params.q) {
      setMessages([]);
      return;
    }
    const stored = demoMessages[params.id ?? ''];
    if (stored) setMessages(stored);
  }, [params.id, params.q]);

  const send = React.useCallback(
    async (content: string) => {
      setStreaming(true);

      const assistantId = `a_${Date.now()}`;
      const userMessage: Message = {
        id: `u_${assistantId}`,
        conversationId: params.id ?? 'new',
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
        mode,
        model: null,
      };
      const assistantMessage: Message = {
        id: assistantId,
        conversationId: params.id ?? 'new',
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        mode,
        model: model as ModelId,
        streaming: true,
        toolRuns: [],
      };
      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      let text = '';

      for await (const chunk of adapter.send({
        conversationId: params.id ?? null,
        content,
        mode,
        model: model as never,
      })) {
        if (chunk.type === 'token') {
          text += chunk.text ?? '';
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: text } : m)),
          );
        } else if (chunk.type === 'tool' && chunk.toolRun) {
          const run = chunk.toolRun;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, toolRuns: [...(m.toolRuns ?? []), run] }
                : m,
            ),
          );
        } else if (chunk.type === 'done') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, streaming: false, followUps: chunk.followUps }
                : m,
            ),
          );
          setStreaming(false);
          return;
        }
      }
      setStreaming(false);
    },
    [adapter, mode, model, params.id],
  );

  // Auto-send the seeded question
  const seeded = React.useRef(false);
  React.useEffect(() => {
    if (seeded.current || !params.q) return;
    seeded.current = true;
    void send(params.q);
  }, [params.q, send]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.base }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 10,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.line,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: theme.colors.text2, fontSize: 20 }}>‹</Text>
        </Pressable>

        <Text
          numberOfLines={1}
          style={{ flex: 1, color: theme.colors.text, fontSize: 15, fontWeight: '500' }}
        >
          {params.id === 'new' ? 'Nova missão' : 'Conversa'}
        </Text>

        <Pressable
          onPress={() => setShowSources(true)}
          hitSlop={7}
          accessibilityRole="button"
          accessibilityLabel="Ver fontes"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 10,
            height: 30,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.line,
            backgroundColor: theme.colors.surface,
          }}
        >
          <Text style={{ color: theme.colors.text2, fontSize: 12 }}>Fontes</Text>
          <Text style={{ color: theme.colors.text3, fontSize: 11 }}>2</Text>
        </Pressable>
      </View>

      {/* Thread */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((message) =>
          message.role === 'user' ? (
            <Animated.View
              key={message.id}
              entering={FadeIn.duration(320)}
              style={{
                alignSelf: 'flex-end',
                maxWidth: '88%',
                borderRadius: 14,
                borderBottomRightRadius: 4,
                borderWidth: 1,
                borderColor: theme.colors.line,
                backgroundColor: theme.colors.surface,
                paddingHorizontal: 14,
                paddingVertical: 12,
                marginBottom: 20,
              }}
            >
              <Text style={{ color: theme.colors.text, fontSize: 15, lineHeight: 23 }}>
                {message.content}
              </Text>
            </Animated.View>
          ) : (
            <Animated.View
              key={message.id}
              entering={FadeInDown.duration(360)}
              style={{ marginBottom: 24, paddingLeft: 18 }}
            >
              {/* Mission Trace rail — nodes only; the rows below carry the labels */}
              {message.toolRuns?.length ? (
                <View style={{ position: 'absolute', left: 0, top: 4 }}>
                  <MissionTrace steps={stepsFrom(message)} railOnly />
                </View>
              ) : null}

              {message.toolRuns?.length ? (
                <View style={{ marginBottom: 12, gap: 6 }}>
                  {message.toolRuns.map((run) => (
                    <View key={run.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ color: theme.colors.green, fontSize: 12 }}>✓</Text>
                      <Text style={{ color: theme.colors.text2, fontSize: 13 }}>
                        {run.label}
                      </Text>
                      {run.durationMs ? (
                        <Text
                          style={{
                            color: theme.colors.text3,
                            fontSize: 11,
                            fontFamily: 'Geist Mono',
                          }}
                        >
                          {run.durationMs < 1000
                            ? `${run.durationMs}ms`
                            : `${(run.durationMs / 1000).toFixed(1)}s`}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              ) : null}

              {message.content ? (
                <Markdown
                  content={message.content}
                  sources={SOURCES}
                  onCitationPress={setActiveCitation}
                />
              ) : null}

              {message.streaming ? (
                <View style={{ marginTop: 10 }}>
                  <ThinkingIndicator />
                </View>
              ) : null}

              {message.followUps?.length && !message.streaming ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                  {message.followUps.map((suggestion) => (
                    <Pressable
                      key={suggestion}
                      hitSlop={4}
                      onPress={() => void send(suggestion)}
                      accessibilityRole="button"
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: theme.colors.line,
                        backgroundColor: theme.colors.surface,
                      }}
                    >
                      <Text style={{ color: theme.colors.text2, fontSize: 13 }}>
                        {suggestion}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </Animated.View>
          ),
        )}
      </ScrollView>

      <Composer
        mode={mode}
        onModeChange={setMode}
        model={model as ModelId}
        onModelChange={(id) => setModel(id)}
        onSend={(value) => void send(value)}
        streaming={streaming}
        onStop={() => setStreaming(false)}
      />

      {/* Sources bottom sheet */}
      {showSources ? (
        <View
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'flex-end',
          }}
        >
          <Pressable
            style={{ flex: 1 }}
            onPress={() => setShowSources(false)}
            accessibilityLabel="Fechar fontes"
          />
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 10,
              paddingBottom: insets.bottom + 16,
              maxHeight: '80%',
            }}
          >
            <View style={{ alignItems: 'center', paddingBottom: 8 }}>
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: theme.colors.lineActive,
                }}
              />
            </View>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 16,
                fontWeight: '500',
                paddingHorizontal: 20,
                marginBottom: 12,
              }}
            >
              Fontes
            </Text>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
              {SOURCES.map((source) => (
                <Pressable
                  key={source.id}
                  onPress={() => void Linking.openURL(source.url)}
                  accessibilityRole="link"
                  accessibilityLabel={`${source.title} — ${source.domain}`}
                  style={{
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: theme.colors.line,
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
                        borderColor: theme.colors.lineStrong,
                        backgroundColor: theme.colors.inset,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: theme.colors.text3, fontSize: 10 }}>
                        {source.domain.charAt(0).toUpperCase()}
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
                  marginTop: 4,
                }}
              >
                Dados de demonstração
              </Text>
            </ScrollView>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function stepsFrom(message: Message) {
  return (message.toolRuns ?? []).map((run) => ({
    id: run.id,
    label: run.label,
    detail: run.detail ?? null,
    status:
      run.status === 'done'
        ? ('done' as const)
        : run.status === 'running'
          ? ('active' as const)
          : ('pending' as const),
    kind:
      run.name.includes('classify')
        ? ('intent' as const)
        : run.name.includes('search') || run.name.includes('generate')
          ? ('search' as const)
          : run.name.includes('synth')
            ? ('synthesis' as const)
            : run.name.includes('artifact') || run.name.includes('create')
              ? ('artifact' as const)
              : ('read' as const),
  }));
}
