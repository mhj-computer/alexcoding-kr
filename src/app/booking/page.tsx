import type { Metadata } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { PublicScheduleGrid } from '@/components/booking/PublicScheduleGrid';

export const metadata: Metadata = {
  title: '수업 스케줄',
  description:
    'AlexCoding의 정규 수업 스케줄을 확인하세요. 비어있는 시간을 클릭하면 카카오톡 또는 전화로 바로 상담을 시작할 수 있습니다.',
};

// 30초마다 페이지 자체도 재생성
export const revalidate = 30;

const KAKAO_URL =
  process.env.NEXT_PUBLIC_KAKAO_OPENCHAT ?? 'https://open.kakao.com/o/s7DlmJri';

export default async function ScheduleViewPage() {
  // 서버에서 미리 한 번 조회 (SEO + 첫 화면 빠르게)
  const supabase = getSupabaseAdmin();
  const { data: slots } = await supabase
    .from('schedule_slots')
    .select('id, day_of_week, hour, label')
    .order('day_of_week', { ascending: true })
    .order('hour', { ascending: true });

  return (
    <section className="flex-1 bg-paper">
      <div className="container-wide py-10 md:py-14">
        {/* 페이지 헤더 */}
        <header className="mb-10 md:mb-12 max-w-2xl">
          <p className="font-display italic text-brand-500 text-sm tracking-[0.22em] uppercase mb-3">
            Schedule
          </p>
          <h1 className="font-display text-display-md text-brand-900 leading-tight mb-4">
            수업 스케줄
          </h1>
          <p className="text-ink-muted leading-relaxed">
            현재 진행 중인 정규 수업 시간입니다. 비어있는 시간을 클릭하시면{' '}
            <strong className="text-brand-900">카카오톡 오픈채팅</strong>으로
            바로 상담을 시작할 수 있습니다.
          </p>
        </header>

        {/* 안내 박스 — 결제 시스템 준비중 안내 */}
        <aside className="mb-8 rounded-2xl bg-brand-50 border border-brand-100 p-5 md:p-6">
          <p className="text-sm text-brand-900 font-medium mb-2">
            수업 신청 안내
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            현재는 카카오톡 상담을 통해서만 수업 신청이 가능합니다. 학생의 학년,
            희망 커리큘럼, 가능한 시간을 알려주시면 빠르게 답변드립니다.
          </p>
        </aside>

        {/* 스케줄 그리드 */}
        <PublicScheduleGrid initialSlots={slots ?? []} />

        {/* 하단 큰 CTA */}
        <div className="mt-12 md:mt-16 text-center">
          <p className="font-display italic text-brand-500 text-xs tracking-[0.22em] uppercase mb-3">
            Or directly
          </p>
          <h2 className="font-display text-2xl md:text-[28px] text-brand-900 mb-5">
            바로 상담을 원하시나요?
          </h2>
          <a
            href={KAKAO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 h-14 px-7 rounded-xl bg-[#FEE500] text-[#181600] font-semibold hover:brightness-95 active:scale-[0.98] transition-all shadow-card"
          >
            카카오톡 오픈채팅 시작하기
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
