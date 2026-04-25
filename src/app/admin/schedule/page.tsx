import Link from 'next/link';
import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { AdminScheduleGrid } from '@/components/booking/AdminScheduleGrid';

export const metadata: Metadata = {
  title: '스케줄 관리 (관리자)',
};

export default async function AdminSchedulePage() {
  await requireAdmin();

  const supabase = getSupabaseAdmin();
  const { data: slots } = await supabase
    .from('schedule_slots')
    .select('id, day_of_week, hour, label')
    .order('day_of_week', { ascending: true })
    .order('hour', { ascending: true })
    .returns<{ id: string; day_of_week: number; hour: number; label: string | null }[]>();

  return (
    <section className="flex-1 bg-paper">
      <div className="container-wide py-10 md:py-14">
        <header className="mb-8 md:mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center text-sm text-ink-soft hover:text-brand-900 mb-3"
            >
              ← 관리자 대시보드
            </Link>
            <p className="font-display italic text-brand-500 text-sm tracking-[0.22em] uppercase mb-2">
              Admin · Schedule
            </p>
            <h1 className="font-display text-display-md text-brand-900 leading-tight">
              스케줄 관리
            </h1>
            <p className="mt-2 text-sm text-ink-muted max-w-xl">
              빈 슬롯을 클릭해 정규 수업 시간을 등록하세요. 등록된 슬롯은
              공개 스케줄 페이지에 ‘예약됨’으로 표시됩니다.
            </p>
          </div>
          <Link
            href="/booking"
            target="_blank"
            className="text-sm text-brand-700 hover:text-brand-900 underline-offset-4 hover:underline"
          >
            공개 페이지 미리보기 →
          </Link>
        </header>

        <AdminScheduleGrid initialSlots={slots ?? []} />

        <aside className="mt-8 rounded-2xl bg-brand-50 border border-brand-100 p-5 text-sm text-ink-muted leading-relaxed">
          <p className="font-medium text-brand-900 mb-1">라벨 사용 가이드</p>
          <ul className="list-disc list-inside space-y-1">
            <li>학생 이름·학교명 등 개인정보는 입력하지 마세요.</li>
            <li>좋은 예: <code className="text-brand-700">중등 자바</code>, <code className="text-brand-700">고등 파이썬</code>, <code className="text-brand-700">정올 대비</code></li>
            <li>라벨 없이 ‘예약됨’ 만 표시도 가능합니다.</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
