'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE } from '@/lib/auth/jwt';

/**
 * 로그아웃 Server Action.
 * form 에서 action={logoutAction} 으로 사용. 쿠키 삭제 후 홈으로 이동.
 */
export async function logoutAction() {
  cookies().delete(SESSION_COOKIE);
  redirect('/');
}
