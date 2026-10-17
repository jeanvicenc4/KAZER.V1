/**
 * Icon map — `@expo/vector-icons` Feather glyphs, resolved from tokens that
 * live in `@kazer/core` (Skill.icon, Artifact.type, Mode).
 */

import type { ComponentProps } from 'react';
import type Feather from '@expo/vector-icons/Feather';
import type { ArtifactType, Mode } from '@kazer/core';

/**
 * The exact glyph union the Feather component accepts, derived from its own
 * props so `name` is always assignable.
 */
export type FeatherGlyphs = ComponentProps<typeof Feather>['name'];

export type IconName = FeatherGlyphs;

/** Skill.icon → Feather glyph. */
export const skillIcons: Record<string, IconName> = {
  compass: 'compass',
  file: 'file-text',
  code: 'code',
  trending: 'trending-up',
  shield: 'shield',
};

/** Artifact.type → Feather glyph. */
export const artifactIcons: Record<ArtifactType, IconName> = {
  document: 'file-text',
  report: 'bar-chart-2',
  spreadsheet: 'grid',
  csv: 'grid',
  xlsx: 'grid',
  code: 'code',
  landing: 'layout',
  image: 'image',
  pdf: 'file',
  docx: 'file',
};

/** Artifact.type → pt-BR label used on cards and filter chips. */
export const artifactTypeLabels: Record<ArtifactType, string> = {
  document: 'Documento',
  report: 'Relatório',
  spreadsheet: 'Planilha',
  csv: 'CSV',
  xlsx: 'Planilha',
  code: 'Código',
  landing: 'Landing',
  image: 'Imagem',
  pdf: 'PDF',
  docx: 'DOCX',
};

/** Mode → Feather glyph + pt-BR label + one-line description. */
export const modeMeta: Record<
  Mode,
  { label: string; icon: IconName; hint: string; placeholder: string }
> = {
  chat: {
    label: 'Chat',
    icon: 'message-circle',
    hint: 'Pergunta direta, resposta curta.',
    placeholder: 'Pergunte qualquer coisa ao KAZER…',
  },
  research: {
    label: 'Research',
    icon: 'search',
    hint: 'Busca na web com citações verificáveis.',
    placeholder: 'O que o KAZER deve pesquisar?',
  },
  mission: {
    label: 'Missão',
    icon: 'cpu',
    hint: 'Executa o trabalho e entrega artefato.',
    placeholder: 'Descreva a missão e o resultado esperado…',
  },
};

export const tabIcons: Record<string, IconName> = {
  index: 'home',
  skills: 'layers',
  artifacts: 'folder',
  settings: 'user',
};