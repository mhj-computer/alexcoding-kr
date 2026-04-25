import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const supabase = getSupabaseAdmin();

  const [studentsRes, scheduleRes] = await Promise.all([
    supabase.from('students').select('id', { count: 'exact', head: true }),
    supabase.from('schedule_slots').select('id', { count: 'exact', head: true }),
  ]);

  const studentCount = studentsRes.count ?? 0;
  const scheduleCount = scheduleRes.count ?? 0;

  return (
    <section className="flex-1 bg-paper">
      <div className="container-wide py-10 md:py-14">
        <header className="mb-10">
          <p className="font-display italic text-brand-500 text-sm tracking-[0.22em] uppercase mb-3">
            Admin
          </p>
          <h1 className="font-display text-display-md text-brand-900 leading-tight mb-2">
            관리자 대시보드
          </h1>
          <p className="text-ink-muted">
            환영합니다,{' '}
            <strong className="text-brand-900 font-medium">{admin.name}</strong>님.
          </p>
        </header>

        {/* 요약 카드 */}
        <div className="grid sm:grid-cols-2 gap-3 mb-10">
          <StatCard eyebrow="Students" label="등록된 학생" value={`${studentCount}명`} />
          <StatCard
            eyebrow="Schedule"
            label="등록된 정규 슬롯"
            value={`${scheduleCount}개`}
            highlight
          />
        </div>

        {/* 기능 진입 */}
        <div className="grid md:grid-cols-2 gap-3 mb-10">
          <AdminActionCard
            href="/admin/schedule"
            eyebrow="Schedule"
            title="스케줄 관리"
            desc="공개 페이지에 표시되는 정규 수업 스케줄을 관리합니다. 학부모 문의 채널의 핵심 정보입니다."
          />
          <AdminActionCard
            href="/admin/feedback"
            eyebrow="Feedback"
            title="피드백 관리"
            desc="학생을 선택해 매 수업 후 피드백을 작성하거나, 기존 피드백을 수정·삭제합니다."
          />
          <AdminActionCard
            href="#"
            eyebrow="Students (준비중)"
            title="학생 관리"
            desc="학생 등록·수정·삭제. 현재는 CLI로 등록하며, Step 6에서 UI로 제공됩니다."
            disabled
          />
        </div>

        {/* CLI 안내 */}
        <aside className="rounded-2xl bg-brand-50 border border-brand-100 p-5">
          <p className="text-sm text-brand-900 font-medium mb-2">학생 등록 방법 (현재)</p>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">
            학생 관리 UI가 완성되기 전까지는 터미널에서 CLI 스크립트로 등록합니다.
          </p>
          <pre className="p-3 rounded-lg bg-white border border-paper-border overflow-x-auto text-xs text-ink">
{`node scripts/add-student.mjs "홍길동" 120331 01012345678 "메모(선택)"`}
          </pre>
        </aside>

        <p className="mt-8 text-center text-sm">
          <Link href="/" className="text-brand-700 hover:text-brand-900">
            ← 메인으로
          </Link>
        </p>
      </div>
    </section>
  );
}

function StatCard({
  eyebrow,
  label,
  value,
  highlight = false,
}: {
  eyebrow: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        'rounded-2xl p-5 md:p-6 border ' +
        (highlight
          ? 'bg-brand-950 text-white border-brand-950'
          : 'bg-white border-paper-border shadow-sm')
      }
    >
      <p
        className={
          'font-display italic text-xs tracking-[0.22em] uppercase mb-3 ' +
          (highlight ? 'text-accent' : 'text-brand-500')
        }
      >
        {eyebrow}
      </p>
      <p
        className={
          'font-display text-[28px] md:text-[32px] leading-none mb-2 tabular ' +
          (highlight ? 'text-white' : 'text-brand-900')
        }
      >
        {value}
      </p>
      <p className={'text-sm ' + (highlight ? 'text-white/70' : 'text-ink-muted')}>
        {label}
      </p>
    </div>
  );
}

function AdminActionCard({
  href,
  eyebrow,
  title,
  desc,
  disabled = false,
}: {
  href: string;
  eyebrow: string;
  title: string;
  desc: string;
  disabled?: boolean;
}) {
  const inner = (
    <div
      className={
        'group relative flex flex-col p-6 md:p-7 rounded-2xl border transition-all min-h-[180px] ' +
        (disabled
          ? 'bg-paper-subtle border-paper-border cursor-not-allowed opacity-60'
          : 'bg-white border-paper-border hover:border-brand-300 shadow-card hover:shadow-card-hover')
      }
    >
      <p className="font-display italic text-brand-500 text-xs tracking-[0.22em] uppercase mb-3">
        {eyebrow}
      </p>
      <h3 className="font-display text-xl md:text-2xl text-brand-900 mb-2">{title}</h3>
      <p className="text-sm text-ink-muted leading-relaxed flex-1">{desc}</p>
      {!disabled && (
        <span className="mt-4 text-sm font-medium text-brand-700 group-hover:text-brand-900">
          바로가기 →
        </span>
      )}
    </div>
  );

  if (disabled) return inner;
  return <Link href={href}>{inner}</Link>;
}
