import Image from 'next/image';

/**
 * About 페이지 Hero.
 * 좌측: 강사 프로필 사진 (유일한 이미지 리소스)
 * 우측: 브랜드명 + 태그라인 + 소개 문단
 *
 * 디자인 의도: 사진 한 장을 아주 "크고 당당하게" 배치해서 신뢰감. 조정된 비율로 세로 초상.
 */
export function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-paper mesh-light texture-grain">
      <div className="container-wide py-14 md:py-20">
        <div className="grid md:grid-cols-12 gap-y-10 md:gap-x-12 items-center">
          {/* 프로필 사진 */}
          <div className="md:col-span-5 relative">
            <div className="relative aspect-[4/5] max-w-sm md:max-w-none mx-auto overflow-hidden rounded-2xl bg-brand-900">
              <Image
                src="/images/instructor.jpg"
                alt="AlexCoding 강사 프로필"
                fill
                priority
                sizes="(max-width: 768px) 85vw, 40vw"
                className="object-cover"
              />
              {/* 미세한 하단 그라데이션 */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-950/60 to-transparent pointer-events-none" />

              {/* 좌하단 캡션 */}
              <div className="absolute left-4 bottom-4 md:left-5 md:bottom-5 text-white">
                <p className="font-display italic text-xs tracking-[0.2em] uppercase text-accent mb-1">
                  Instructor
                </p>
                <p className="text-base md:text-lg font-medium">Alex</p>
              </div>
            </div>

            {/* 우상단 작은 배지 */}
            <div className="hidden md:flex absolute -top-3 -right-3 px-4 py-2 rounded-full bg-brand-900 text-white text-xs font-medium shadow-card">
              <span className="tracking-wider">since 2020</span>
            </div>
          </div>

          {/* 텍스트 */}
          <div className="md:col-span-7">
            <p className="font-display italic text-brand-500 text-sm tracking-[0.28em] uppercase mb-6">
              About · 강사 소개
            </p>
            <h1 className="font-display text-[clamp(1.9rem,4.6vw,3.25rem)] leading-[1.1] text-brand-900 mb-6">
              <span className="italic text-brand-700 tabular">5,000회</span>의
              수업,
              <br />
              그 뒤에 남은 것은
              <br className="sm:hidden" />{' '}
              <span className="brand-underline">학생들의 성장</span>입니다
            </h1>
            <div className="space-y-4 text-ink-muted text-[15px] md:text-base leading-relaxed max-w-xl">
              <p>
                인하대학교 컴퓨터공학과에서 학위를 마치고, 프론트엔드·백엔드
                개발과 서버 관리, 기업 보안 자문까지 현업의 다양한 영역에서
                실무를 쌓았습니다.
              </p>
              <p>
                그 경험을 바탕으로 2022년부터 1:1 코딩 수업을 시작해, 지금까지{' '}
                <strong className="text-brand-900 font-medium">
                  5,000회가 넘는 수업
                </strong>
                을 진행해 왔습니다. 초등학생부터 고등학생까지, 각 학생의 이해
                속도와 목표에 맞춰 커리큘럼을 설계합니다.
              </p>
              <p>
                현재는 교육 현장에서 프로그래밍을 가르치며, 교재 집필도 함께
                하고 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
