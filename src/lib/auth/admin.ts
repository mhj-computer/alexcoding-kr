import 'server-only';

/**
 * 관리자 마스터 키 검증.
 *
 * 로그인 폼에서 이름 필드에 ADMIN_NAME, 생년월일 필드에 ADMIN_BIRTH 입력 시 관리자 진입.
 * 타이밍 공격 방어를 위해 상수 시간 비교 사용 (짧은 문자열이지만 모범 사례).
 */

const ADMIN_NAME = process.env.ADMIN_NAME;
const ADMIN_BIRTH = process.env.ADMIN_BIRTH;

if (!ADMIN_NAME || !ADMIN_BIRTH) {
  throw new Error(
    'ADMIN_NAME / ADMIN_BIRTH 환경변수가 설정되지 않았습니다. .env.local 및 Vercel 환경변수 설정 확인.',
  );
}

export const ADMIN_DISPLAY_NAME = '관리자';

/** 관리자 자격 증명과 일치하는지 상수 시간 비교 */
export function isAdminCredential(name: string, birth: string): boolean {
  return safeEqual(name, ADMIN_NAME!) && safeEqual(birth, ADMIN_BIRTH!);
}

function safeEqual(a: string, b: string): boolean {
  // 길이가 다르면 즉시 false (공격자가 길이를 알 수 있으나 이 경우엔 문제 없음)
  if (a.length !== b.length) {
    // 그래도 시간을 맞추기 위해 길이가 같은 척 한 번 돌림
    let _ = 0;
    for (let i = 0; i < a.length; i++) _ |= a.charCodeAt(i);
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
