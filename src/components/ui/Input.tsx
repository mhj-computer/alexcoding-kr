import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-14 w-full rounded-xl border bg-white px-4 text-base text-ink',
        'placeholder:text-ink-soft',
        'transition-colors',
        error
          ? 'border-danger focus:border-danger'
          : 'border-paper-border hover:border-brand-200 focus:border-brand-500',
        'focus-visible:outline-none',
        // iOS 확대 방지 - 최소 16px (globals.css에서도 처리하지만 명시)
        'text-[16px]',
        className,
      )}
      {...rest}
    />
  );
});
