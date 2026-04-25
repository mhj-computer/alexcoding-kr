import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createFeedbackSchema } from '@/lib/feedback/schema';

/**
 * POST /api/admin/feedback
 *   관리자가 학생에게 피드백 작성.
 *   body: { student_id, content, image_urls[] }
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

  const parsed = createFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? '입력값 오류' },
      { status: 400 },
    );
  }

  const { student_id, content, image_urls } = parsed.data;

  const supabase = getSupabaseAdmin();

  // 학생 존재 확인
  const { data: student, error: stErr } = await supabase
    .from('students')
    .select('id')
    .eq('id', student_id)
    .maybeSingle();

  if (stErr || !student) {
    return NextResponse.json(
      { error: '해당 학생을 찾을 수 없습니다.' },
      { status: 404 },
    );
  }

  const { data, error } = await supabase
    .from('feedbacks')
    .insert({
      student_id,
      content,
      image_urls,
      booking_id: null,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[POST /api/admin/feedback]', error.message);
    return NextResponse.json({ error: '작성 실패' }, { status: 500 });
  }

  return NextResponse.json({ feedback: data }, { status: 201 });
}
