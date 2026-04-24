const STATS = [
  { value: '5,000+', label: '누적 수업 횟수' },
  { value: '6년', label: '코딩 교육 경력' },
  { value: '3→1', label: '내신 등급 향상' },
  { value: '30+', label: '기업 의뢰 프로젝트' },
];

/**
 * 경력을 숫자로 빠르게 각인시키는 섹션.
 * 딥네이비 배경으로 Hero와 아래 섹션 사이에 시각적 리듬 삽입.
 */
export function TrustStrip() {
  return (
    <section className="bg-brand-950 text-white relative overflow-hidden texture-grain">
      <div className="container-wide py-12 md:py-16">
        <p className="font-display italic text-accent text-sm tracking-[0.25em] uppercase mb-8 text-center">
          By the numbers
        </p>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center text-center"
            >
              <dt className="font-display text-[clamp(2rem,5vw,3.25rem)] leading-none text-white tabular">
                {s.value}
              </dt>
              <dd className="mt-3 text-sm md:text-base text-white/60">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
