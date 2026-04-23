/**
 * Step 1 임시 메인 페이지.
 * Step 3에서 Hero, MenuCards, Footer 등을 포함한 정식 메인 페이지로 교체된다.
 */
export default function HomePage() {
  return (
    <main className="flex-1 flex items-center justify-center px-5 py-24">
      <div className="max-w-2xl text-center">
        <p className="font-display italic text-brand-500 text-sm tracking-[0.2em] uppercase mb-4">
          Setup Complete
        </p>
        <h1 className="font-display text-display-lg text-brand-900 mb-6">
          프로젝트 기반이 준비됐습니다
        </h1>
        <p className="text-ink-muted leading-relaxed mb-8">
          Next.js 14, Tailwind, Supabase 스키마가 세팅됐습니다. <br />
          다음 단계: <strong className="text-brand-900">인증 모듈</strong>을 구현합니다.
        </p>
        <div className="inline-flex flex-col gap-3 px-6 py-5 rounded-2xl bg-brand-50 border border-brand-100 text-left text-sm">
          <p className="font-medium text-brand-900">확인 체크리스트</p>
          <ul className="space-y-1 text-ink-muted tabular">
            <li>✓ Next.js 개발 서버 정상 동작</li>
            <li>✓ Pretendard / Playfair Display 폰트 로드</li>
            <li>✓ Tailwind 색상 토큰 적용</li>
            <li className="text-ink-soft">→ Supabase 프로젝트 연결 & 마이그레이션 실행 필요</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
