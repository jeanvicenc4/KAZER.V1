/**
 * Markdown — renders an assistant answer as content, not a chat bubble.
 * Reading line ≤ 76 characters, citation anchors become CitationChips.
 */

import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { Source } from '@kazer/core';

import { useTheme } from '../hooks/useTheme';
import { CitationChip } from './CitationChip';
import { parseMarkdown, type BlockNode, type InlineNode } from '../src/utils/markdown';

function Inline({
  nodes,
  sources,
  activeCitation,
  onCitationPress,
}: {
  nodes: InlineNode[];
  sources?: Map<string, Source>;
  activeCitation?: number | null;
  onCitationPress?: (index: number) => void;
}): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <>
      {nodes.map((node, index) => {
        switch (node.kind) {
          case 'text':
            return (
              <Text key={index} style={{ color: colors.text }}>
                {node.text}
              </Text>
            );
          case 'strong':
            return (
              <Text
                key={index}
                style={{ color: colors.text, fontWeight: '600' }}
              >
                {node.text}
              </Text>
            );
          case 'em':
            return (
              <Text key={index} style={{ color: colors.text2, fontStyle: 'italic' }}>
                {node.text}
              </Text>
            );
          case 'code':
            return (
              <Text
                key={index}
                style={{
                  color: colors.goldText,
                  fontFamily: 'monospace',
                  backgroundColor: colors.inset,
                }}
              >
                {` ${node.text} `}
              </Text>
            );
          case 'citation': {
            const source = sources?.get(`src_0${node.index}`);
            return (
              <Text key={index}>
                <CitationChip
                  index={node.index}
                  source={source}
                  active={activeCitation === node.index}
                  onPress={onCitationPress}
                />
              </Text>
            );
          }
        }
      })}
    </>
  );
}

function Block({
  block,
  sources,
  activeCitation,
  onCitationPress,
}: {
  block: BlockNode;
  sources?: Map<string, Source>;
  activeCitation?: number | null;
  onCitationPress?: (index: number) => void;
}): React.JSX.Element | null {
  const { colors } = useTheme();

  switch (block.kind) {
    case 'heading': {
      const style =
        block.level === 1
          ? { fontSize: 22, lineHeight: 28, fontWeight: '500' as const, letterSpacing: -0.4 }
          : block.level === 2
            ? { fontSize: 18, lineHeight: 24, fontWeight: '500' as const, letterSpacing: -0.2 }
            : { fontSize: 15, lineHeight: 22, fontWeight: '500' as const, letterSpacing: -0.1 };

      return (
        <Text
          accessibilityRole="header"
          style={[style, { color: colors.text }]}
        >
          <Inline
            nodes={block.content}
            sources={sources}
            activeCitation={activeCitation}
            onCitationPress={onCitationPress}
          />
        </Text>
      );
    }

    case 'paragraph':
      return (
        <Text className="type-bodyLg" style={{ color: colors.text }}>
          <Inline
            nodes={block.content}
            sources={sources}
            activeCitation={activeCitation}
            onCitationPress={onCitationPress}
          />
        </Text>
      );

    case 'quote':
      return (
        <View
          style={{
            borderLeftWidth: 2,
            borderLeftColor: colors.goldBorder,
            paddingLeft: 12,
            paddingVertical: 2,
          }}
        >
          <Text className="type-bodySm" style={{ color: colors.text2 }}>
            <Inline
              nodes={block.content}
              sources={sources}
              activeCitation={activeCitation}
              onCitationPress={onCitationPress}
            />
          </Text>
        </View>
      );

    case 'list':
      return (
        <View className="gap-2">
          {block.items.map((item, index) => (
            <View key={index} className="flex-row gap-3">
              <Text
                className="type-bodyLg"
                style={{ color: colors.goldText, minWidth: 20 }}
              >
                {block.ordered ? `${index + 1}.` : '—'}
              </Text>
              <Text className="type-bodyLg flex-1" style={{ color: colors.text }}>
                <Inline
                  nodes={item}
                  sources={sources}
                  activeCitation={activeCitation}
                  onCitationPress={onCitationPress}
                />
              </Text>
            </View>
          ))}
        </View>
      );

    case 'table':
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.line,
          }}
          contentContainerStyle={{ padding: 1 }}
        >
          <View>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: colors.inset,
                borderBottomWidth: 1,
                borderBottomColor: colors.line,
              }}
            >
              {block.header.map((cell, index) => (
                <Text
                  key={index}
                  className="type-caption"
                  numberOfLines={2}
                  style={{
                    color: colors.text2,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    minWidth: 96,
                    fontWeight: '500',
                  }}
                >
                  <Inline nodes={parseInlineCell(cell)} />
                </Text>
              ))}
            </View>

            {block.rows.map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={{
                  flexDirection: 'row',
                  borderBottomWidth: rowIndex === block.rows.length - 1 ? 0 : 1,
                  borderBottomColor: colors.line,
                }}
              >
                {row.map((cell, cellIndex) => (
                  <Text
                    key={cellIndex}
                    className="type-caption"
                    numberOfLines={3}
                    style={{
                      color: colors.text2,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      minWidth: 96,
                    }}
                  >
                    <Inline nodes={parseInlineCell(cell)} />
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      );

    case 'code':
      return (
        <View
          style={{
            padding: 12,
            borderRadius: 10,
            backgroundColor: colors.inset,
            borderWidth: 1,
            borderColor: colors.line,
          }}
        >
          {block.language ? (
            <Text className="type-micro mb-1" style={{ color: colors.text3 }}>
              {block.language}
            </Text>
          ) : null}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text className="type-codeSm" style={{ color: colors.text2, fontFamily: 'monospace' }}>
              {block.code}
            </Text>
          </ScrollView>
        </View>
      );

    case 'divider':
      return <View style={{ height: 1, backgroundColor: colors.line }} />;

    default:
      return null;
  }
}

function parseInlineCell(cell: string): InlineNode[] {
  // Imported lazily to keep the block renderer readable.
  return parseMarkdown(cell)
    .flatMap((block) => (block.kind === 'paragraph' ? block.content : []));
}

export interface MarkdownProps {
  content: string;
  sources?: Source[];
  activeCitation?: number | null;
  onCitationPress?: (index: number) => void;
}

export function Markdown({
  content,
  sources,
  activeCitation,
  onCitationPress,
}: MarkdownProps): React.JSX.Element {
  const blocks = useMemo(() => parseMarkdown(content), [content]);
  const sourceMap = useMemo(() => {
    const map = new Map<string, Source>();
    for (const source of sources ?? []) map.set(source.id, source);
    return map;
  }, [sources]);

  return (
    <View className="gap-3">
      {blocks.map((block, index) => (
        <Block
          key={index}
          block={block}
          sources={sourceMap}
          activeCitation={activeCitation}
          onCitationPress={onCitationPress}
        />
      ))}
    </View>
  );
}