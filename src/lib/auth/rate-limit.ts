import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabase/server';

/**
 * 로그인 시도 rate limit.
 *
 * 정책: 같은 (IP, 이름) 조합으로 1분 내 5회 이상 실패 시 차단.
 * 정확성보다 운영 단순성을 우선 — DB 테이블에 기록, 조회.
 * 트래픽이 많아지면 Upstash Redis 같은 전용 스토어로 교체 권장.
 */

const WINDOW_MS = 60 * 1000; // 1분
const MAX_FAILURES = 5;

export interface RateLimitResult {
  allowed: boolean;
  remainingFailures: number;
  retryAfterSec: number;
}

export async function checkRateLimit(ip: string, nameInput: string): Promise<RateLimitResult> {
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('login_attempts')
    .select('success, attempted_at')
    .eq('ip', ip)
    .eq('name_input', nameInput)
    .gte('attempted_at', since)
    .order('attempted_at', { ascending: false })
    .limit(20);

  if (error) {
    // DB 조회 실패 시엔 통과시키는 게 안전 (서비스 마비 방지)
    console.error('[rate-limit] check failed:', error.message);
    return { allowed: true, remainingFailures: MAX_FAILURES, retryAfterSec: 0 };
  }

  const failures = (data ?? []).filter((r) => !r.success).length;

  if (failures >= MAX_FAILURES) {
    const oldest = data!.filter((r) => !r.success).at(-1);
    const oldestMs = oldest ? new Date(oldest.attempted_at).getTime() : Date.now();
    const retryAfterSec = Math.max(1, Math.ceil((oldestMs + WINDOW_MS - Date.now()) / 1000));
    return { allowed: false, remainingFailures: 0, retryAfterSec };
  }

  return {
    allowed: true,
    remainingFailures: MAX_FAILURES - failures,
    retryAfterSec: 0,
  };
}

export async function recordAttempt(ip: string, nameInput: string, success: boolean): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('login_attempts')
    .insert({ ip, name_input: nameInput, success });

  if (error) {
    console.error('[rate-limit] record failed:', error.message);
  }
}

/** 클라이언트 IP 추출 (Vercel Edge 환경 고려) */
export function getClientIp(headers: Headers): string {
  // Vercel: x-forwarded-for 사용
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  const real = headers.get('x-real-ip');
  if (real) return real.trim();
  return '0.0.0.0';
}
