'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Markdown renderer with KAZER typography.
 * - reading column max 76ch
 * - tables scroll horizontally on narrow screens
 * - code blocks get a copy button
 * - inline [n] citations are rendered as CitationChip by the parent
 */

export function Markdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'kazer-reading text-[15px] leading-[1.65] text-[var(--kazer-text)]',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-3 mt-6 text-[26px] font-medium leading-[1.25] tracking-[-0.015em] first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2.5 mt-6 text-[20px] font-medium leading-[1.3] tracking-[-0.01em] first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-5 text-[17px] font-medium leading-[1.35] first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-3.5 last:mb-0">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--kazer-text)]">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[var(--kazer-text-2)]">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="mb-3.5 ml-0 list-none space-y-1.5 last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3.5 ml-0 list-none space-y-1.5 [counter-reset:kz] last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => {
            const ordered = (props as { index?: number }).index;
            const isOrdered =
              typeof ordered === 'number' && !/^\d/.test(String(children ?? ''));
            return (
              <li className="relative pl-5 text-[15px] leading-[1.65]">
                <span
                  aria-hidden
                  className="absolute left-0 top-[3px] h-1.5 w-1.5 rounded-full bg-[var(--kazer-gold)]"
                />
                {children}
              </li>
            );
          },
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--kazer-gold-text)] underline decoration-[color-mix(in_oklch,var(--kazer-gold)_45%,transparent)] underline-offset-[3px] transition-colors hover:decoration-[var(--kazer-gold)]"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-2 border-[var(--kazer-line-gold)] pl-4 text-[var(--kazer-text-2)]">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-6 border-[var(--kazer-line)]" />,
          table: ({ children }) => (
            <div className="kazer-scroll my-4 overflow-x-auto rounded-lg border border-[var(--kazer-line)]">
              <table className="w-full border-collapse text-[14px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[var(--kazer-surface)]">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-[var(--kazer-line)] px-3 py-2.5 text-left text-[13px] font-medium text-[var(--kazer-text-2)]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-[var(--kazer-line)] px-3 py-2.5 align-top text-[14px] text-[var(--kazer-text-2)] last:border-0">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="last:[&>td]:border-0">{children}</tr>
          ),
          code: ({ children, className: codeClass }) => {
            const isBlock = Boolean(codeClass?.includes('language-'));
            if (!isBlock) {
              return (
                <code className="rounded-[4px] border border-[var(--kazer-line)] bg-[var(--kazer-inset)] px-[5px] py-[2px] font-mono text-[13px] text-[var(--kazer-gold-text)]">
                  {children}
                </code>
              );
            }
            return <CodeBlock language={codeClass?.replace('language-', '')}>{children}</CodeBlock>;
          },
          pre: ({ children }) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({
  language,
  children,
}: {
  language?: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = React.useState(false);

  const raw = String(children).replace(/\n$/, '');

  const copy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the button simply won't confirm */
    }
  }, [raw]);

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-[var(--kazer-line)] bg-[var(--kazer-inset)]">
      <div className="flex items-center justify-between border-b border-[var(--kazer-line)] px-3 py-1.5">
        <span className="font-mono text-[12px] text-[var(--kazer-text-3)]">
          {language || 'texto'}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Código copiado' : 'Copiar código'}
          className="flex h-8 items-center gap-1.5 rounded-[6px] px-2 text-[12px] text-[var(--kazer-text-3)] transition-colors hover:bg-[var(--kazer-elevated)] hover:text-[var(--kazer-text-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]"
        >
          {copied ? (
            <Check size={13} className="text-[var(--kazer-green)]" />
          ) : (
            <Copy size={13} />
          )}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="kazer-scroll overflow-x-auto px-3.5 py-3">
        <code className="font-mono text-[13px] leading-[20px] text-[var(--kazer-text-2)]">
          {raw}
        </code>
      </pre>
    </div>
  );
}
