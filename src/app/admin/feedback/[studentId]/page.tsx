import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { AdminStudentFeedback } from '@/components/feedback/AdminStudentFeedback';

export const metadata: Metadata = {
  title: '학생별 피드백 관리',
};

interface Props {
  params: { studentId: string };
}

export default async function AdminStudentFeedbackPage({ params }: Props) {
  await requireAdmin();

  // UUID 형식 1차 검증 (잘못된 URL 즉시 404)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.studentId)) {
    notFound();
  }

  const supabase = getSupabaseAdmin();
  const { data: student } = await supabase
    .from('students')
    .select('id, name, parent_phone, profile_note')
    .eq('id', params.studentId)
    .maybeSingle();

  if (!student) notFound();

  return (
    <section className="flex-1 bg-paper">
      <div className="container-narrow py-10 md:py-14">
        <header className="mb-8 md:mb-10">
          <Link
            href="/admin/feedback"
            className="inline-flex items-center text-sm text-ink-soft hover:text-brand-900 mb-3"
          >
            ← 학생 목록
          </Link>

          <p className="font-display italic text-brand-500 text-sm tracking-[0.22em] uppercase mb-2">
            Feedback for
          </p>
          <h1 className="font-display text-display-md text-brand-900 leading-tight mb-3">
            {student.name}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted tabular">
            <span>학부모 연락처 · {student.parent_phone}</span>
            {student.profile_note && (
              <>
                <span aria-hidden className="text-ink-soft">·</span>
                <span className="font-sans">메모: {student.profile_note}</span>
              </>
            )}
          </div>
        </header>

        <AdminStudentFeedback studentId={student.id} />
      </div>
    </section>
  );
}
