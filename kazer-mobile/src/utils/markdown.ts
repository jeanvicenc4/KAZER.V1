/**
 * Minimal Markdown parser for assistant answers.
 *
 * KAZER answers are content, not chat: they need headings, tables, lists, code
 * and inline `[1]` citation anchors. A full Markdown dependency would be
 * heavier than this parser, so it is implemented here — deliberately small,
 * synchronous and dependency-free.
 */

export type InlineNode =
  | { kind: 'text'; text: string }
  | { kind: 'strong'; text: string }
  | { kind: 'em'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'citation'; index: number; raw: string };

export type BlockNode =
  | { kind: 'heading'; level: 1 | 2 | 3; content: InlineNode[] }
  | { kind: 'paragraph'; content: InlineNode[] }
  | { kind: 'list'; ordered: boolean; items: InlineNode[][] }
  | { kind: 'quote'; content: InlineNode[] }
  | { kind: 'table'; header: string[]; rows: string[][] }
  | { kind: 'code'; language: string | null; code: string }
  | { kind: 'divider' };

const INLINE_PATTERN =
  /(\*\*[^*\n]+\*\*)|(`[^`\n]+`)|(\*[^*\n]+\*)|(\[\d+\])/g;

const HEADING_PATTERN = /^(#{1,3})\s+(.*)$/;
const ORDERED_PATTERN = /^\d+[.)]\s+(.*)$/;
const UNORDERED_PATTERN = /^[-*•]\s+(.*)$/;
const QUOTE_PATTERN = /^>\s?(.*)$/;
const DIVIDER_PATTERN = /^(-{3,}|_{3,}|\*{3,})$/;
const FENCE_PATTERN = /^```(\w*)\s*$/;

function isTableDivider(line: string): boolean {
  return /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/.test(line.trim());
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

/** Parse inline markup into renderable nodes, preserving citation anchors. */
export function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let lastIndex = 0;

  INLINE_PATTERN.lastIndex = 0;
  let match = INLINE_PATTERN.exec(text);

  while (match !== null) {
    if (match.index > lastIndex) {
      nodes.push({ kind: 'text', text: text.slice(lastIndex, match.index) });
    }

    const [raw, strong, code, em, citation] = match;

    if (strong) {
      nodes.push({ kind: 'strong', text: strong.slice(2, -2) });
    } else if (code) {
      nodes.push({ kind: 'code', text: code.slice(1, -1) });
    } else if (em) {
      nodes.push({ kind: 'em', text: em.slice(1, -1) });
    } else if (citation) {
      const index = Number.parseInt(citation.slice(1, -1), 10);
      nodes.push({ kind: 'citation', index, raw: citation });
    }

    lastIndex = match.index + raw.length;
    match = INLINE_PATTERN.exec(text);
  }

  if (lastIndex < text.length) {
    nodes.push({ kind: 'text', text: text.slice(lastIndex) });
  }

  return nodes;
}

function flushParagraph(buffer: string[], blocks: BlockNode[]): void {
  const joined = buffer.join(' ').trim();
  buffer.length = 0;
  if (joined.length > 0) {
    blocks.push({ kind: 'paragraph', content: parseInline(joined) });
  }
}

/** Parse a full answer into blocks. Unknown syntax degrades to paragraphs. */
export function parseMarkdown(source: string): BlockNode[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: BlockNode[] = [];
  const paragraph: string[] = [];

  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? '';
    const trimmed = line.trim();

    // Fenced code block
    const fence = FENCE_PATTERN.exec(trimmed);
    if (fence) {
      flushParagraph(paragraph, blocks);
      const language = fence[1] ? fence[1] : null;
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index]?.trim() ?? '')) {
        code.push(lines[index] ?? '');
        index += 1;
      }
      index += 1; // closing fence
      blocks.push({ kind: 'code', language, code: code.join('\n') });
      continue;
    }

    if (trimmed.length === 0) {
      flushParagraph(paragraph, blocks);
      index += 1;
      continue;
    }

    if (DIVIDER_PATTERN.test(trimmed)) {
      flushParagraph(paragraph, blocks);
      blocks.push({ kind: 'divider' });
      index += 1;
      continue;
    }

    const heading = HEADING_PATTERN.exec(trimmed);
    if (heading) {
      flushParagraph(paragraph, blocks);
      const level = Math.min(heading[1]?.length ?? 2, 3) as 1 | 2 | 3;
      blocks.push({ kind: 'heading', level, content: parseInline(heading[2] ?? '') });
      index += 1;
      continue;
    }

    const quote = QUOTE_PATTERN.exec(trimmed);
    if (quote) {
      flushParagraph(paragraph, blocks);
      blocks.push({ kind: 'quote', content: parseInline(quote[1] ?? '') });
      index += 1;
      continue;
    }

    // Table: header row followed by a divider row.
    if (trimmed.includes('|') && isTableDivider(lines[index + 1] ?? '')) {
      flushParagraph(paragraph, blocks);
      const header = splitTableRow(trimmed);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && (lines[index] ?? '').includes('|')) {
        rows.push(splitTableRow(lines[index] ?? ''));
        index += 1;
      }
      blocks.push({ kind: 'table', header, rows });
      continue;
    }

    const ordered = ORDERED_PATTERN.exec(trimmed);
    if (ordered) {
      flushParagraph(paragraph, blocks);
      const items: InlineNode[][] = [];
      while (index < lines.length) {
        const item = ORDERED_PATTERN.exec((lines[index] ?? '').trim());
        if (!item) break;
        items.push(parseInline(item[1] ?? ''));
        index += 1;
      }
      blocks.push({ kind: 'list', ordered: true, items });
      continue;
    }

    const unordered = UNORDERED_PATTERN.exec(trimmed);
    if (unordered) {
      flushParagraph(paragraph, blocks);
      const items: InlineNode[][] = [];
      while (index < lines.length) {
        const item = UNORDERED_PATTERN.exec((lines[index] ?? '').trim());
        if (!item) break;
        items.push(parseInline(item[1] ?? ''));
        index += 1;
      }
      blocks.push({ kind: 'list', ordered: false, items });
      continue;
    }

    paragraph.push(trimmed);
    index += 1;
  }

  flushParagraph(paragraph, blocks);
  return blocks;
}

/** Collect every citation index used by an answer, in first-appearance order. */
export function collectCitations(source: string): number[] {
  const seen = new Set<number>();
  for (const block of parseMarkdown(source)) {
    for (const node of inlineNodesOf(block)) {
      if (node.kind === 'citation') seen.add(node.index);
    }
  }
  return [...seen].sort((a, b) => a - b);
}

function inlineNodesOf(block: BlockNode): InlineNode[] {
  switch (block.kind) {
    case 'heading':
    case 'paragraph':
    case 'quote':
      return block.content;
    case 'list':
      return block.items.flat();
    case 'table':
      return [...block.header, ...block.rows.flat()].flatMap((cell) =>
        parseInline(cell),
      );
    default:
      return [];
  }
}