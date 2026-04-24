import type { LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Label({ className, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        'inline-block text-sm font-medium text-ink mb-2',
        className,
      )}
      {...rest}
    />
  );
}
