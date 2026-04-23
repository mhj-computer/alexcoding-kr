import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * 서버 전용 Supabase 클라이언트.
 *
 * - service_role 키를 사용하므로 RLS를 우회한다. 절대 클라이언트 번들에 포함되면 안 된다.
 *   이 파일은 'server-only' import로 빌드 시 클라이언트 유입 차단.
 * - API Route Handler와 Server Component에서만 사용.
 */
import 'server-only';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    'Supabase 환경변수 누락: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 를 .env.local 에 설정하세요.',
  );
}

let _client: SupabaseClient<Database> | null = null;

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!_client) {
    _client = createClient<Database>(url!, serviceKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _client;
}
