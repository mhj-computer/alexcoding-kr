import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * 기본 버튼 컴포넌트. 30~50대 학부모 타겟이므로 큰 터치 영역과 명확한 색상 대비.
 *
 * - primary: 브랜드 네이비 배경 (주요 액션)
 * - secondary: 테두리만, 호버 시 채우기 (보조 액션)
 * - ghost: 배경 없음, 텍스트만 (링크성 액션)
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'lg',
    loading = false,
    fullWidth = false,
    className,
    children,
    disabled,
    ...rest
  },
  ref,
) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-xl ' +
    'transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ' +
    'focus-visible:outline-none';

  const sizes = {
    md: 'h-11 px-5 text-[15px]',
    lg: 'h-14 px-6 text-base',
  };

  const variants = {
    primary:
      'bg-brand-900 text-white hover:bg-brand-800 active:bg-brand-950 ' +
      'shadow-card hover:shadow-card-hover',
    secondary:
      'bg-white text-brand-900 border border-paper-border ' +
      'hover:bg-brand-50 hover:border-brand-200',
    ghost: 'text-brand-700 hover:bg-brand-50',
  };

  return (
    <button
      ref={ref}
      className={cn(
        base,
        sizes[size],
        variants[variant],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <>
          <span className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          <span>처리중...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
});
