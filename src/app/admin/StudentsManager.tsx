'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { StudentForm } from './StudentForm';

interface Student {
  id: string;
  name: string;
  parent_phone: string;
  profile_note: string | null;
  created_at: string;
}

interface Props {
  initialStudents: Student[];
  feedbackCounts: Record<string, number>;
}

type DialogState =
  | { kind: 'create' }
  | { kind: 'edit'; student: Student }
  | { kind: 'delete-confirm'; student: Student; feedbackCount: number }
  | null;

/**
 * 관리자 학생 관리 통합 컴포넌트.
 *
 * - 학생 목록 (가나다순)
 * - 추가/수정/삭제 통합
 * - 검색 (이름/전화번호)
 * - 피드백 수 표시
 * - 피드백 페이지로 빠른 이동
 */
export function StudentsManager({ initialStudents, feedbackCounts }: Props) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [counts, setCounts] = useState<Record<string, number>>(feedbackCounts);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const reload = useCallback(async () => {
    try {
      // 학생 목록 + 카운트 동시 갱신
      const [stRes] = await Promise.all([
        fetch('/api/admin/students', { cache: 'no-store' }),
      ]);
      if (!stRes.ok) return;
      const stJson = await stRes.json();
      const list: Student[] = stJson.students ?? [];
      setStudents(list);

      // 카운트 갱신은 페이지 이탈 후 돌아왔을 때 정확하지만,
      // 단순화를 위해 추가/수정 시엔 기존 카운트 유지, 삭제 시엔 그 항목만 제거.
    } catch (e) {
      console.error(e);
    }
  }, []);

  async function handleDelete(student: Student) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/students/${student.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) {
        setToast({ kind: 'error', text: json.error ?? '삭제 실패' });
        setDeleting(false);
        return;
      }
      setToast({
        kind: 'success',
        text: `${student.name} 학생과 관련 데이터가 삭제되었습니다.`,
      });
      setDialog(null);
      // 로컬 상태에서 제거
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
      setCounts((prev) => {
        const next = { ...prev };
        delete next[student.id];
        return next;
      });
    } catch {
      setToast({ kind: 'error', text: '네트워크 오류' });
    } finally {
      setDeleting(false);
    }
  }

  // 검색 필터링
  const filtered = students.filter((s) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.parent_phone.includes(q.replace(/\D/g, '')) ||
      s.parent_phone.includes(q)
    );
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex-1 max-w-sm">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름 또는 전화번호로 검색"
            className="h-11 w-full rounded-xl border border-paper-border bg-white px-4 text-sm text-ink placeholder:text-ink-soft hover:border-brand-200 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <button
          onClick={() => setDialog({ kind: 'create' })}
          className="inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-xl bg-brand-900 text-white text-sm font-medium hover:bg-brand-800 active:scale-[0.98] transition-all shadow-sm"
        >
          <span className="text-lg leading-none">+</span> 학생 등록
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState hasSearch={!!search.trim()} onAdd={() => setDialog({ kind: 'create' })} />
      ) : (
        <ul className="space-y-2">
          {filtered.map((s) => {
            const count = counts[s.id] ?? 0;
            return (
              <li
                key={s.id}
                className="bg-white rounded-2xl border border-paper-border shadow-sm hover:shadow-card transition-shadow"
              >
                <div className="flex items-center gap-3 p-4 md:p-5">
                  {/* 이름 + 전화번호 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="font-display text-lg text-brand-900 leading-tight">
                        {s.name}
                      </p>
                      <p className="text-xs text-ink-soft tabular">{s.parent_phone}</p>
                    </div>
                    {s.profile_note && (
                      <p className="mt-1 text-xs text-ink-muted line-clamp-1">
                        {s.profile_note}
                      </p>
                    )}
                  </div>

                  {/* 피드백 수 + 액션 */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/admin/feedback/${s.id}`}
                      className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-brand-50 text-brand-700 text-sm font-medium hover:bg-brand-100"
                    >
                      <span className="tabular">{count}</span>건 피드백
                      <span aria-hidden>→</span>
                    </Link>
                    <Link
                      href={`/admin/feedback/${s.id}`}
                      className="md:hidden h-9 px-3 rounded-lg bg-brand-50 text-brand-700 text-sm font-medium hover:bg-brand-100 tabular"
                    >
                      {count}
                    </Link>
                    <button
                      onClick={() => setDialog({ kind: 'edit', student: s })}
                      className="h-9 px-3 rounded-lg text-sm text-ink-muted hover:text-brand-900 hover:bg-paper-subtle"
                      aria-label={`${s.name} 정보 수정`}
                    >
                      수정
                    </button>
                    <button
                      onClick={() =>
                        setDialog({
                          kind: 'delete-confirm',
                          student: s,
                          feedbackCount: count,
                        })
                      }
                      className="h-9 px-3 rounded-lg text-sm text-danger hover:bg-danger/10"
                      aria-label={`${s.name} 삭제`}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* 추가/수정 다이얼로그 */}
      {dialog?.kind === 'create' && (
        <StudentForm
          mode={{ kind: 'create' }}
          onClose={() => setDialog(null)}
          onSaved={async () => {
            setToast({ kind: 'success', text: '학생이 등록되었습니다.' });
            setDialog(null);
            await reload();
          }}
        />
      )}
      {dialog?.kind === 'edit' && (
        <StudentForm
          mode={{ kind: 'edit', student: dialog.student }}
          onClose={() => setDialog(null)}
          onSaved={async () => {
            setToast({ kind: 'success', text: '학생 정보가 수정되었습니다.' });
            setDialog(null);
            await reload();
          }}
        />
      )}

      {/* 삭제 확인 다이얼로그 */}
      {dialog?.kind === 'delete-confirm' && (
        <DeleteConfirm
          student={dialog.student}
          feedbackCount={dialog.feedbackCount}
          submitting={deleting}
          onCancel={() => setDialog(null)}
          onConfirm={() => handleDelete(dialog.student)}
        />
      )}

      {/* 토스트 */}
      {toast && (
        <div
          role="status"
          className={
            'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 rounded-xl shadow-card-hover text-sm font-medium animate-fade-up max-w-sm ' +
            (toast.kind === 'success' ? 'bg-brand-900 text-white' : 'bg-danger text-white')
          }
        >
          {toast.text}
        </div>
      )}
    </>
  );
}

function EmptyState({
  hasSearch,
  onAdd,
}: {
  hasSearch: boolean;
  onAdd: () => void;
}) {
  if (hasSearch) {
    return (
      <div className="rounded-2xl border border-paper-border bg-white p-12 text-center">
        <p className="text-sm text-ink-muted">검색 결과가 없습니다.</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-paper-border bg-white p-12 text-center">
      <p className="font-display italic text-brand-500 text-xs tracking-[0.22em] uppercase mb-2">
        Empty
      </p>
      <h2 className="font-display text-xl text-brand-900 mb-3">
        아직 등록된 학생이 없습니다
      </h2>
      <p className="text-sm text-ink-muted leading-relaxed mb-6 max-w-sm mx-auto">
        첫 학생을 등록해 시작하세요. 학생 등록 후 학생은 이름과 생년월일로 로그인하여
        피드백을 확인할 수 있습니다.
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 h-12 px-5 rounded-xl bg-brand-900 text-white font-medium hover:bg-brand-800"
      >
        <span className="text-lg leading-none">+</span> 학생 등록
      </button>
    </div>
  );
}

function DeleteConfirm({
  student,
  feedbackCount,
  submitting,
  onCancel,
  onConfirm,
}: {
  student: Student;
  feedbackCount: number;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onCancel();
      }}
    >
      <div className="w-full sm:max-w-md bg-white rounded-2xl shadow-card-hover p-6 md:p-7 animate-fade-up">
        <p className="font-display italic text-danger text-xs tracking-[0.22em] uppercase mb-3">
          Delete student
        </p>
        <h2 className="font-display text-xl text-brand-900 leading-tight mb-4">
          정말 <strong>{student.name}</strong> 학생을 삭제할까요?
        </h2>

        <div className="rounded-xl bg-danger/5 border border-danger/20 p-4 mb-5 space-y-1.5 text-sm text-ink">
          <p className="text-danger font-medium mb-2">
            아래 데이터가 함께 삭제되며 되돌릴 수 없습니다:
          </p>
          <p>· 학생 정보 (이름, 연락처, 메모)</p>
          <p>
            · 피드백 <strong className="tabular text-danger">{feedbackCount}</strong>건과
            첨부 이미지
          </p>
          <p className="text-xs text-ink-soft mt-2">
            ※ 학생이 다시 등록되어도 삭제된 피드백·이미지는 복구할 수 없습니다.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 h-12 rounded-xl border border-paper-border text-ink-muted font-medium hover:bg-paper-subtle disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-[1.2] h-12 rounded-xl bg-danger text-white font-medium hover:bg-danger/90 disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                삭제 중...
              </>
            ) : (
              '삭제 확인'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
