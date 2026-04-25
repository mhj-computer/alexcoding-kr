import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * 서버 전용 Supabase 클라이언트.
 *
 * - service_role 키를 사용하므로 RLS를 우회한다. 절대 클라이언트 번들에 포함되면 안 된다.
 *   이 파일은 'server-only' import로 빌드 시 클라이언트 유입 차단.
 * - API Route Handler와 Server Component에서만 사용.
 *
 * 타입에 대해:
 *   Database 제네릭을 의도적으로 사용하지 않는다.
 *   이유: 우리 수동 타입 정의가 supabase-js의 자동 추론과 미묘하게 충돌해
 *   `update()`/`insert()` 같은 메서드의 인자 타입이 `never`로 추론되는 빌드 에러 발생.
 *
 *   대신 각 호출처에서 .returns<...>() / .maybeSingle<...>() 제네릭으로
 *   조회 결과 타입만 명시. update/insert는 service_role + zod 검증으로 안전성 확보.
 */
import 'server-only';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    'Supabase 환경변수 누락: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 를 .env.local 에 설정하세요.',
  );
}

let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_client) {
    _client = createClient(url!, serviceKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _client;
}