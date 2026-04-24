import Link from 'next/link';

/**
 * 메인 페이지 Hero.
 * - 거대한 editorial-tech 타이포그래피로 첫인상 확보
 * - 이미지가 부족한 상황이라 타이포 + 여백 + 포인트 색상으로 임팩트
 * - 모바일에서도 slogan의 리듬이 유지되도록 줄바꿈 고정
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden texture-grain mesh-light">
      <div className="container-wide pt-14 pb-20 md:pt-24 md:pb-32 relative">
        {/* 최상단 라벨 */}
        <p
          className="font-display italic text-brand-500 text-sm tracking-[0.28em] uppercase mb-8 animate-fade-in"
          style={{ animationDelay: '0.05s' }}
        >
          1 : 1 · Project-based · With AI
        </p>

        {/* 슬로건 */}
        <h1
          className="font-display text-[clamp(2.25rem,6.5vw,5rem)] leading-[1.02] tracking-[-0.02em] text-brand-900 animate-fade-up"
          style={{ animationDelay: '0.1s' }}
        >
          코딩을{' '}
          <span className="italic text-brand-700/80">‘배우는 것’</span>이
          아닌
          <br />
          <span className="brand-underline">‘만드는 경험’</span>
          으로
        </h1>

        {/* 서브 */}
        <p
          className="mt-8 max-w-2xl text-ink-muted text-base md:text-xl leading-[1.65] animate-fade-up"
          style={{ animationDelay: '0.25s' }}
        >
          AI와 프로젝트 기반으로 실력을 만드는{' '}
          <strong className="text-brand-900 font-medium">
            초·중·고 1:1 맞춤 코딩 수업
          </strong>
          . 학생의 목표에 맞춰 포트폴리오부터 자격증, 대회 준비까지 설계합니다.
        </p>

        {/* CTA */}
        <div
          className="mt-10 flex flex-wrap gap-3 animate-fade-up"
          style={{ animationDelay: '0.4s' }}
        >
          <Link
            href="/about"
            className="inline-flex items-center justify-center h-14 px-7 rounded-xl bg-brand-900 text-white text-[15px] font-medium hover:bg-brand-800 active:scale-[0.98] transition-all shadow-card hover:shadow-card-hover"
          >
            수업 & 커리큘럼 보기
          </Link>
          <Link
            href="/booking"
            className="inline-flex items-center justify-center h-14 px-7 rounded-xl bg-white text-brand-900 text-[15px] font-medium border border-paper-border hover:border-brand-300 hover:bg-brand-50 active:scale-[0.98] transition-all"
          >
            수업 스케줄 보기 →
          </Link>
        </div>

        {/* 우측 상단 장식 - 세로선 + 연도 */}
        <div className="absolute top-14 md:top-24 right-5 sm:right-8 hidden sm:flex flex-col items-end gap-3 text-brand-700/60">
          <span className="font-display italic text-sm tracking-widest">
            est.
          </span>
          <div className="h-20 w-px bg-gradient-to-b from-brand-300 to-transparent" />
          <span className="font-display text-xl tabular">2020</span>
        </div>
      </div>
    </section>
  );
}
