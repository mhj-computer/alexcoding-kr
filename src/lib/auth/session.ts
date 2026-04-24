import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySession, type SessionPayload } from './jwt';

/**
 * 서버 컴포넌트 / API Route / Server Action 에서
 * 현재 세션을 읽거나 보호된 접근을 강제하는 헬퍼.
 */

/** 현재 세션 반환. 미로그인/만료면 null */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** 로그인 필수. 미로그인이면 /login 으로 리다이렉트 */
export async function requireAuth(nextPath?: string): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect(nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : '/login');
  }
  return session;
}

/** 관리자 필수. 일반 학생이면 메인으로, 미로그인이면 /login 으로 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect('/');
  return session;
}
