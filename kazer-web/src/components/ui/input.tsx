'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    return (
      <div className="w-full">
        {label ? (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-[13px] font-medium text-[var(--kazer-text-2)]"
          >
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-11 w-full rounded-md border bg-[var(--kazer-inset)] px-3.5 text-[15px] text-[var(--kazer-text)]',
            'placeholder:text-[var(--kazer-text-3)]',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
            error
              ? 'border-[var(--kazer-red)] focus-visible:outline-[var(--kazer-red)]'
              : 'border-[var(--kazer-line-strong)] hover:border-[var(--kazer-line-active)] focus:border-[var(--kazer-line-gold)]',
            className,
          )}
          {...props}
        />
        {error ? (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="mt-1.5 text-[13px] text-[var(--kazer-red)]"
          >
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="mt-1.5 text-[13px] text-[var(--kazer-text-3)]">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = 'Input';
