import 'server-only';
import bcrypt from 'bcryptjs';

/**
 * 생년월일 해싱 (로그인 자격 증명으로 사용).
 *
 * - 평문 저장 절대 금지. DB에 birthdate_hash 컬럼으로만 저장.
 * - bcrypt cost 10 기본값 (해시 1회에 ~100ms, 브루트포스 완화).
 * - 생일은 엔트로피가 낮아 (6자리) 브루트포스가 이론상 가능하지만,
 *   bcrypt 지연 + rate limit + 관리자 사전 등록 정책으로 방어.
 */

const BCRYPT_COST = 10;

export async function hashBirthdate(birthdate: string): Promise<string> {
  return bcrypt.hash(birthdate, BCRYPT_COST);
}

export async function verifyBirthdate(birthdate: string, hash: string): Promise<boolean> {
  return bcrypt.compare(birthdate, hash);
}
