'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Copy,
  Pencil,
  RefreshCw,
  Share2,
  SquareArrowOutUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Markdown } from './markdown';
import { CitationChip } from '@/components/sources/source-card';
import { MissionTrace, stepsFromToolRuns, ThinkingIndicator } from './mission-trace';
import { ToolRunRow } from './tool-run-row';
import type { Message, Source } from '@kazer/core';

/**
 * Message list rendering.
 *
 * Design rule: the KAZER does NOT use chat bubbles. The agent's answer is
 * flowing content; the user's message is a surface block, max 560px, with a
 * squared bottom-right corner marking authorship.
 */

export function UserMessage({ message }: { message: Message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="flex justify-end"
    >
      <div
        className={cn(
          'max-w-[560px] rounded-[14px] rounded-br-[4px] border border-[var(--kazer-line)] bg-[var(--kazer-surface)] px-4 py-3',
          'text-[15px] leading-[1.6] text-[var(--kazer-text)]',
        )}
      >
        {message.content}
      </div>
    </motion.div>
  );
}

export interface AssistantMessageProps {
  message: Message;
  sources?: Source[];
  activeCitation?: number | null;
  onCitationClick?: (index: number) => void;
  onRegenerate?: () => void;
  onCopy?: () => void;
  onEdit?: () => void;
  onShare?: () => void;
  streaming?: boolean;
}

export function AssistantMessage({
  message,
  sources = [],
  activeCitation = null,
  onCitationClick,
  onRegenerate,
  onCopy,
  onEdit,
  onShare,
  streaming = false,
}: AssistantMessageProps) {
  const [copied, setCopied] = React.useState(false);
  const steps = message.toolRuns ? stepsFromToolRuns(message.toolRuns) : [];

  const sourceByIndex = React.useMemo(() => {
    const map = new Map<number, Source>();
    for (const source of sources) map.set(source.index, source);
    return map;
  }, [sources]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      onCopy?.();
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
      className="group relative pl-6"
    >
      {/* Mission Trace rail — nodes only; the tool-run rows carry the labels */}
      {steps.length ? (
        <div className="absolute left-0 top-1 bottom-2 w-3">
          <MissionTrace steps={steps} railOnly className="[&>li]:pb-2.5" />
        </div>
      ) : (
        <span
          aria-hidden
          className="absolute left-[4px] top-2 h-1.5 w-1.5 rounded-full bg-[var(--kazer-gold)]"
        />
      )}

      {/* Reasoning block */}
      {message.reasoning ? (
        <details className="group/reasoning mb-3">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[13px] text-[var(--kazer-violet-soft)] transition-colors hover:text-[var(--kazer-violet)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]">
            <span className="kazer-trace-pulse h-1.5 w-1.5 rounded-full bg-[var(--kazer-violet)]" />
            Raciocínio do KAZER
          </summary>
          <div className="mt-2 rounded-r-md border-l-2 border-[var(--kazer-violet)] bg-[var(--kazer-violet-wash)] px-3 py-2.5">
            <p className="font-mono text-[13px] leading-[19px] text-[var(--kazer-text-2)]">
              {message.reasoning}
            </p>
          </div>
        </details>
      ) : null}

      {/* Tool runs */}
      {message.toolRuns && message.toolRuns.length ? (
        <div className="mb-3 space-y-0.5">
          {message.toolRuns.map((run) => (
            <ToolRunRow key={run.id} run={run} />
          ))}
        </div>
      ) : null}

      {/* Answer */}
      <div className="relative">
        <Markdown content={message.content} />

        {/* Inline citations appended after the text */}
        {message.citations && message.citations.length ? (
          <span className="ml-1 inline-flex gap-0.5 align-middle">
            {message.citations.slice(0, 9).map((citation) => (
              <CitationChip
                key={citation.index}
                index={citation.index}
                source={sourceByIndex.get(citation.index)}
                active={activeCitation === citation.index}
                onClick={() => onCitationClick?.(citation.index)}
              />
            ))}
          </span>
        ) : null}
      </div>

      {streaming ? (
        <div className="mt-3">
          <ThinkingIndicator />
        </div>
      ) : null}

      {/* Actions */}
      {!streaming ? (
        <div className="mt-3 flex items-center gap-0.5 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100">
          <MessageAction
            icon={copied ? Check : Copy}
            label={copied ? 'Resposta copiada' : 'Copiar resposta'}
            onClick={copy}
            active={copied}
          />
          {onRegenerate ? (
            <MessageAction
              icon={RefreshCw}
              label="Regenerar resposta"
              onClick={onRegenerate}
            />
          ) : null}
          {onEdit ? (
            <MessageAction
              icon={Pencil}
              label="Editar pergunta"
              onClick={onEdit}
            />
          ) : null}
          {onShare ? (
            <MessageAction
              icon={Share2}
              label="Compartilhar"
              onClick={onShare}
            />
          ) : null}
          <span className="ml-1.5 text-[12px] text-[var(--kazer-text-3)]">
            {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      ) : null}
    </motion.div>
  );
}

function MessageAction({
  icon: Icon,
  label,
  onClick,
  active = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-[6px] transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
        active
          ? 'bg-[var(--kazer-green-wash)] text-[var(--kazer-green)]'
          : 'text-[var(--kazer-text-3)] hover:bg-[var(--kazer-elevated)] hover:text-[var(--kazer-text-2)]',
      )}
    >
      <Icon size={13} />
    </button>
  );
}

/** Follow-up suggestion chips after an answer. */
export function FollowUpChips({
  suggestions,
  onSelect,
}: {
  suggestions: string[];
  onSelect: (value: string) => void;
}) {
  if (!suggestions.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-wrap gap-1.5 pl-6"
    >
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelect(suggestion)}
          className={cn(
            'rounded-full border border-[var(--kazer-line)] bg-[var(--kazer-surface)] px-3 py-1.5 text-left text-[13px] text-[var(--kazer-text-2)] transition-all duration-150',
            'hover:border-[var(--kazer-line-gold)] hover:bg-[var(--kazer-gold-wash)] hover:text-[var(--kazer-text)]',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
          )}
        >
          {suggestion}
        </button>
      ))}
    </motion.div>
  );
}
