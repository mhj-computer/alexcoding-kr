import Link from 'next/link';

/**
 * 메인 페이지의 3개 주요 메뉴 (사양상 필수).
 *
 *  1. 강사 소개 & 커리큘럼 → /about
 *  2. 수업 스케줄          → /booking
 *  3. 학생 피드백          → /feedback
 *
 * 큰 카드형 링크 + 아이콘 + 설명. 부모님이 시력 문제 없이 터치할 수 있는 크기.
 */
const MENU = [
  {
    href: '/about',
    eyebrow: '01',
    title: '강사 소개 & 커리큘럼',
    desc: '경력, 수업 철학, 커리큘럼 3종을 상세히 소개합니다.',
    icon: IconBook,
  },
  {
    href: '/booking',
    eyebrow: '02',
    title: '수업 스케줄',
    desc: '진행 중인 정규 수업 시간을 확인하고, 빈 시간에 카톡 상담을 시작하세요.',
    icon: IconCalendar,
  },
  {
    href: '/feedback',
    eyebrow: '03',
    title: '학생 피드백',
    desc: '매 수업 이후 학생별 맞춤 피드백을 확인할 수 있습니다.',
    icon: IconChat,
  },
] as const;

export function MenuCards() {
  return (
    <section className="section-y bg-paper">
      <div className="container-wide">
        <div className="mb-12 max-w-2xl">
          <p className="font-display italic text-brand-500 text-sm tracking-[0.22em] uppercase mb-4">
            Quick menu
          </p>
          <h2 className="font-display text-display-md text-brand-900 leading-[1.15]">
            무엇을 찾고 계신가요?
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {MENU.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col justify-between min-h-[220px] md:min-h-[260px] p-6 md:p-7 rounded-2xl bg-white border border-paper-border hover:border-brand-300 shadow-card hover:shadow-card-hover transition-all"
              >
                {/* 상단 번호 + 아이콘 */}
                <div className="flex items-start justify-between">
                  <span className="font-display italic text-sm text-brand-500 tracking-widest">
                    {item.eyebrow}
                  </span>
                  <div className="h-11 w-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center group-hover:bg-brand-900 group-hover:text-white transition-colors">
                    <Icon />
                  </div>
                </div>

                {/* 하단 타이틀 + 설명 */}
                <div>
                  <h3 className="font-display text-[22px] md:text-2xl text-brand-900 mb-2 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    {item.desc}
                  </p>
                  <span className="mt-4 inline-flex items-center text-sm font-medium text-brand-700 group-hover:text-brand-900">
                    바로가기
                    <span
                      aria-hidden
                      className="ml-1 transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function IconBook() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
