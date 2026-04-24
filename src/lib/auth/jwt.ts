import 'server-only';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

/**
 * JWT 세션 토큰 발급/검증.
 *
 * jose 라이브러리 사용 이유:
 *   Edge 런타임(middleware.ts)에서도 동작해야 함.
 *   Node 'crypto' 모듈에 의존하는 jsonwebtoken은 Edge에서 동작 불가.
 */

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';
const JWT_ISSUER = 'alexcoding';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다. .env.local 을 확인하세요.');
}

// 토큰 길이가 너무 짧으면 런타임 경고 (운영 배포 방지)
if (JWT_SECRET.length < 32) {
  console.warn('⚠️  JWT_SECRET 이 너무 짧습니다 (32자 이상 권장).');
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface SessionPayload extends JWTPayload {
  sub: string;                 // student id (UUID) 또는 'admin'
  role: 'student' | 'admin';
  name: string;                // 표시용 이름 ('관리자' 또는 학생 이름)
}

export async function signSession(
  payload: Omit<SessionPayload, 'iat' | 'exp' | 'iss' | 'jti'>,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secretKey);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, { issuer: JWT_ISSUER });

    // 필수 필드 런타임 검증 (토큰이 변조됐을 가능성 방어)
    if (
      typeof payload.sub !== 'string' ||
      (payload.role !== 'student' && payload.role !== 'admin') ||
      typeof payload.name !== 'string'
    ) {
      return null;
    }
    return payload as SessionPayload;
  } catch {
    // 만료, 변조, 잘못된 서명 등 모두 null 반환
    return null;
  }
}

export const SESSION_COOKIE = 'session';

/** 쿠키 옵션 (로그인 시 response에 세팅) */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7일 (JWT 만료와 맞춤)
};
