import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { updateFeedbackSchema } from '@/lib/feedback/schema';
import { deleteFeedbackImage, extractPathFromUrl } from '@/lib/feedback/storage';

interface Params {
  params: { id: string };
}

async function requireAdminSession() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return null;
  return session;
}

/** PATCH /api/admin/feedback/[id] - 내용/이미지 수정 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청' }, { status: 400 });
  }

  const parsed = updateFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? '입력값 오류' },
      { status: 400 },
    );
  }

  const updatePayload: Record<string, unknown> = {};
  if (parsed.data.content !== undefined) updatePayload.content = parsed.data.content;
  if (parsed.data.image_urls !== undefined)
    updatePayload.image_urls = parsed.data.image_urls;

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: '변경할 내용이 없습니다.' }, { status: 400 });
  }

  // 이미지 변경 시: 기존에 있었지만 새 목록에 없는 이미지는 storage에서 삭제
  if (parsed.data.image_urls !== undefined) {
    const supabase = getSupabaseAdmin();
    const { data: prev } = await supabase
      .from('feedbacks')
      .select('image_urls')
      .eq('id', params.id)
      .maybeSingle<{ image_urls: string[] }>();

    if (prev?.image_urls) {
      const newPaths = new Set(
        parsed.data.image_urls.map(extractPathFromUrl).filter(Boolean) as string[],
      );
      const toRemove = prev.image_urls
        .map(extractPathFromUrl)
        .filter((p): p is string => !!p && !newPaths.has(p));

      // 비동기 fire-and-forget (실패해도 응답에 영향 없음)
      Promise.all(toRemove.map(deleteFeedbackImage)).catch(() => {});
    }
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('feedbacks')
    .update(updatePayload)
    .eq('id', params.id)
    .select('*')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: '피드백을 찾을 수 없습니다.' }, { status: 404 });
    }
    console.error('[PATCH feedback]', error.message);
    return NextResponse.json({ error: '변경 실패' }, { status: 500 });
  }

  return NextResponse.json({ feedback: data });
}

/** DELETE /api/admin/feedback/[id] - 피드백 + 첨부 이미지 모두 삭제 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });

  const supabase = getSupabaseAdmin();

  // 첨부 이미지 path 수집
  const { data: feedback } = await supabase
    .from('feedbacks')
    .select('image_urls')
    .eq('id', params.id)
    .maybeSingle<{ image_urls: string[] }>();

  const { error } = await supabase.from('feedbacks').delete().eq('id', params.id);

  if (error) {
    console.error('[DELETE feedback]', error.message);
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  }

  // Storage 정리 (실패해도 DB 삭제는 이미 완료)
  if (feedback?.image_urls?.length) {
    const paths = feedback.image_urls
      .map(extractPathFromUrl)
      .filter((p): p is string => !!p);
    Promise.all(paths.map(deleteFeedbackImage)).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
