'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';

interface FormValues {
  name: string;
  birth: string;
}

/**
 * 로그인 페이지 (학생 + 관리자 공통).
 *
 * - 학생: 이름 + 생년월일 6자리
 * - 관리자: 같은 폼에 마스터 키 입력 시 서버가 감지 후 관리자 세션 발급
 */
export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params.get('next') ?? '/';

  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: '', birth: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? '로그인에 실패했습니다.');
        setSubmitting(false);
        return;
      }

      // 관리자는 /admin, 학생은 next 경로 (없으면 홈)
      const dest = json.user.role === 'admin' ? '/admin' : nextPath || '/';
      router.push(dest);
      router.refresh();
    } catch (err) {
      console.error(err);
      setServerError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-5 py-16 md:py-24 mesh-light">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link
            href="/"
            className="inline-block font-display italic text-brand-700 text-sm tracking-[0.2em] uppercase mb-3 hover:text-brand-900 transition-colors"
          >
            Alex Coding
          </Link>
          <h1 className="font-display text-display-md text-brand-900 mb-2">
            로그인
          </h1>
          <p className="text-ink-muted text-sm">
            학생 이름과 생년월일을 입력해주세요
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl shadow-card border border-paper-border p-6 md:p-8 space-y-5"
          noValidate
        >
          <FormField
            label="학생 이름"
            htmlFor="name"
            error={errors.name?.message}
          >
            <Input
              id="name"
              type="text"
              autoComplete="username"
              placeholder="홍길동"
              error={!!errors.name}
              {...register('name', {
                required: '이름을 입력해주세요.',
                minLength: { value: 2, message: '이름은 2자 이상이어야 합니다.' },
                maxLength: { value: 40, message: '이름이 너무 깁니다.' },
              })}
            />
          </FormField>

          <FormField
            label="생년월일 (6자리)"
            htmlFor="birth"
            hint="예: 2012년 3월 31일 → 120331"
            error={errors.birth?.message}
          >
            <Input
              id="birth"
              type="text"
              inputMode="numeric"
              autoComplete="current-password"
              placeholder="120331"
              className="tabular"
              error={!!errors.birth}
              {...register('birth', {
                required: '생년월일을 입력해주세요.',
              })}
            />
          </FormField>

          {serverError && (
            <div
              className="rounded-xl bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger"
              role="alert"
            >
              {serverError}
            </div>
          )}

          <Button type="submit" fullWidth loading={submitting}>
            로그인하기
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          계정이 없으신가요? <br className="sm:hidden" />
          <a
            href={process.env.NEXT_PUBLIC_KAKAO_OPENCHAT ?? '#'}
            target="_blank"
            rel="noreferrer"
            className="text-brand-700 font-medium hover:text-brand-900 underline-offset-4 hover:underline"
          >
            담당 선생님께 문의해주세요
          </a>
        </p>
      </div>
    </main>
  );
}
