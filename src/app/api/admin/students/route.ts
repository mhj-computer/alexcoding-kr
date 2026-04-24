import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createStudentSchema } from '@/lib/auth/schema';
import { hashBirthdate } from '@/lib/auth/password';
import { getSupabaseAdmin } from '@/lib/supabase/server';

/**
 * 관리자 전용 학생 관리 API.
 *
 *   GET  /api/admin/students        : 전체 학생 목록 (가나다순)
 *   POST /api/admin/students        : 새 학생 등록
 *
 * 학생 수정/삭제는 /api/admin/students/[id] 에서 (Step 6에서 추가).
 */

async function ensureAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return null;
  }
  return session;
}

export async function GET() {
  const admin = await ensureAdmin();
  if (!admin) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('students')
    .select('id, name, parent_phone, profile_note, created_at')
    .order('name', { ascending: true });

  if (error) {
    console.error('[admin/students GET]', error.message);
    return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  }

  return NextResponse.json({ students: data ?? [] });
}

export async function POST(req: NextRequest) {
  const admin = await ensureAdmin();
  if (!admin) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청' }, { status: 400 });
  }

  const parsed = createStudentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? '입력값 오류' },
      { status: 400 },
    );
  }

  const { name, birthdate, parent_phone, profile_note } = parsed.data;
  const birthdate_hash = await hashBirthdate(birthdate);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('students')
    .insert({
      name,
      birthdate_hash,
      parent_phone,
      profile_note: profile_note ?? null,
    })
    .select('id, name, parent_phone, profile_note, created_at')
    .single();

  if (error) {
    // UNIQUE 위반 (동명이인+같은 전화번호)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: '이미 등록된 학생입니다. (이름 + 전화번호 중복)' },
        { status: 409 },
      );
    }
    console.error('[admin/students POST]', error.message);
    return NextResponse.json({ error: '등록 실패' }, { status: 500 });
  }

  return NextResponse.json({ student: data }, { status: 201 });
}
