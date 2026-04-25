'use client';

import { useCallback, useEffect, useState } from 'react';
import { FeedbackForm } from './FeedbackForm';
import { FeedbackCard } from './FeedbackCard';

interface Feedback {
  id: string;
  student_id: string;
  content: string;
  image_urls: string[];
  created_at: string;
  updated_at: string;
}

interface Props {
  studentId: string;
}

/**
 * 관리자가 특정 학생 피드백을 관리하는 통합 패널.
 *
 * - 상단: 새 피드백 작성 폼 (혹은 토글)
 * - 하단: 기존 피드백 목록 (최신순)
 *   - 각 카드에 수정/삭제 버튼
 *   - 수정 클릭 시 인라인으로 폼 펼침
 */
export function AdminStudentFeedback({ studentId }: Props) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/feedback?studentId=${studentId}`, {
        cache: 'no-store',
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? '불러오기 실패');
        return;
      }
      setFeedbacks(json.feedbacks ?? []);
    } catch {
      setError('네트워크 오류');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        setToast({ kind: 'error', text: json.error ?? '삭제 실패' });
        return;
      }
      setToast({ kind: 'success', text: '피드백이 삭제되었습니다.' });
      setConfirmDeleteId(null);
      await load();
    } catch {
      setToast({ kind: 'error', text: '네트워크 오류' });
    }
  }

  return (
    <div className="space-y-6">
      {/* 새 작성 영역 */}
      {showForm ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-display italic text-brand-500 text-xs tracking-[0.22em] uppercase">
              New entry
            </p>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-ink-soft hover:text-brand-900"
            >
              접기 ↑
            </button>
          </div>
          <FeedbackForm
            studentId={studentId}
            onSaved={() => {
              setShowForm(false);
              setToast({ kind: 'success', text: '피드백이 등록되었습니다.' });
              load();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full h-14 rounded-2xl bg-white border-2 border-dashed border-paper-border text-brand-700 font-medium hover:border-brand-500 hover:bg-brand-50 transition-all"
        >
          + 새 피드백 작성하기
        </button>
      )}

      {/* 목록 */}
      <div>
        {loading ? (
          <div className="py-12 text-center text-ink-muted">불러오는 중...</div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-danger/10 border border-danger/30 text-sm text-danger">
            {error}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="rounded-2xl border border-paper-border bg-white p-10 text-center">
            <p className="font-display italic text-brand-500 text-xs tracking-[0.22em] uppercase mb-2">
              Empty
            </p>
            <p className="text-ink-muted text-sm">
              아직 등록된 피드백이 없습니다. 첫 피드백을 작성해보세요.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-ink-soft tabular">
              총 <strong className="text-brand-900">{feedbacks.length}</strong>건 ·
              최신순
            </p>
            {feedbacks.map((f) =>
              editingId === f.id ? (
                <div key={f.id}>
                  <p className="font-display italic text-brand-500 text-xs tracking-[0.22em] uppercase mb-3">
                    Editing
                  </p>
                  <FeedbackForm
                    studentId={studentId}
                    initial={{
                      id: f.id,
                      content: f.content,
                      image_urls: f.image_urls,
                    }}
                    onSaved={() => {
                      setEditingId(null);
                      setToast({ kind: 'success', text: '피드백이 수정되었습니다.' });
                      load();
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <div key={f.id}>
                  <FeedbackCard
                    feedback={f}
                    onEdit={() => {
                      setEditingId(f.id);
                      setConfirmDeleteId(null);
                    }}
                    onDelete={() => setConfirmDeleteId(f.id)}
                  />
                  {confirmDeleteId === f.id && (
                    <div className="mt-2 p-4 rounded-xl bg-danger/10 border border-danger/30 flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-sm text-danger">
                        정말 이 피드백을 삭제할까요? 첨부 이미지도 함께 사라집니다.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="h-9 px-4 rounded-lg border border-paper-border text-sm text-ink-muted hover:bg-white"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleDelete(f.id)}
                          className="h-9 px-4 rounded-lg bg-danger text-white text-sm font-medium hover:bg-danger/90"
                        >
                          삭제 확인
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {toast && (
        <div
          role="status"
          className={
            'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 rounded-xl shadow-card-hover text-sm font-medium animate-fade-up ' +
            (toast.kind === 'success' ? 'bg-brand-900 text-white' : 'bg-danger text-white')
          }
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
