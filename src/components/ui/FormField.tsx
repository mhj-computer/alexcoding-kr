import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

/**
 * 폼 필드 래퍼. Label + 입력 요소 + Hint/Error 텍스트.
 * 부모님이 보기 편하도록 라벨과 입력 사이 간격을 넉넉하게.
 */
export function FormField({ label, htmlFor, hint, error, children }: FormFieldProps) {
  const describedBy = error ? `${htmlFor}-error` : hint ? `${htmlFor}-hint` : undefined;

  return (
    <div>
      <label htmlFor={htmlFor} className="inline-block text-sm font-medium text-ink mb-2">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="mt-2 text-sm text-ink-soft">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
