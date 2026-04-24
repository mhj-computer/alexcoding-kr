import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { parentTitle } from '@/lib/utils';
import { logoutAction } from './actions/auth';

/**
 * Step 2 메인 페이지.
 * Step 3에서 Hero + Menu 카드 + Footer 가 포함된 정식 메인으로 재설계됨.
 */
export default async function HomePage() {
  const session = await getSession();

  return (
    <main className="flex-1 flex items-center justify-center px-5 py-20 mesh-light">
      <div className="max-w-2xl text-center">
        <p className="font-display italic text-brand-500 text-sm tracking-[0.2em] uppercase mb-4">
          Step 2 Complete
        </p>
        <h1 className="font-display text-display-lg text-brand-900 mb-6">
          인증 시스템이 준비됐습니다
        </h1>
        <p className="text-ink-muted leading-relaxed mb-8">
          로그인, 세션 관리, 관리자 분기, rate limit 이 모두 동작합니다.
        </p>

        {session ? (
          <div className="inline-flex flex-col gap-3 px-6 py-5 rounded-2xl bg-brand-50 border border-brand-100 text-left">
            <p className="text-sm text-brand-900">
              <strong className="font-medium">
                {session.role === 'admin' ? '관리자' : parentTitle(session.name)}
              </strong>{' '}
              환영합니다.
            </p>
            <div className="flex gap-2">
              {session.role === 'admin' && (
                <Link
                  href="/admin"
                  className="inline-flex items-center h-10 px-4 rounded-lg bg-brand-900 text-white text-sm font-medium hover:bg-brand-800"
                >
                  관리자 페이지
                </Link>
              )}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="h-10 px-4 rounded-lg border border-paper-border text-sm font-medium text-ink-muted hover:bg-paper-subtle"
                >
                  로그아웃
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-14 px-8 rounded-xl bg-brand-900 text-white font-medium hover:bg-brand-800 shadow-card"
            >
              로그인
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
