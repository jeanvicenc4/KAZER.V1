import * as React from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { KazerLockup } from '../components/KazerMark';
import { useTheme } from '../src/theme';
import { demoConversations, models } from '@kazer/core';

const MISSIONS = [
  { label: 'Pesquisar', hint: 'Com fontes verificáveis' },
  { label: 'Criar documento', hint: 'Relatório, proposta, PDF' },
  { label: 'Revisar código', hint: 'Refatoração com testes' },
  { label: 'Planejar lançamento', hint: 'Estratégia e métricas' },
];

export default function HomeScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = React.useState('');

  const recent = demoConversations.filter((c) => !c.archived).slice(0, 3);

  const submit = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push({
      pathname: '/chat/[id]',
      params: { id: 'new', q: trimmed },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.base }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 28 }}>
          <KazerLockup size={30} />
          <Text
            style={{
              color: theme.colors.text2,
              fontSize: 14,
              marginTop: 10,
              textAlign: 'center',
            }}
          >
            Pergunte. O KAZER executa.
          </Text>
        </View>

        {/* Search bar */}
        <View
          style={{
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.colors.lineStrong,
            backgroundColor: theme.colors.surface,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
          }}
        >
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={submit}
            returnKeyType="send"
            placeholder="O que o KAZER deve fazer por você?"
            placeholderTextColor={theme.colors.text3}
            accessibilityLabel="Buscar ou perguntar ao KAZER"
            style={{
              flex: 1,
              height: 52,
              color: theme.colors.text,
              fontSize: 15,
            }}
          />
          <Pressable
            onPress={submit}
            disabled={!query.trim()}
            accessibilityRole="button"
            accessibilityLabel="Enviar"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: query.trim() ? theme.colors.gold : theme.colors.overlay,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: query.trim() ? theme.colors.textInverse : theme.colors.text3,
                fontSize: 16,
                fontWeight: '700',
              }}
            >
              ↑
            </Text>
          </Pressable>
        </View>

        {/* Mission chips */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          {MISSIONS.map((mission) => (
            <Pressable
              key={mission.label}
              onPress={() =>
                router.push({
                  pathname: '/chat/[id]',
                  params: { id: 'new', q: mission.hint },
                })
              }
              accessibilityRole="button"
              accessibilityLabel={mission.label}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: theme.colors.line,
                backgroundColor: theme.colors.surface,
              }}
            >
              <Text style={{ color: theme.colors.text2, fontSize: 13 }}>
                {mission.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Recent */}
        <Text
          style={{
            color: theme.colors.text3,
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 1,
            marginTop: 28,
            marginBottom: 10,
            textTransform: 'uppercase',
          }}
        >
          Conversas recentes
        </Text>

        {recent.map((conversation) => (
          <Pressable
            key={conversation.id}
            onPress={() =>
              router.push({ pathname: '/chat/[id]', params: { id: conversation.id } })
            }
            accessibilityRole="button"
            accessibilityLabel={conversation.title}
            style={{
              paddingVertical: 12,
              borderTopWidth: 1,
              borderTopColor: theme.colors.line,
            }}
          >
            <Text
              numberOfLines={1}
              style={{ color: theme.colors.text, fontSize: 15, fontWeight: '500' }}
            >
              {conversation.title}
            </Text>
            <Text
              numberOfLines={1}
              style={{ color: theme.colors.text3, fontSize: 12, marginTop: 3 }}
            >
              {conversation.preview}
            </Text>
          </Pressable>
        ))}

        <Text
          style={{
            color: theme.colors.text3,
            fontSize: 11,
            textAlign: 'center',
            marginTop: 28,
          }}
        >
          Dados de demonstração · {models.length} modelos disponíveis
        </Text>
      </ScrollView>
    </View>
  );
}
