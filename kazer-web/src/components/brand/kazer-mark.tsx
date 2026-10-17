import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * KazerMark — the KAZER glyph.
 *
 * A geometric "K" built from an angular chevron and a vertical stem, rendered
 * with a metallic gold gradient. Deliberately distinct from any existing
 * product mark: the chevron is a single continuous stroke, the stem is a
 * narrow tapered bar, and the counter-space stays open.
 */

export interface KazerMarkProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  /** Renders the animated "drawing" variant used on splash / hero. */
  animated?: boolean;
  className?: string;
}

export function KazerMark({
  size = 28,
  animated = false,
  className,
  ...props
}: KazerMarkProps) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="KAZER"
      className={cn('shrink-0', className)}
      {...props}
    >
      <defs>
        <linearGradient id={`${id}-metal`} x1="4" y1="2" x2="28" y2="30">
          <stop offset="0%" stopColor="oklch(0.92 0.145 92)" />
          <stop offset="28%" stopColor="oklch(0.82 0.135 82)" />
          <stop offset="56%" stopColor="oklch(0.62 0.105 72)" />
          <stop offset="78%" stopColor="oklch(0.8 0.13 80)" />
          <stop offset="100%" stopColor="oklch(0.9 0.14 94)" />
        </linearGradient>
      </defs>

      {/* Faceted lozenge */}
      <path
        d="M16 1.6 30.4 16 16 30.4 1.6 16 16 1.6Z"
        fill={`url(#${id}-metal)`}
        className={animated ? 'kazer-mark-lozenge' : undefined}
      />

      {/* Lower-right facet, darker for depth */}
      <path
        d="M16 30.4 30.4 16 16 16v14.4Z"
        fill="oklch(0.52 0.09 70)"
        opacity="0.5"
      />

      {/* Chevron cut — the "execute" gesture */}
      <path
        d="M11.2 9.4 20.8 16l-9.6 6.6v-5.1L16 16l-4.8-1.5V9.4Z"
        fill="oklch(0.145 0.012 285)"
      />
    </svg>
  );
}

/**
 * KazerWordmark — the "KAZER" logotype with the metallic treatment.
 * Letter-spacing is deliberately wide; the weight stays at 500.
 */
export function KazerWordmark({
  className,
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span
      className={cn(
        'kazer-gradient-text inline-flex items-baseline font-semibold tracking-[0.16em]',
        className,
      )}
      style={{ fontSize: size, lineHeight: 1 }}
    >
      KAZER
    </span>
  );
}

/** The full lockup: mark + wordmark. */
export function KazerLockup({
  className,
  size = 24,
  showWordmark = true,
}: {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <KazerMark size={size} />
      {showWordmark ? <KazerWordmark size={size * 0.82} /> : null}
    </span>
  );
}
