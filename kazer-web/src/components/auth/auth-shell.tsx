import Link from 'next/link';
import { KazerLockup } from '@/components/brand/kazer-mark';

/**
 * AuthShell — two-column layout: brand on the left, form on the right.
 */
export function AuthShell({
  children,
  quote,
}: {
  children: React.ReactNode;
  quote?: { text: string; author: string };
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1fr]">
      {/* Brand column */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-[var(--kazer-line)] bg-[var(--kazer-void)] p-10 lg:flex">
        <Link
          href="/"
          aria-label="KAZER — início"
          className="relative rounded-[6px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]"
        >
          <KazerLockup size={26} />
        </Link>

        <div className="relative max-w-[38ch]">
          <p className="text-[22px] font-medium leading-[30px] tracking-[-0.01em] text-[var(--kazer-text)]">
            {quote?.text ??
              'Pergunte. O KAZER executa. Respostas com fonte e artefato pronto.'}
          </p>
          {quote?.author ? (
            <p className="mt-4 text-[13px] text-[var(--kazer-text-3)]">
              {quote.author}
            </p>
          ) : null}
        </div>

        <p className="relative text-[12px] text-[var(--kazer-text-3)]">
          © 2026 KAZER
        </p>
      </div>

      {/* Form column */}
      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[380px]">
          <div className="mb-8 lg:hidden">
            <Link href="/" aria-label="KAZER — início">
              <KazerLockup size={24} />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
