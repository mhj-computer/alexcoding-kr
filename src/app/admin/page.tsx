import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { logoutAction } from '../actions/auth';

/**
 * 임시 관리자 페이지. Step 6에서 정식 대시보드로 교체된다.
 * 현재는 로그인 확인 + 등록된 학생 수만 표시.
 */
export default async function AdminTempPage() {
  const admin = await requireAdmin();

  const supabase = getSupabaseAdmin();
  const { count } = await supabase
    .from('students')
    .select('id', { count: 'exact', head: true });

  return (
    <section className="flex-1 px-5 py-16 md:py-24 mesh-light">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="font-display italic text-brand-500 text-sm tracking-[0.2em] uppercase mb-2">
              Admin
            </p>
            <h1 className="font-display text-display-md text-brand-900">
              관리자 대시보드
            </h1>
          </div>
          <form action={logoutAction}>
            <button className="h-10 px-4 rounded-lg border border-paper-border text-sm text-ink-muted hover:bg-paper-subtle">
              로그아웃
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-paper-border shadow-card p-6 md:p-8 space-y-6">
          <div>
            <p className="text-sm text-ink-soft mb-1">환영합니다</p>
            <p className="text-lg font-medium text-brand-900">{admin.name}님</p>
          </div>

          <hr className="border-paper-border" />

          <div>
            <p className="text-sm text-ink-soft mb-1">등록된 학생 수</p>
            <p className="text-2xl font-display text-brand-900 tabular">
              {count ?? 0}
              <span className="text-sm text-ink-soft font-sans ml-1">명</span>
            </p>
          </div>

          <hr className="border-paper-border" />

          <div className="text-sm text-ink-muted leading-relaxed space-y-2">
            <p className="font-medium text-brand-900">다음 단계</p>
            <ul className="list-disc list-inside space-y-1 text-ink-soft">
              <li>Step 3: 메인 페이지 + 강사 소개 + 커리큘럼</li>
              <li>Step 4: 예약 시스템 (주간 스케줄)</li>
              <li>Step 5: 피드백 시스템 (학생 조회 + 관리자 CRUD)</li>
              <li>Step 6: 관리자 대시보드 정식 (학생 CRUD, 예약 관리 통합)</li>
            </ul>
          </div>

          <hr className="border-paper-border" />

          <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 text-sm">
            <p className="font-medium text-brand-900 mb-1">학생 등록 방법 (관리자 UI 완성 전)</p>
            <p className="text-ink-muted leading-relaxed">
              현재는 CLI로 학생을 등록합니다. 터미널에서:
            </p>
            <pre className="mt-2 p-3 rounded-lg bg-white border border-paper-border overflow-x-auto text-xs text-ink">
{`node scripts/add-student.mjs "홍길동" 120331 01012345678 "메모(선택)"`}
            </pre>
          </div>
        </div>

        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-brand-700 hover:text-brand-900">
            ← 메인으로
          </Link>
        </p>
      </div>
    </section>
  );
}
