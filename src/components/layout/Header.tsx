import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { parentTitle } from '@/lib/utils';
import { logoutAction } from '@/app/actions/auth';

/**
 * 전역 헤더. 서버 컴포넌트 — 세션 상태를 쿠키에서 직접 읽어 즉시 렌더.
 *
 * 구성:
 *  - 좌측: AlexCoding 워드마크 로고 (클릭 시 홈)
 *  - 중앙(데스크탑): 네비 - 소개 / 예약 / 피드백
 *  - 우측: 로그인 상태
 *     · 미로그인 → "로그인" 버튼
 *     · 학생 → "***학부모님" + 로그아웃
 *     · 관리자 → "관리자" + 관리자 페이지 링크 + 로그아웃
 */
export async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 border-b border-paper-border/70 bg-white/85 backdrop-blur-md">
      <div className="container-wide flex h-16 md:h-[72px] items-center justify-between gap-4">
        {/* 로고 */}
        <Link
          href="/"
          className="group flex items-baseline gap-0.5 select-none"
          aria-label="AlexCoding 홈"
        >
          <span className="font-display text-[22px] md:text-[26px] font-medium text-brand-900 tracking-tight">
            Alex
          </span>
          <span className="font-display text-[22px] md:text-[26px] italic font-medium text-brand-500 tracking-tight">
            coding
          </span>
          <span
            aria-hidden
            className="ml-1 h-1.5 w-1.5 rounded-full bg-accent mb-1 group-hover:scale-125 transition-transform"
          />
        </Link>

        {/* 데스크탑 네비 */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] text-ink-muted">
          <Link
            href="/about"
            className="hover:text-brand-900 transition-colors"
          >
            강사 소개
          </Link>
          <Link
            href="/booking"
            className="hover:text-brand-900 transition-colors"
          >
            수업 스케줄
          </Link>
          <Link
            href="/feedback"
            className="hover:text-brand-900 transition-colors"
          >
            학생 피드백
          </Link>
        </nav>

        {/* 우측 세션 영역 */}
        <div className="flex items-center gap-2 md:gap-3">
          {session ? (
            <>
              <span className="hidden sm:inline-block text-sm text-brand-900 font-medium">
                {session.role === 'admin'
                  ? '관리자'
                  : parentTitle(session.name)}
              </span>
              {session.role === 'admin' && (
                <Link
                  href="/admin"
                  className="hidden md:inline-flex items-center h-9 px-3.5 rounded-lg bg-brand-50 text-brand-900 text-sm font-medium hover:bg-brand-100 transition-colors"
                >
                  관리자
                </Link>
              )}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="h-9 px-3 rounded-lg text-sm text-ink-soft hover:text-brand-900 hover:bg-paper-subtle transition-colors"
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center h-9 md:h-10 px-4 md:px-5 rounded-lg bg-brand-900 text-white text-sm font-medium hover:bg-brand-800 transition-colors"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
