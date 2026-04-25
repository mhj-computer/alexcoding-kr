import Link from 'next/link';
import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { StudentsManager } from '@/components/admin/StudentsManager';

export const metadata: Metadata = {
  title: '학생 관리 (관리자)',
};

export default async function AdminStudentsPage() {
  await requireAdmin();

  const supabase = getSupabaseAdmin();

  // 학생 목록 (가나다순)
  const { data: students } = await supabase
    .from('students')
    .select('id, name, parent_phone, profile_note, created_at')
    .order('name', { ascending: true })
    .returns<
      {
        id: string;
        name: string;
        parent_phone: string;
        profile_note: string | null;
        created_at: string;
      }[]
    >();

  const studentList = students ?? [];

  // 각 학생별 피드백 카운트
  const counts: Record<string, number> = {};
  await Promise.all(
    studentList.map(async (s) => {
      const { count } = await supabase
        .from('feedbacks')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', s.id);
      counts[s.id] = count ?? 0;
    }),
  );

  return (
    <section className="flex-1 bg-paper">
      <div className="container-wide py-10 md:py-14">
        <header className="mb-8 md:mb-10">
          <Link
            href="/admin"
            className="inline-flex items-center text-sm text-ink-soft hover:text-brand-900 mb-3"
          >
            ← 관리자 대시보드
          </Link>
          <p className="font-display italic text-brand-500 text-sm tracking-[0.22em] uppercase mb-2">
            Admin · Students
          </p>
          <h1 className="font-display text-display-md text-brand-900 leading-tight">
            학생 관리
          </h1>
          <p className="mt-2 text-sm text-ink-muted max-w-xl">
            등록된 학생을 관리합니다. 학생을 등록하면 해당 학생은 본인 이름과
            생년월일로 로그인하여 피드백을 조회할 수 있습니다.
          </p>
        </header>

        <StudentsManager initialStudents={studentList} feedbackCounts={counts} />

        <aside className="mt-8 rounded-2xl bg-brand-50 border border-brand-100 p-5 text-sm text-ink-muted leading-relaxed">
          <p className="font-medium text-brand-900 mb-1">학생 등록 안내</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              생년월일 6자리는 학생 로그인 비밀번호로 사용됩니다 (DB에는 bcrypt 해시로
              저장).
            </li>
            <li>
              동명이인이 있을 경우 학부모 전화번호로 구분합니다. 같은 이름·전화번호
              조합은 등록할 수 없습니다.
            </li>
            <li>
              학생 삭제 시 해당 학생의 모든 피드백과 첨부 이미지가 함께 영구 삭제됩니다.
            </li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
