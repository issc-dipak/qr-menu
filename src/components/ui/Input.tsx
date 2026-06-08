'use client';
import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils';

// ─── INPUT ────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold tracking-wider uppercase text-muted mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'input-base',
          error && 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(255,77,109,0.1)]',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  )
);
Input.displayName = 'Input';

// ─── SELECT ───────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold tracking-wider uppercase text-muted mb-1.5">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={cn(
          'input-base appearance-none cursor-pointer',
          error && 'border-danger',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface-2">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';

// ─── TEXTAREA ─────────────────────────────────────────────────
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold tracking-wider uppercase text-muted mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn('input-base resize-y min-h-[100px]', error && 'border-danger', className)}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';
