import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { scheduleSlotSchema, isValidDayHour } from '@/lib/booking/schedule';

/**
 * POST /api/admin/schedule
 *   관리자가 정규 슬롯 추가.
 *   body: { day_of_week, hour, label? }
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청' }, { status: 400 });
  }

  const parsed = scheduleSlotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? '입력값 오류' },
      { status: 400 },
    );
  }

  const { day_of_week, hour, label } = parsed.data;

  if (!isValidDayHour(day_of_week, hour)) {
    return NextResponse.json(
      { error: '해당 요일·시간은 허용되지 않습니다.' },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('schedule_slots')
    .insert({
      day_of_week,
      hour,
      label: label || null,
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: '이미 등록된 시간입니다.' },
        { status: 409 },
      );
    }
    console.error('[POST /api/admin/schedule]', error.message);
    return NextResponse.json({ error: '추가 실패' }, { status: 500 });
  }

  return NextResponse.json({ slot: data }, { status: 201 });
}
