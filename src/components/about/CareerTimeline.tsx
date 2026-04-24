/**
 * 경력 타임라인.
 *
 * 사양의 12개 항목을 연도 기반 타임라인으로 재구성.
 * 왼쪽에 큰 년도(디스플레이 폰트), 오른쪽에 설명. 세로 선으로 연결.
 */

interface CareerItem {
  year: string;
  period?: string; // "2020~2021" 같은 기간
  title: string;
  desc?: string;
}

const CAREER: CareerItem[] = [
  {
    year: '2020',
    period: '2020~2021',
    title: '프론트엔드·백엔드 관리 업무',
    desc: '실제 서비스 운영 환경에서 전반적인 웹 스택 경험',
  },
  {
    year: '2021',
    period: '2021~2023',
    title: '시스템엔지니어 / 서버 관리',
    desc: '리눅스 서버 운영, 모니터링, 장애 대응 실무',
  },
  {
    year: '2021',
    period: '2021~',
    title: '기업 의뢰 모의해킹 30건 이상',
    desc: '웹 취약점 진단, 보안 리포트 작성 경험 누적',
  },
  {
    year: '2022',
    period: '2022~',
    title: '코딩 교육 플랫폼 / 과외 수업 5,000회+',
    desc: '초·중·고 학생 1:1 수업 방법론 축적',
  },
  {
    year: '2023',
    period: '2023~',
    title: '중·고등학교 정보 특강',
    desc: '학교 현장 강연으로 다수 학생 지도',
  },
  {
    year: '2023',
    period: '2023~',
    title: '내신 3등급 → 1등급 향상 지도 사례',
    desc: '정보 과목 내신 관리의 체계적 접근',
  },
  {
    year: '2024',
    period: '2024~',
    title: '정보올림피아드 수상자 다수 지도',
    desc: '알고리즘·자료구조 심화 지도',
  },
  {
    year: '2024',
    period: '2024~',
    title: 'COS Pro 고득점 합격 지도',
    desc: '자격증 합격률 관리 및 출제 경향 분석',
  },
  {
    year: '2024',
    period: '2024~',
    title: 'AI 기초 및 실습 특강',
    desc: 'AI 도구 활용법과 실전 프로젝트 연계',
  },
  {
    year: '2025',
    period: '2025~',
    title: '안랩샘 아카데미 파이썬 강사',
    desc: '기업 교육 플랫폼 정규 강사 활동',
  },
  {
    year: '2025',
    period: '2025~',
    title: '파이썬 교안 제작',
    desc: '교재 집필 및 커리큘럼 설계',
  },
];

// 인하대 학력은 별도 섹션으로
const EDUCATION = {
  school: '인하대학교',
  major: '컴퓨터공학과 전공',
};

export function CareerTimeline() {
  return (
    <section className="section-y bg-white">
      <div className="container-wide">
        <div className="mb-14 md:mb-16">
          <p className="font-display italic text-brand-500 text-sm tracking-[0.22em] uppercase mb-4">
            Career · 주요 경력
          </p>
          <h2 className="font-display text-display-md text-brand-900 leading-tight">
            2020년부터 쌓아온
            <br />
            <span className="italic text-brand-700">교육과 실무</span>의 궤적
          </h2>
        </div>

        {/* 학력 카드 */}
        <div className="mb-10 md:mb-14 inline-flex items-center gap-5 px-6 py-4 rounded-2xl bg-brand-50 border border-brand-100">
          <div className="font-display text-2xl text-brand-900 tabular">
            학력
          </div>
          <div className="h-8 w-px bg-brand-200" />
          <div>
            <p className="text-sm text-ink-muted">{EDUCATION.school}</p>
            <p className="text-base font-medium text-brand-900">
              {EDUCATION.major}
            </p>
          </div>
        </div>

        {/* 타임라인 */}
        <ol className="relative border-l border-paper-border pl-6 md:pl-10 space-y-8 md:space-y-10">
          {CAREER.map((item, i) => (
            <li key={`${item.year}-${item.title}`} className="relative">
              {/* 원형 마커 */}
              <span
                aria-hidden
                className="absolute -left-[31px] md:-left-[47px] top-2 flex items-center justify-center h-3 w-3 rounded-full bg-white border-2 border-brand-500"
              />

              <div className="flex flex-col md:flex-row md:gap-8">
                <div className="md:w-32 shrink-0 mb-2 md:mb-0">
                  <p className="font-display text-2xl md:text-3xl text-brand-900 tabular leading-none">
                    {item.year}
                  </p>
                  {item.period && item.period !== item.year && (
                    <p className="mt-1 text-xs text-ink-soft tabular">
                      {item.period}
                    </p>
                  )}
                </div>
                <div className="flex-1 md:pt-1">
                  <h3 className="text-[17px] md:text-lg font-medium text-brand-900 leading-snug">
                    {item.title}
                  </h3>
                  {item.desc && (
                    <p className="mt-1.5 text-[14px] md:text-[15px] text-ink-muted leading-relaxed">
                      {item.desc}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
