import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

/**
 * GET /api/schedule
 *
 * 공개 API. 인증 불필요.
 * 정규 수업 스케줄 전체를 반환.
 *
 * 응답 형식:
 *   { slots: [{ id, day_of_week, hour, label }, ...] }
 */
export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('schedule_slots')
    .select('id, day_of_week, hour, label')
    .order('day_of_week', { ascending: true })
    .order('hour', { ascending: true });

  if (error) {
    console.error('[GET /api/schedule]', error.message);
    return NextResponse.json({ error: '스케줄을 불러오지 못했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ slots: data ?? [] }, {
    headers: {
      // 짧은 캐싱으로 트래픽 분산 (60초)
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
