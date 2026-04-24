/**
 * 수업 철학을 메인에서 한 번 더 각인시키는 섹션.
 *
 * 좌측: "What we do" 타이포 강조
 * 우측: 두 개의 핵심 문구 카드 (프로젝트 기반 / AI 활용)
 *
 * 컨셉: editorial magazine. 큰 타이포 + 여백 + 점선 구분
 */
export function ApproachPreview() {
  return (
    <section className="section-y bg-white">
      <div className="container-wide">
        <div className="grid md:grid-cols-12 gap-y-10 md:gap-x-12">
          {/* 좌측 타이틀 */}
          <div className="md:col-span-5">
            <p className="font-display italic text-brand-500 text-sm tracking-[0.22em] uppercase mb-5">
              Our approach
            </p>
            <h2 className="font-display text-[clamp(1.8rem,3.8vw,2.75rem)] leading-[1.1] text-brand-900">
              외우는 수업이 아닌,
              <br />
              <span className="italic text-brand-700">만들어 보는</span>{' '}
              수업
            </h2>
            <p className="mt-6 text-ink-muted leading-relaxed text-[15px] md:text-base max-w-md">
              암기 중심의 코딩 교육으로는 실제 문제를 해결할 수 없습니다.
              학생이 실제로 쓸 수 있는 코드를, 자신의 프로젝트로 만드는 수업을
              지향합니다.
            </p>
          </div>

          {/* 우측 두 개 카드 */}
          <div className="md:col-span-7 grid gap-4 sm:grid-cols-2">
            <PhilosophyCard
              eyebrow="Principle 01"
              title="프로젝트 기반"
              desc="매 학기 1개 이상의 실제 프로젝트를 완성합니다. 문제 정의, GitHub 협업, README 작성, 기술 선택 근거까지 모두 경험합니다."
              bullets={[
                'Problem-Solving',
                'Version Control',
                'Documentation',
                'Tech Stack 선택',
              ]}
            />
            <PhilosophyCard
              eyebrow="Principle 02"
              title="AI 적극 활용"
              desc="도구를 외우는 대신, 도구를 쓰는 법을 익힙니다. AI와 함께 사고하고, AI에게 올바르게 질문하고, AI 결과를 검증하는 능력을 키웁니다."
              bullets={[
                '프롬프트 설계',
                '결과 검증',
                'AI 페어 코딩',
                '한계 이해',
              ]}
              variant="dark"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function PhilosophyCard({
  eyebrow,
  title,
  desc,
  bullets,
  variant = 'light',
}: {
  eyebrow: string;
  title: string;
  desc: string;
  bullets: string[];
  variant?: 'light' | 'dark';
}) {
  const isDark = variant === 'dark';
  return (
    <div
      className={
        'relative flex flex-col justify-between p-6 md:p-7 rounded-2xl min-h-[320px] ' +
        (isDark
          ? 'bg-brand-950 text-white'
          : 'bg-paper-subtle border border-paper-border text-ink')
      }
    >
      <div>
        <p
          className={
            'font-display italic text-xs tracking-[0.22em] uppercase mb-4 ' +
            (isDark ? 'text-accent' : 'text-brand-500')
          }
        >
          {eyebrow}
        </p>
        <h3
          className={
            'font-display text-[22px] md:text-2xl leading-tight mb-3 ' +
            (isDark ? 'text-white' : 'text-brand-900')
          }
        >
          {title}
        </h3>
        <p
          className={
            'text-sm leading-relaxed ' +
            (isDark ? 'text-white/70' : 'text-ink-muted')
          }
        >
          {desc}
        </p>
      </div>

      <ul
        className={
          'mt-6 pt-4 grid grid-cols-2 gap-y-2 text-xs border-t ' +
          (isDark
            ? 'border-white/10 text-white/80'
            : 'border-paper-border text-ink-muted')
        }
      >
        {bullets.map((b) => (
          <li key={b} className="flex items-center gap-1.5">
            <span
              className={
                'h-1 w-1 rounded-full shrink-0 ' +
                (isDark ? 'bg-accent' : 'bg-brand-500')
              }
            />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
