import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Edge 미들웨어 — 라우트 접근 제어.
 *
 * - /booking, /feedback    : 로그인 필요
 * - /admin/**              : role === 'admin' 만
 * - 그 외는 통과
 *
 * ⚠️ 이 파일은 Edge 런타임에서 실행되므로:
 *   - 'server-only' 패키지 import 금지
 *   - Node 내장 모듈(fs, path, bcrypt 등) 사용 불가
 *   - jose 만으로 JWT 검증 (lib/auth/jwt.ts 를 import 하지 않음)
 */

const SESSION_COOKIE = 'session';
const JWT_ISSUER = 'alexcoding';

const PROTECTED_PREFIXES = ['/booking', '/feedback'];
const ADMIN_PREFIXES = ['/admin'];

function matches(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function redirectToLogin(req: NextRequest): NextResponse {
  const url = new URL('/login', req.url);
  url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = matches(pathname, PROTECTED_PREFIXES);
  const isAdminOnly = matches(pathname, ADMIN_PREFIXES);

  if (!isProtected && !isAdminOnly) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return redirectToLogin(req);

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('[middleware] JWT_SECRET not set');
    return redirectToLogin(req);
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      issuer: JWT_ISSUER,
    });

    if (isAdminOnly && payload.role !== 'admin') {
      // 일반 학생이 관리자 페이지 접근 시도 → 홈으로 (revealing 피하기)
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  } catch {
    return redirectToLogin(req);
  }
}

export const config = {
  matcher: ['/booking/:path*', '/feedback/:path*', '/admin/:path*'],
};
