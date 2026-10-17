/**
 * ArtifactSheet — preview modal for an artifact: metadata, versions, download
 * and native share. Download is a stub on device (see `src/services/native.ts`).
 */

import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { Artifact, ArtifactVersion } from '@kazer/core';

import { useTheme } from '../hooks/useTheme';
import { useArtifacts } from '../hooks/useArtifacts';
import { Sheet } from './Sheet';
import { Button, IconButton, RowButton } from './Button';
import { ArtifactHeader } from './ArtifactCard';
import { DemoNote } from './Chip';
import {
  artifactShareMessage,
  downloadArtifactFile,
  shareContent,
  successFeedback,
} from '../src/services/native';

export function ArtifactSheet({
  artifact,
  visible,
  onClose,
}: {
  artifact: Artifact | null;
  visible: boolean;
  onClose: () => void;
}): React.JSX.Element {
  const { colors } = useTheme();
  const { versions } = useArtifacts();
  const [history, setHistory] = useState<ArtifactVersion[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !artifact) {
      setHistory([]);
      setStatus(null);
      return;
    }
    let active = true;
    void versions(artifact.id).then((list) => {
      if (active) setHistory(list);
    });
    return () => {
      active = false;
    };
  }, [artifact, versions, visible]);

  if (!artifact) return <></>;

  const handleDownload = (): void => {
    setStatus('Preparando arquivo…');
    void downloadArtifactFile({
      filename: artifact.name,
      body: `# ${artifact.name}\n\n${artifact.preview}\n\n(Dados de demonstração do KAZER.)`,
      mimeType: artifact.mimeType,
    }).then((result) => {
      successFeedback();
      setStatus(
        result.ok
          ? `${result.filename} pronto para download.`
          : 'Não foi possível gerar o arquivo.',
      );
    });
  };

  const handleShare = (): void => {
    void shareContent(
      artifact.name,
      artifactShareMessage({
        name: artifact.name,
        sizeBytes: artifact.sizeBytes,
        version: artifact.version,
      }),
    );
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Artefato"
      initialDetent={0.6}
      maxDetent={0.92}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <ArtifactHeader artifact={artifact} />

        <Text className="type-bodySm mt-4" style={{ color: colors.text2 }}>
          {artifact.preview}
        </Text>

        <View
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.line,
            backgroundColor: colors.inset,
          }}
        >
          <Text className="eyebrow mb-2" style={{ color: colors.text3 }}>
            Prévia
          </Text>
          <Text
            className="type-codeSm"
            style={{ color: colors.text2, fontFamily: 'monospace', lineHeight: 18 }}
          >
            {`${artifact.name}\n${'─'.repeat(28)}\n${artifact.preview}\n\n${artifact.conversationId ?? 'conversa removida'} · skill ${
              artifact.skillId ?? '—'
            }`}
          </Text>
        </View>

        {history.length > 0 ? (
          <View className="mt-4">
            <Text className="eyebrow mb-2" style={{ color: colors.text3 }}>
              Versões
            </Text>
            {history.map((version) => (
              <View
                key={version.id}
                className="flex-row items-center gap-3 py-2"
                style={{ borderBottomWidth: 1, borderBottomColor: colors.line }}
              >
                <Text
                  className="type-micro"
                  style={{ color: colors.goldText, fontFamily: 'monospace', width: 32 }}
                >
                  v{version.version}
                </Text>
                <Text className="type-caption flex-1" style={{ color: colors.text2 }}>
                  {version.note}
                </Text>
                <Feather name="check" size={13} color={colors.text3} />
              </View>
            ))}
          </View>
        ) : null}

        {status ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginTop: 16,
              padding: 12,
              borderRadius: 10,
              backgroundColor: colors.cyanWash,
            }}
          >
            <Feather name="info" size={14} color={colors.cyan} />
            <Text className="type-caption flex-1" style={{ color: colors.cyan }}>
              {status}
            </Text>
          </View>
        ) : null}

        <View className="gap-2 mt-4">
          <Button
            label="Baixar"
            icon="download"
            onPress={handleDownload}
            fullWidth
            size="lg"
          />
          <Button
            label="Compartilhar"
            icon="share-2"
            onPress={handleShare}
            variant="secondary"
            fullWidth
          />
        </View>

        <DemoNote className="mt-4" />

        <View className="mt-2">
          <RowButton
            icon="copy"
            label="Copiar caminho"
            description={artifact.name}
            onPress={handleShare}
          />
        </View>
      </ScrollView>
    </Sheet>
  );
}