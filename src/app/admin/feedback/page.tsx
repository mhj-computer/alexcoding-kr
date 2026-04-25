import Link from 'next/link';
import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: '피드백 관리 (관리자)',
};

export default async function AdminFeedbackListPage() {
  await requireAdmin();

  const supabase = getSupabaseAdmin();

  // 학생 목록 + 각 학생별 피드백 수
  const { data: students } = await supabase
    .from('students')
    .select('id, name, parent_phone')
    .order('name', { ascending: true })
    .returns<{ id: string; name: string; parent_phone: string }[]>();

  const studentList = students ?? [];

  // 피드백 카운트는 별도 쿼리 (학생 수가 많지 않다는 가정)
  const counts = await Promise.all(
    studentList.map(async (s) => {
      const { count } = await supabase
        .from('feedbacks')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', s.id);
      return { id: s.id, count: count ?? 0 };
    }),
  );
  const countMap = new Map(counts.map((c) => [c.id, c.count]));

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
            Admin · Feedback
          </p>
          <h1 className="font-display text-display-md text-brand-900 leading-tight">
            피드백 관리
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            학생을 선택해 피드백을 작성하거나 기존 피드백을 관리합니다.
          </p>
        </header>

        {studentList.length === 0 ? (
          <div className="rounded-2xl bg-brand-50 border border-brand-100 p-6">
            <p className="text-sm text-brand-900 font-medium mb-2">
              등록된 학생이 없습니다
            </p>
            <p className="text-sm text-ink-muted leading-relaxed mb-3">
              피드백을 작성하려면 먼저 학생을 등록해야 합니다.
            </p>
            <pre className="p-3 rounded-lg bg-white border border-paper-border overflow-x-auto text-xs text-ink">
{`node scripts/add-student.mjs "홍길동" 120331 01012345678 "메모(선택)"`}
            </pre>
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {studentList.map((s) => {
              const count = countMap.get(s.id) ?? 0;
              return (
                <li key={s.id}>
                  <Link
                    href={`/admin/feedback/${s.id}`}
                    className="group flex items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-paper-border shadow-sm hover:shadow-card hover:border-brand-300 transition-all"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-lg text-brand-900 leading-tight truncate">
                        {s.name}
                      </p>
                      <p className="mt-1 text-xs text-ink-soft tabular">
                        {s.parent_phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="font-display text-lg text-brand-900 tabular leading-none">
                          {count}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-ink-soft mt-0.5">
                          건
                        </p>
                      </div>
                      <span
                        aria-hidden
                        className="text-ink-soft group-hover:text-brand-700 group-hover:translate-x-0.5 transition-all"
                      >
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
