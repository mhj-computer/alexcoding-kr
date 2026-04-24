import Link from 'next/link';

const KAKAO_URL =
  process.env.NEXT_PUBLIC_KAKAO_OPENCHAT ?? 'https://open.kakao.com/o/s7DlmJri';
const PHONE = process.env.NEXT_PUBLIC_PHONE ?? '010-8637-3734';
const PHONE_TEL = PHONE.replace(/-/g, '');

export function Footer() {
  return (
    <footer className="bg-brand-950 text-white">
      {/* Contact CTA 섹션 */}
      <section className="section-y relative overflow-hidden texture-grain">
        <div className="container-wide relative">
          <div className="max-w-3xl">
            <p className="font-display italic text-accent text-sm tracking-[0.2em] uppercase mb-5">
              Get in touch
            </p>
            <h2 className="font-display text-display-lg text-white mb-4 leading-[1.05]">
              궁금한 점은 언제든{' '}
              <span className="italic text-brand-300">편하게</span> 물어보세요
            </h2>
            <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-xl">
              학생 수준, 목표, 시간대에 맞춰 1:1 상담 후 커리큘럼을 설계해
              드립니다. 카톡이 가장 빠르며, 전화 상담도 환영합니다.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 sm:max-w-2xl">
            <a
              href={KAKAO_URL}
              target="_blank"
              rel="noreferrer"
              className="group relative flex items-center justify-between gap-3 h-[72px] px-6 rounded-2xl bg-[#FEE500] text-[#181600] hover:brightness-95 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <KakaoIcon />
                <div className="text-left">
                  <p className="text-xs font-medium opacity-70">
                    카카오톡 오픈채팅
                  </p>
                  <p className="text-base font-semibold">상담 시작하기</p>
                </div>
              </div>
              <ArrowIcon />
            </a>

            <a
              href={`tel:${PHONE_TEL}`}
              className="group relative flex items-center justify-between gap-3 h-[72px] px-6 rounded-2xl bg-white/5 text-white border border-white/15 hover:bg-white/10 hover:border-white/25 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <PhoneIcon />
                <div className="text-left">
                  <p className="text-xs font-medium text-white/60">전화 문의</p>
                  <p className="text-base font-semibold tabular">{PHONE}</p>
                </div>
              </div>
              <ArrowIcon />
            </a>
          </div>
        </div>
      </section>

      {/* 크레딧 하단 */}
      <div className="border-t border-white/10">
        <div className="container-wide flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-8 text-sm text-white/50">
          <div className="flex items-baseline gap-0.5">
            <span className="font-display text-[17px] text-white">Alex</span>
            <span className="font-display text-[17px] italic text-brand-300">
              coding
            </span>
          </div>
          <p className="tabular">
            © {new Date().getFullYear()} AlexCoding. All rights reserved.
          </p>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/about" className="hover:text-white transition-colors">
              소개
            </Link>
            <Link
              href="/booking"
              className="hover:text-white transition-colors"
            >
              예약
            </Link>
            <Link
              href="/feedback"
              className="hover:text-white transition-colors"
            >
              피드백
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function KakaoIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M14 4C7.925 4 3 7.78 3 12.45c0 3.02 2.04 5.67 5.12 7.18l-1.25 4.57c-.1.36.3.65.62.45l5.43-3.56c.36.03.72.05 1.08.05 6.075 0 11-3.78 11-8.45C25 7.78 20.075 4 14 4z"
        fill="currentColor"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
