import Link from 'next/link';
import type { Metadata } from 'next';
import { requireAuth } from '@/lib/auth/session';
import { fetchStudentFeedbacks } from '@/lib/feedback/queries';
import { FeedbackCard } from '@/components/feedback/FeedbackCard';
import { parentTitle } from '@/lib/utils';

export const metadata: Metadata = {
  title: '학생 피드백',
};

export default async function FeedbackPage() {
  const session = await requireAuth('/feedback');

  // 관리자는 학생 리스트 페이지로 유도
  if (session.role === 'admin') {
    return (
      <section className="flex-1 flex items-center justify-center px-5 py-20">
        <div className="max-w-md text-center">
          <p className="font-display italic text-brand-500 text-sm tracking-[0.22em] uppercase mb-3">
            관리자 안내
          </p>
          <h1 className="font-display text-2xl text-brand-900 mb-4">
            관리자 피드백 페이지
          </h1>
          <p className="text-ink-muted leading-relaxed mb-6">
            학생 목록에서 원하는 학생을 선택해 피드백을 작성하거나 확인하세요.
          </p>
          <Link
            href="/admin/feedback"
            className="inline-flex items-center h-12 px-6 rounded-xl bg-brand-900 text-white font-medium hover:bg-brand-800"
          >
            학생 목록으로 →
          </Link>
        </div>
      </section>
    );
  }

  const feedbacks = await fetchStudentFeedbacks(session.sub);

  return (
    <section className="flex-1 bg-paper">
      <div className="container-narrow py-10 md:py-14">
        <header className="mb-10 md:mb-12">
          <p className="font-display italic text-brand-500 text-sm tracking-[0.22em] uppercase mb-3">
            Feedback
          </p>
          <h1 className="font-display text-display-md text-brand-900 leading-tight mb-3">
            학생 피드백
          </h1>
          <p className="text-ink-muted">
            <strong className="text-brand-900 font-medium">
              {parentTitle(session.name)}
            </strong>{' '}
            — 강사가 매 수업 후에 작성한 피드백을 확인하실 수 있습니다.
          </p>
        </header>

        {feedbacks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-ink-soft tabular">
              총 <strong className="text-brand-900">{feedbacks.length}</strong>건 ·
              최신순
            </p>
            {feedbacks.map((f) => (
              <FeedbackCard key={f.id} feedback={f} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-paper-border bg-white p-12 text-center">
      <p className="font-display italic text-brand-500 text-xs tracking-[0.22em] uppercase mb-3">
        Empty
      </p>
      <h2 className="font-display text-xl text-brand-900 mb-3">
        아직 등록된 피드백이 없습니다
      </h2>
      <p className="text-sm text-ink-muted leading-relaxed max-w-sm mx-auto">
        수업이 진행된 후에 강사가 피드백을 작성하면 이곳에 순서대로 표시됩니다.
      </p>
    </div>
  );
}
