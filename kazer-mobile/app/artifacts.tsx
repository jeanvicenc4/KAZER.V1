import * as React from 'react';
import { View, Text, Pressable, ScrollView, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KazerLockup } from '../components/KazerMark';
import { useTheme } from '../src/theme';
import { demoArtifacts, type Artifact } from '@kazer/core';

const TYPE_LABELS: Record<string, string> = {
  document: 'Documento',
  pdf: 'PDF',
  docx: 'DOCX',
  spreadsheet: 'Planilha',
  csv: 'CSV',
  xlsx: 'XLSX',
  code: 'Código',
  landing: 'Landing',
  report: 'Relatório',
  image: 'Imagem',
};

export default function ArtifactsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [preview, setPreview] = React.useState<Artifact | null>(null);
  const [filter, setFilter] = React.useState('all');

  const filters = ['all', 'document', 'spreadsheet', 'code', 'landing', 'image'];
  const filtered =
    filter === 'all' ? demoArtifacts : demoArtifacts.filter((a) => a.type === filter);

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
          Artefatos
        </Text>
        <Text style={{ color: theme.colors.text2, fontSize: 14, marginTop: 6 }}>
          Tudo que o KAZER entregou, versionado.
        </Text>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 8,
        }}
      >
        {filters.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === f }}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 999,
              borderWidth: 1,
              borderColor:
                filter === f ? theme.colors.gold : theme.colors.line,
              backgroundColor:
                filter === f ? theme.colors.goldWash : 'transparent',
            }}
          >
            <Text
              style={{
                color: filter === f ? theme.colors.goldText : theme.colors.text2,
                fontSize: 13,
              }}
            >
              {f === 'all' ? 'Todos' : TYPE_LABELS[f] ?? f}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 24,
          gap: 10,
        }}
      >
        {filtered.map((artifact) => (
          <Pressable
            key={artifact.id}
            onPress={() => setPreview(artifact)}
            accessibilityRole="button"
            accessibilityLabel={artifact.name}
            style={{
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.colors.line,
              backgroundColor: theme.colors.surface,
              padding: 14,
              flexDirection: 'row',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: theme.colors.line,
                backgroundColor: theme.colors.inset,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: theme.colors.gold, fontSize: 15 }}>▪</Text>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text
                  numberOfLines={1}
                  style={{ flex: 1, color: theme.colors.text, fontSize: 14, fontWeight: '500' }}
                >
                  {artifact.name}
                </Text>
                <Text
                  style={{
                    color: theme.colors.text3,
                    fontSize: 10,
                    fontFamily: 'Geist Mono',
                  }}
                >
                  v{artifact.version}
                </Text>
              </View>
              <Text style={{ color: theme.colors.text3, fontSize: 12, marginTop: 3 }}>
                {TYPE_LABELS[artifact.type] ?? artifact.type}
                {artifact.locked ? ' · bloqueado no plano atual' : ''}
              </Text>
              <Text
                numberOfLines={2}
                style={{
                  color: theme.colors.text2,
                  fontSize: 13,
                  lineHeight: 18,
                  marginTop: 5,
                }}
              >
                {artifact.preview}
              </Text>
            </View>
          </Pressable>
        ))}

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

      {/* Preview modal */}
      {preview ? (
        <View
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            justifyContent: 'flex-end',
          }}
        >
          <Pressable
            style={{ flex: 1 }}
            onPress={() => setPreview(null)}
            accessibilityLabel="Fechar pré-visualização"
          />
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 10,
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + 20,
            }}
          >
            <View style={{ alignItems: 'center', paddingBottom: 14 }}>
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: theme.colors.lineActive,
                }}
              />
            </View>

            <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '500' }}>
              {preview.name}
            </Text>
            <Text style={{ color: theme.colors.text3, fontSize: 12, marginTop: 4 }}>
              {TYPE_LABELS[preview.type] ?? preview.type} · v{preview.version}
            </Text>

            <View
              style={{
                marginTop: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.line,
                backgroundColor: theme.colors.inset,
                padding: 16,
              }}
            >
              <Text style={{ color: theme.colors.text2, fontSize: 14, lineHeight: 22 }}>
                {preview.preview}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
              <Pressable
                onPress={() =>
                  void Share.share({
                    message: `${preview.name}\n\n${preview.preview}`,
                  })
                }
                accessibilityRole="button"
                accessibilityLabel="Compartilhar artefato"
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 10,
                  backgroundColor: theme.colors.gold,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: theme.colors.textInverse, fontSize: 15, fontWeight: '600' }}>
                  Compartilhar
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setPreview(null)}
                accessibilityRole="button"
                accessibilityLabel="Fechar"
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: theme.colors.lineStrong,
                  backgroundColor: theme.colors.elevated,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: theme.colors.text2, fontSize: 15 }}>Fechar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}
