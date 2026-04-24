import Link from 'next/link';
import { requireAuth } from '@/lib/auth/session';

/**
 * 수업 예약 페이지 — Step 4에서 주간 스케줄 시스템으로 구현 예정.
 * 미들웨어로 로그인 필수.
 */
export default async function BookingPage() {
  await requireAuth('/booking');

  return (
    <section className="flex-1 px-5 py-20 md:py-28 mesh-light">
      <div className="container-narrow text-center">
        <p className="font-display italic text-brand-500 text-sm tracking-[0.22em] uppercase mb-4">
          Coming soon
        </p>
        <h1 className="font-display text-display-md text-brand-900 mb-5">
          수업 예약 시스템 준비 중입니다
        </h1>
        <p className="text-ink-muted leading-relaxed max-w-md mx-auto mb-8">
          주간 스케줄 기반의 예약 시스템을 곧 공개합니다. 그 전까지는 카톡
          오픈채팅으로 예약해주세요.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href={
              process.env.NEXT_PUBLIC_KAKAO_OPENCHAT ??
              'https://open.kakao.com/o/s7DlmJri'
            }
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-brand-900 text-white font-medium hover:bg-brand-800"
          >
            카톡으로 예약 문의 →
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl border border-paper-border text-ink-muted hover:bg-paper-subtle"
          >
            메인으로
          </Link>
        </div>
      </div>
    </section>
  );
}
