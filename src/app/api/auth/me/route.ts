import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

/** GET /api/auth/me — 현재 세션 정보 (헤더/클라이언트용) */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: { id: session.sub, name: session.name, role: session.role },
  });
}
