import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { updateStudentSchema } from '@/lib/auth/schema';
import { hashBirthdate } from '@/lib/auth/password';
import { deleteFeedbackImage, extractPathFromUrl } from '@/lib/feedback/storage';

interface Params {
  params: { id: string };
}

async function requireAdminSession() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return null;
  return session;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * PATCH /api/admin/students/[id]
 *   학생 정보 수정. 부분 업데이트.
 *   body: { name?, birthdate?, parent_phone?, profile_note? }
 *   - birthdate가 있으면 bcrypt 재해싱
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });

  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: '잘못된 학생 ID' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청' }, { status: 400 });
  }

  const parsed = updateStudentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? '입력값 오류' },
      { status: 400 },
    );
  }

  const updatePayload: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updatePayload.name = parsed.data.name;
  if (parsed.data.parent_phone !== undefined) updatePayload.parent_phone = parsed.data.parent_phone;
  if (parsed.data.profile_note !== undefined) updatePayload.profile_note = parsed.data.profile_note;
  // birthdate는 해시해서 birthdate_hash 컬럼에 저장
  if (parsed.data.birthdate !== undefined) {
    updatePayload.birthdate_hash = await hashBirthdate(parsed.data.birthdate);
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: '변경할 내용이 없습니다.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('students')
    .update(updatePayload)
    .eq('id', params.id)
    .select('id, name, parent_phone, profile_note, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: '이미 등록된 학생입니다. (이름 + 전화번호 중복)' },
        { status: 409 },
      );
    }
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: '학생을 찾을 수 없습니다.' }, { status: 404 });
    }
    console.error('[PATCH student]', error.message);
    return NextResponse.json({ error: '수정 실패' }, { status: 500 });
  }

  return NextResponse.json({ student: data });
}

/**
 * DELETE /api/admin/students/[id]
 *   학생과 모든 관련 데이터 cascade 삭제.
 *   - feedbacks: students.id 외래키 ON DELETE CASCADE 로 자동 삭제
 *   - bookings: students.id 외래키 ON DELETE CASCADE 로 자동 삭제 (현재 미사용)
 *   - storage: 피드백 이미지 파일은 직접 정리 (orphan 방지)
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });

  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: '잘못된 학생 ID' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // 1. 삭제 전 이 학생의 피드백 이미지 path 수집 (Storage 정리용)
  const { data: feedbacks } = await supabase
    .from('feedbacks')
    .select('image_urls')
    .eq('student_id', params.id)
    .returns<{ image_urls: string[] }[]>();

  const imagePaths: string[] = [];
  for (const fb of feedbacks ?? []) {
    for (const url of fb.image_urls ?? []) {
      const path = extractPathFromUrl(url);
      if (path) imagePaths.push(path);
    }
  }

  // 2. 학생 삭제 (피드백/예약은 cascade로 자동 삭제됨)
  const { error } = await supabase.from('students').delete().eq('id', params.id);

  if (error) {
    console.error('[DELETE student]', error.message);
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  }

  // 3. Storage 이미지 정리 (실패해도 DB 삭제는 이미 완료)
  if (imagePaths.length > 0) {
    Promise.all(imagePaths.map(deleteFeedbackImage)).catch(() => {});
  }

  return NextResponse.json({ ok: true, deletedImages: imagePaths.length });
}
