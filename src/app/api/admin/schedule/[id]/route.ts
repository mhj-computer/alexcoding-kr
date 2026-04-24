import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { updateScheduleSlotSchema } from '@/lib/booking/schedule';

interface Params {
  params: { id: string };
}

async function requireAdminSession() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return null;
  return session;
}

/** PATCH /api/admin/schedule/[id] - 라벨 수정만 (요일/시간 변경은 삭제 후 재추가) */
export async function PATCH(req: NextRequest, { params }: Params) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청' }, { status: 400 });
  }

  const parsed = updateScheduleSlotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? '입력값 오류' },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('schedule_slots')
    .update({ label: parsed.data.label ?? null })
    .eq('id', params.id)
    .select('*')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: '슬롯을 찾을 수 없습니다.' }, { status: 404 });
    }
    console.error('[PATCH schedule]', error.message);
    return NextResponse.json({ error: '변경 실패' }, { status: 500 });
  }

  return NextResponse.json({ slot: data });
}

/** DELETE /api/admin/schedule/[id] */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('schedule_slots').delete().eq('id', params.id);

  if (error) {
    console.error('[DELETE schedule]', error.message);
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
