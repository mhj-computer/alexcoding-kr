import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { loginSchema } from '@/lib/auth/schema';
import { signSession, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from '@/lib/auth/jwt';
import { verifyBirthdate } from '@/lib/auth/password';
import { isAdminCredential, ADMIN_DISPLAY_NAME } from '@/lib/auth/admin';
import { checkRateLimit, recordAttempt, getClientIp } from '@/lib/auth/rate-limit';
import { getSupabaseAdmin } from '@/lib/supabase/server';

/**
 * POST /api/auth/login
 *
 * 흐름:
 *   1. zod 검증
 *   2. rate limit 확인
 *   3. 관리자 마스터 키 먼저 검사 (DB 조회 없이)
 *   4. 일반 학생: DB에서 이름으로 조회 → bcrypt 비교
 *   5. 성공 시 JWT 서명 + 쿠키 세팅
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? '입력값을 확인해주세요.' },
      { status: 400 },
    );
  }

  const { name, birth } = parsed.data;

  // Rate limit
  const rl = await checkRateLimit(ip, name);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: `로그인 시도 횟수를 초과했습니다. ${rl.retryAfterSec}초 후 다시 시도해주세요.`,
      },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    );
  }

  // 1) 관리자 마스터 키 검사 (가장 먼저, DB 부하 없음)
  if (isAdminCredential(name, birth)) {
    const token = await signSession({
      sub: 'admin',
      role: 'admin',
      name: ADMIN_DISPLAY_NAME,
    });
    cookies().set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
    await recordAttempt(ip, name, true);
    return NextResponse.json({
      ok: true,
      user: { id: 'admin', name: ADMIN_DISPLAY_NAME, role: 'admin' },
    });
  }

  // 2) 일반 학생 로그인 — 이름으로 조회 (동명이인 가능 → 배열)
  const supabase = getSupabaseAdmin();
  const { data: students, error } = await supabase
    .from('students')
    .select('id, name, birthdate_hash')
    .eq('name', name);

  if (error) {
    console.error('[login] DB error:', error.message);
    return NextResponse.json({ error: '일시적인 오류가 발생했습니다.' }, { status: 500 });
  }

  if (!students || students.length === 0) {
    await recordAttempt(ip, name, false);
    // 학생 존재 여부를 드러내지 않도록 공통 에러 메시지
    return NextResponse.json(
      { error: '입력하신 정보와 일치하는 학생을 찾을 수 없습니다. 담당 선생님께 문의해주세요.' },
      { status: 401 },
    );
  }

  // 동명이인 모두 bcrypt 비교 (보통 1명, 많아야 2-3명 수준이라 성능 OK)
  let matched: { id: string; name: string } | null = null;
  for (const s of students) {
    if (await verifyBirthdate(birth, s.birthdate_hash)) {
      matched = { id: s.id, name: s.name };
      break;
    }
  }

  if (!matched) {
    await recordAttempt(ip, name, false);
    return NextResponse.json(
      { error: '입력하신 정보와 일치하는 학생을 찾을 수 없습니다. 담당 선생님께 문의해주세요.' },
      { status: 401 },
    );
  }

  const token = await signSession({
    sub: matched.id,
    role: 'student',
    name: matched.name,
  });
  cookies().set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  await recordAttempt(ip, name, true);

  return NextResponse.json({
    ok: true,
    user: { id: matched.id, name: matched.name, role: 'student' },
  });
}
