import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { fetchStudentFeedbacks } from '@/lib/feedback/queries';

/**
 * GET /api/feedback?studentId=...
 *
 * - 학생: studentId 무시. 본인 것만 반환.
 * - 관리자: studentId 필수. 해당 학생 피드백 반환.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  let targetStudentId: string;

  if (session.role === 'admin') {
    const sid = req.nextUrl.searchParams.get('studentId');
    if (!sid) {
      return NextResponse.json(
        { error: '관리자는 studentId 파라미터가 필요합니다.' },
        { status: 400 },
      );
    }
    targetStudentId = sid;
  } else {
    targetStudentId = session.sub;
  }

  const feedbacks = await fetchStudentFeedbacks(targetStudentId);
  return NextResponse.json({ feedbacks });
}
