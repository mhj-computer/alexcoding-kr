import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { uploadFeedbackImage, UploadError } from '@/lib/feedback/storage';

/**
 * POST /api/admin/upload
 *
 * 관리자가 피드백용 이미지를 업로드.
 * Content-Type: multipart/form-data
 *   - studentId: string (Form 필드)
 *   - file: File (1개)
 *
 * 응답: { url: string }  ← signed URL (image_urls 배열에 누적)
 *
 * 클라이언트는 여러 장이면 병렬로 여러 번 호출.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: '파일을 읽을 수 없습니다.' }, { status: 400 });
  }

  const studentId = form.get('studentId');
  const file = form.get('file');

  if (typeof studentId !== 'string' || !studentId) {
    return NextResponse.json({ error: 'studentId가 필요합니다.' }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: '파일이 필요합니다.' }, { status: 400 });
  }

  try {
    const { signedUrl } = await uploadFeedbackImage(studentId, file);
    return NextResponse.json({ url: signedUrl }, { status: 201 });
  } catch (e) {
    if (e instanceof UploadError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error('[upload]', e);
    return NextResponse.json({ error: '업로드 실패' }, { status: 500 });
  }
}

// 기본 Next.js body parser는 multipart을 처리 못하므로, App Router에선 자동 비활성화.
// 추가 설정 불필요.

export const runtime = 'nodejs'; // Edge가 아닌 Node 런타임 (bcrypt, supabase 등 의존성 있음)
