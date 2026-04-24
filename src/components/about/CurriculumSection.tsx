/**
 * 커리큘럼 3종 상세.
 * 사양의 내용을 모두 포함:
 *  - 포트폴리오 수업 (4단계: Problem-Solving, Version Control, Documentation, Tech Stack)
 *  - 프로그래밍 강화 (파이썬 입문 → 자격증 → 대회)
 *  - 게임 제작 (Unity/Roblox)
 */

interface Curriculum {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  goals: string[];
  stages: string[];
  highlights: string[];
}

const CURRICULA: Curriculum[] = [
  {
    id: 'portfolio',
    eyebrow: 'Track 01',
    title: '포트폴리오 수업',
    summary:
      'AI와 함께 자신만의 프로젝트를 기획부터 배포까지 완성합니다. 수업이 끝났을 때, 실제 작동하는 결과물과 GitHub 저장소가 남습니다.',
    goals: ['실제 동작하는 프로젝트 완성', 'GitHub 협업 경험'],
    stages: [
      'Problem-Solving — 해결할 문제 정의',
      'Version Control — GitHub 브랜치·커밋 전략',
      'Documentation — README 작성과 설명 능력',
      'Tech Stack — 기술 선택 이유 설명',
    ],
    highlights: [
      'AI 기반 프로젝트 제작',
      '실제 배포 경험',
      '면접·수시 전형 포트폴리오',
    ],
  },
  {
    id: 'programming',
    eyebrow: 'Track 02',
    title: '프로그래밍 강화 수업',
    summary:
      '목표가 명확한 학생에게 적합합니다. 자격증, 내신, 대회까지 각자의 트랙에 맞춰 Python 기초부터 심화 알고리즘까지 체계적으로 단계를 밟습니다.',
    goals: ['자격증 합격 (COS Pro 등)', '대회 수상 / 내신 등급 향상'],
    stages: [
      '파이썬 입문',
      '파이썬 중급',
      '파이썬 심화',
      '자격증 대비 (COS Pro)',
      '언어 선택 (C or Python)',
      '대회 준비 (정보올림피아드 등)',
    ],
    highlights: [
      '알고리즘·자료구조 심화',
      '기출 문제 전략',
      '내신 3→1등급 지도 사례',
    ],
  },
  {
    id: 'game',
    eyebrow: 'Track 03',
    title: '게임 제작 수업',
    summary:
      '코딩에 흥미가 없거나 처음인 학생에게 권장합니다. Unity 또는 Roblox를 활용해 결과물이 화면에서 바로 보이는 학습으로, 벡터·좌표 같은 수학 개념까지 자연스럽게 익힙니다.',
    goals: ['플레이 가능한 게임 완성', '수학적 사고 확장'],
    stages: [
      'Unity 또는 Roblox 중 선택',
      '기본 물체와 씬 구성',
      '벡터·좌표 시스템 이해',
      '스크립트로 상호작용 구현',
      '게임 로직 · UI 완성',
    ],
    highlights: [
      '결과가 바로 보이는 학습',
      '수학 개념 자연스럽게 적용',
      '학생 몰입도 높음',
    ],
  },
];

export function CurriculumSection() {
  return (
    <section id="curriculum" className="section-y bg-paper-subtle">
      <div className="container-wide">
        <div className="mb-14 max-w-2xl">
          <p className="font-display italic text-brand-500 text-sm tracking-[0.22em] uppercase mb-4">
            Curriculum · 커리큘럼
          </p>
          <h2 className="font-display text-display-md text-brand-900 leading-tight mb-5">
            학생의 목표에 맞춰
            <br />
            <span className="italic text-brand-700">3가지 트랙</span> 중
            설계합니다
          </h2>
          <p className="text-ink-muted leading-relaxed">
            입시·자격증·취미 등 목적에 따라 커리큘럼을 조합합니다. 수업 시작
            전 상담을 통해 학생에게 가장 적합한 트랙을 제안드립니다.
          </p>
        </div>

        <div className="space-y-5">
          {CURRICULA.map((c) => (
            <CurriculumCard key={c.id} data={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CurriculumCard({ data }: { data: Curriculum }) {
  return (
    <article className="group relative bg-white border border-paper-border rounded-2xl p-6 md:p-8 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="grid md:grid-cols-12 gap-6 md:gap-8">
        {/* 좌측 요약 */}
        <div className="md:col-span-5">
          <p className="font-display italic text-brand-500 text-xs tracking-[0.25em] uppercase mb-3">
            {data.eyebrow}
          </p>
          <h3 className="font-display text-2xl md:text-[28px] text-brand-900 leading-tight mb-4">
            {data.title}
          </h3>
          <p className="text-[14.5px] md:text-[15px] text-ink-muted leading-relaxed mb-5">
            {data.summary}
          </p>
          <div className="space-y-2">
            <p className="text-xs font-medium text-ink-soft tracking-wide uppercase">
              수업 목표
            </p>
            <ul className="space-y-1.5">
              {data.goals.map((g) => (
                <li
                  key={g}
                  className="flex items-start gap-2 text-sm text-brand-900"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 h-1 w-1 rounded-full bg-accent shrink-0"
                  />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 우측 상세 - 단계 + 하이라이트 */}
        <div className="md:col-span-7 md:border-l md:border-paper-border md:pl-8">
          <p className="text-xs font-medium text-ink-soft tracking-wide uppercase mb-3">
            단계 구성
          </p>
          <ol className="space-y-2 mb-6">
            {data.stages.map((s, i) => (
              <li
                key={s}
                className="flex items-start gap-3 text-[14px] md:text-[15px] text-ink"
              >
                <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-brand-50 text-brand-700 text-[11px] font-medium tabular flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>

          <p className="text-xs font-medium text-ink-soft tracking-wide uppercase mb-3">
            특징
          </p>
          <ul className="flex flex-wrap gap-2">
            {data.highlights.map((h) => (
              <li
                key={h}
                className="text-xs md:text-[13px] px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100"
              >
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
