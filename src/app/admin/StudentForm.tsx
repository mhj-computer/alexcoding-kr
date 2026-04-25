'use client';

import { useEffect, useState } from 'react';

interface Student {
  id: string;
  name: string;
  parent_phone: string;
  profile_note: string | null;
}

type Mode =
  | { kind: 'create' }
  | { kind: 'edit'; student: Student };

interface Props {
  mode: Mode;
  onClose: () => void;
  onSaved: (kind: 'created' | 'updated') => void;
}

/**
 * 학생 추가/수정 다이얼로그.
 *
 * 입력 항목:
 *  - 학생 이름 (2~20자)
 *  - 생년월일 6자리 YYMMDD
 *      · create: 필수, 평문 입력 → 서버에서 해싱
 *      · edit: 선택, 비워두면 변경 안 함 (보안상 기존 값 표시 안 함)
 *  - 학부모 전화번호 (010-XXXX-XXXX)
 *  - 메모 (선택, 500자 이내)
 */
export function StudentForm({ mode, onClose, onSaved }: Props) {
  const isEdit = mode.kind === 'edit';
  const initial = isEdit ? mode.student : null;

  const [name, setName] = useState(initial?.name ?? '');
  const [birthdate, setBirthdate] = useState('');
  const [parentPhone, setParentPhone] = useState(initial?.parent_phone ?? '');
  const [profileNote, setProfileNote] = useState(initial?.profile_note ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !submitting) onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, submitting]);

  function formatPhoneInput(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // 클라이언트 검증
    if (name.trim().length < 2) {
      setError('학생 이름은 2자 이상이어야 합니다.');
      return;
    }
    if (!isEdit && !/^\d{6}$/.test(birthdate)) {
      setError('생년월일은 숫자 6자리(YYMMDD)로 입력해주세요.');
      return;
    }
    if (isEdit && birthdate && !/^\d{6}$/.test(birthdate)) {
      setError('생년월일은 숫자 6자리로만 입력하거나 비워두세요.');
      return;
    }
    const digits = parentPhone.replace(/\D/g, '');
    if (!/^010\d{8}$/.test(digits)) {
      setError('전화번호는 010으로 시작하는 11자리로 입력해주세요.');
      return;
    }

    setSubmitting(true);

    const body: Record<string, unknown> = {
      name: name.trim(),
      parent_phone: parentPhone,
      profile_note: profileNote.trim() || null,
    };
    // create는 birthdate 필수, edit은 입력했을 때만 포함
    if (!isEdit || birthdate) {
      body.birthdate = birthdate;
    }

    try {
      const url = isEdit
        ? `/api/admin/students/${mode.student.id}`
        : '/api/admin/students';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? '저장에 실패했습니다.');
        setSubmitting(false);
        return;
      }
      onSaved(isEdit ? 'updated' : 'created');
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setSubmitting(false);
    }
  }

  const title = isEdit ? '학생 정보 수정' : '학생 등록';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div className="w-full sm:max-w-md bg-white rounded-2xl shadow-card-hover animate-fade-up overflow-hidden">
        <div className="bg-brand-950 text-white px-6 py-5">
          <p className="font-display italic text-accent text-xs tracking-[0.22em] uppercase mb-2">
            {isEdit ? 'Edit student' : 'New student'}
          </p>
          <h2 className="font-display text-2xl text-white leading-tight">{title}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-7 space-y-4">
          <div>
            <label htmlFor="student-name" className="block text-sm font-medium text-ink mb-2">
              학생 이름
            </label>
            <input
              id="student-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="홍길동"
              className="h-12 w-full rounded-xl border border-paper-border bg-white px-3 text-[15px] text-ink placeholder:text-ink-soft hover:border-brand-200 focus:border-brand-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label
              htmlFor="student-birth"
              className="block text-sm font-medium text-ink mb-2"
            >
              생년월일{' '}
              <span className="font-normal text-ink-soft">
                {isEdit ? '(변경 시에만 입력 · 6자리)' : '(YYMMDD 6자리)'}
              </span>
            </label>
            <input
              id="student-birth"
              type="text"
              inputMode="numeric"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              placeholder={isEdit ? '비워두면 변경 안 함' : '120331'}
              className="h-12 w-full rounded-xl border border-paper-border bg-white px-3 text-[15px] text-ink placeholder:text-ink-soft hover:border-brand-200 focus:border-brand-500 focus:outline-none tabular"
            />
            {isEdit && (
              <p className="mt-2 text-xs text-ink-soft">
                보안을 위해 기존 생년월일은 표시하지 않습니다. 변경하려면 새로
                입력하세요.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="student-phone"
              className="block text-sm font-medium text-ink mb-2"
            >
              학부모 전화번호
            </label>
            <input
              id="student-phone"
              type="tel"
              inputMode="numeric"
              value={parentPhone}
              onChange={(e) => setParentPhone(formatPhoneInput(e.target.value))}
              placeholder="010-1234-5678"
              className="h-12 w-full rounded-xl border border-paper-border bg-white px-3 text-[15px] text-ink placeholder:text-ink-soft hover:border-brand-200 focus:border-brand-500 focus:outline-none tabular"
              required
            />
          </div>

          <div>
            <label
              htmlFor="student-note"
              className="block text-sm font-medium text-ink mb-2"
            >
              메모{' '}
              <span className="font-normal text-ink-soft">(선택, 500자 이내)</span>
            </label>
            <textarea
              id="student-note"
              value={profileNote}
              onChange={(e) => setProfileNote(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="예: 중2, 자바 입문, 화목 6시 정기"
              className="w-full rounded-xl border border-paper-border bg-white px-3 py-2.5 text-[15px] text-ink placeholder:text-ink-soft hover:border-brand-200 focus:border-brand-500 focus:outline-none resize-none"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger"
            >
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 h-12 rounded-xl border border-paper-border text-ink-muted font-medium hover:bg-paper-subtle disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-[1.5] h-12 rounded-xl bg-brand-900 text-white font-medium hover:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  저장 중...
                </>
              ) : isEdit ? (
                '수정 저장'
              ) : (
                '학생 등록'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
