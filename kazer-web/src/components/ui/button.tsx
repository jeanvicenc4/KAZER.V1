'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * KAZER button.
 * Rules (design system §11):
 * - one primary CTA per screen
 * - micro-interaction: scale 0.97 on active, -1px on hover (primary only)
 * - visible gold focus ring
 * - disabled = 45% opacity, never hidden
 */
const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-45 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--kazer-gold)] text-[var(--kazer-text-inverse)] font-medium hover:bg-[var(--kazer-gold-text)] hover:-translate-y-px shadow-[var(--shadow-sm)]',
        secondary:
          'bg-[var(--kazer-surface)] text-[var(--kazer-text)] border border-[var(--kazer-line-strong)] hover:bg-[var(--kazer-elevated)] hover:border-[var(--kazer-line-active)]',
        ghost:
          'text-[var(--kazer-text-2)] hover:bg-[var(--kazer-elevated)] hover:text-[var(--kazer-text)]',
        outlineGold:
          'text-[var(--kazer-gold-text)] border border-[var(--kazer-line-gold)] hover:bg-[var(--kazer-gold-wash)] hover:border-[var(--kazer-gold)]',
        danger:
          'bg-[var(--kazer-red-wash)] text-[var(--kazer-red)] border border-[color-mix(in_oklch,var(--kazer-red)_32%,transparent)] hover:bg-[color-mix(in_oklch,var(--kazer-red)_22%,transparent)]',
      },
      size: {
        sm: 'h-8 px-3 text-[13px]',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-[15px]',
        icon: 'h-10 w-10',
        iconSm: 'h-8 w-8',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
