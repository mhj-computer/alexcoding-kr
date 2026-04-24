import Link from 'next/link';
import { requireAuth } from '@/lib/auth/session';

/**
 * 학생 피드백 페이지 — Step 5에서 구현 예정.
 * 미들웨어로 로그인 필수.
 */
export default async function FeedbackPage() {
  await requireAuth('/feedback');

  return (
    <section className="flex-1 px-5 py-20 md:py-28 mesh-light">
      <div className="container-narrow text-center">
        <p className="font-display italic text-brand-500 text-sm tracking-[0.22em] uppercase mb-4">
          Coming soon
        </p>
        <h1 className="font-display text-display-md text-brand-900 mb-5">
          학생 피드백 시스템 준비 중입니다
        </h1>
        <p className="text-ink-muted leading-relaxed max-w-md mx-auto mb-8">
          수업 후 학생별 맞춤 피드백을 조회할 수 있는 기능을 곧 공개합니다.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-brand-900 text-white font-medium hover:bg-brand-800"
        >
          메인으로
        </Link>
      </div>
    </section>
  );
}
