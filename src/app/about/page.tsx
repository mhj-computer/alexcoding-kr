import Link from 'next/link';
import type { Metadata } from 'next';
import { AboutHero } from '@/components/about/AboutHero';
import { CareerTimeline } from '@/components/about/CareerTimeline';
import { CurriculumSection } from '@/components/about/CurriculumSection';
import { ApproachPreview } from '@/components/home/ApproachPreview';

export const metadata: Metadata = {
  title: '강사 소개 & 커리큘럼',
  description:
    '인하대 컴공 졸업, 5,000회 이상의 1:1 코딩 수업 경험. 포트폴리오, 프로그래밍 강화, 게임 제작 3가지 트랙으로 학생 목표에 맞춰 수업을 설계합니다.',
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <ApproachPreview />
      <CareerTimeline />
      <CurriculumSection />

      {/* Bottom CTA */}
      <section className="bg-brand-950 text-white section-y texture-grain">
        <div className="container-wide text-center">
          <p className="font-display italic text-accent text-sm tracking-[0.22em] uppercase mb-5">
            Next step
          </p>
          <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-tight text-white mb-5 max-w-2xl mx-auto">
            학생 목표에 맞는 커리큘럼,
            <br />
            상담 후에 함께 설계합니다
          </h2>
          <p className="text-white/70 leading-relaxed max-w-xl mx-auto mb-8">
            첫 상담은 무료입니다. 카톡 오픈채팅으로 부담 없이 문의하세요.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/booking"
              className="inline-flex items-center justify-center h-14 px-7 rounded-xl bg-white text-brand-900 font-medium hover:bg-brand-50 active:scale-[0.98] transition-all shadow-card"
            >
              수업 스케줄 보기
            </Link>
            <a
              href={
                process.env.NEXT_PUBLIC_KAKAO_OPENCHAT ??
                'https://open.kakao.com/o/s7DlmJri'
              }
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center h-14 px-7 rounded-xl bg-white/10 text-white font-medium border border-white/20 hover:bg-white/15 active:scale-[0.98] transition-all"
            >
              카톡 상담 →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
