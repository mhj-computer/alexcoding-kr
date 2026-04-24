'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  DAY_LABELS_FULL,
  DAY_LABELS_SHORT,
  hourLabel,
  hourRangeLabel,
  isWeekendDay,
} from '@/lib/booking/schedule';
import { WEEKDAY_HOURS, WEEKEND_HOURS } from '@/lib/booking/slots';

interface ScheduleSlot {
  id: string;
  day_of_week: number;
  hour: number;
  label: string | null;
}

interface Props {
  initialSlots: ScheduleSlot[];
}

type DialogState =
  | { kind: 'create'; day: number; hour: number; dayLabel: string; timeLabel: string }
  | { kind: 'edit'; slot: ScheduleSlot; dayLabel: string; timeLabel: string }
  | null;

/**
 * 관리자 정규 스케줄 관리 그리드.
 *
 * - 빈 슬롯 클릭: 추가 다이얼로그 (라벨 선택)
 * - 기존 슬롯 클릭: 수정/삭제 다이얼로그
 */
export function AdminScheduleGrid({ initialSlots }: Props) {
  const [slots, setSlots] = useState<ScheduleSlot[]>(initialSlots);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const slotMap = useMemo(() => {
    const m = new Map<string, ScheduleSlot>();
    for (const s of slots) m.set(`${s.day_of_week}|${s.hour}`, s);
    return m;
  }, [slots]);

  async function reload() {
    try {
      const res = await fetch('/api/schedule', { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      if (Array.isArray(json.slots)) setSlots(json.slots);
    } catch {}
  }

  return (
    <>
      {/* 데스크탑 */}
      <div className="hidden lg:block bg-white rounded-2xl border border-paper-border shadow-card overflow-hidden">
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-paper-border bg-paper-subtle">
          <div className="px-3 py-3 text-xs font-medium text-ink-soft uppercase tracking-wider">
            시간
          </div>
          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
            <div
              key={day}
              className={
                'px-3 py-3 text-center border-l border-paper-border ' +
                (isWeekendDay(day) ? 'text-brand-700' : 'text-ink')
              }
            >
              <p className="text-sm font-medium">{DAY_LABELS_SHORT[day]}</p>
            </div>
          ))}
        </div>

        {[...WEEKEND_HOURS].map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-paper-border last:border-b-0"
          >
            <div className="px-3 py-3 text-sm text-ink-soft tabular flex items-center">
              {hourLabel(hour)}
            </div>
            {[0, 1, 2, 3, 4, 5, 6].map((day) => {
              const allowed = isWeekendDay(day)
                ? (WEEKEND_HOURS as readonly number[]).includes(hour)
                : (WEEKDAY_HOURS as readonly number[]).includes(hour);

              if (!allowed) {
                return (
                  <div
                    key={day}
                    className="border-l border-paper-border bg-paper-subtle/30"
                    aria-hidden
                  />
                );
              }
              const slot = slotMap.get(`${day}|${hour}`);
              return (
                <button
                  key={day}
                  onClick={() =>
                    setDialog(
                      slot
                        ? {
                            kind: 'edit',
                            slot,
                            dayLabel: DAY_LABELS_FULL[day],
                            timeLabel: hourRangeLabel(hour),
                          }
                        : {
                            kind: 'create',
                            day,
                            hour,
                            dayLabel: DAY_LABELS_FULL[day],
                            timeLabel: hourRangeLabel(hour),
                          },
                    )
                  }
                  className={
                    'border-l border-paper-border h-16 px-2 text-left transition-colors ' +
                    (slot
                      ? 'bg-brand-900 text-white hover:bg-brand-800'
                      : 'bg-white text-ink-soft hover:bg-brand-50 hover:text-brand-900')
                  }
                >
                  {slot ? (
                    <div>
                      <p className="text-[10px] font-medium opacity-75 uppercase tracking-wider">
                        예약됨
                      </p>
                      {slot.label && (
                        <p className="text-xs font-medium truncate mt-0.5">
                          {slot.label}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-[11px]">+ 추가</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* 모바일 */}
      <div className="lg:hidden space-y-3">
        {[0, 1, 2, 3, 4, 5, 6].map((day) => (
          <DayCardAdmin
            key={day}
            day={day}
            slotMap={slotMap}
            onSlotClick={(d, h, slot) =>
              setDialog(
                slot
                  ? {
                      kind: 'edit',
                      slot,
                      dayLabel: DAY_LABELS_FULL[d],
                      timeLabel: hourRangeLabel(h),
                    }
                  : {
                      kind: 'create',
                      day: d,
                      hour: h,
                      dayLabel: DAY_LABELS_FULL[d],
                      timeLabel: hourRangeLabel(h),
                    },
              )
            }
          />
        ))}
      </div>

      {dialog && (
        <SlotDialog
          state={dialog}
          onClose={() => setDialog(null)}
          onSaved={async (msg) => {
            setDialog(null);
            setToast({ kind: 'success', text: msg });
            await reload();
          }}
          onError={(msg) => setToast({ kind: 'error', text: msg })}
        />
      )}

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
    </>
  );
}

function DayCardAdmin({
  day,
  slotMap,
  onSlotClick,
}: {
  day: number;
  slotMap: Map<string, ScheduleSlot>;
  onSlotClick: (day: number, hour: number, slot: ScheduleSlot | undefined) => void;
}) {
  const isWeekend = isWeekendDay(day);
  const hours = isWeekend ? WEEKEND_HOURS : WEEKDAY_HOURS;
  return (
    <article className="bg-white rounded-2xl border border-paper-border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-paper-border">
        <span
          className={
            'font-display text-2xl ' +
            (isWeekend ? 'text-brand-700' : 'text-brand-900')
          }
        >
          {DAY_LABELS_FULL[day]}
        </span>
        <span className="text-xs text-ink-soft">
          {isWeekend ? '주말' : '평일'} · {hours.length}슬롯
        </span>
      </div>
      <div className="p-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {hours.map((hour) => {
          const slot = slotMap.get(`${day}|${hour}`);
          return (
            <button
              key={hour}
              onClick={() => onSlotClick(day, hour, slot)}
              className={
                'h-14 rounded-xl text-sm transition-all flex flex-col items-center justify-center gap-0.5 tabular ' +
                (slot
                  ? 'bg-brand-900 text-white hover:bg-brand-800'
                  : 'bg-white border border-dashed border-paper-border text-ink-soft hover:border-brand-500 hover:text-brand-900')
              }
            >
              <span className="font-medium">{hourLabel(hour)}</span>
              <span
                className={
                  'text-[10px] tracking-wider uppercase ' +
                  (slot ? 'opacity-80' : '')
                }
              >
                {slot ? slot.label || '예약됨' : '+ 추가'}
              </span>
            </button>
          );
        })}
      </div>
    </article>
  );
}

// ────────────────────────────────────────
// SlotDialog - 추가/수정/삭제 통합
// ────────────────────────────────────────
function SlotDialog({
  state,
  onClose,
  onSaved,
  onError,
}: {
  state: NonNullable<DialogState>;
  onClose: () => void;
  onSaved: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [label, setLabel] = useState<string>(
    state.kind === 'edit' ? state.slot.label ?? '' : '',
  );
  const [submitting, setSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !submitting) onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, submitting]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (state.kind === 'create') {
        const res = await fetch('/api/admin/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            day_of_week: state.day,
            hour: state.hour,
            label: label.trim() || null,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          onError(json.error ?? '추가 실패');
          setSubmitting(false);
          return;
        }
        onSaved('스케줄이 추가되었습니다.');
      } else {
        const res = await fetch(`/api/admin/schedule/${state.slot.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label: label.trim() || null }),
        });
        const json = await res.json();
        if (!res.ok) {
          onError(json.error ?? '변경 실패');
          setSubmitting(false);
          return;
        }
        onSaved('스케줄이 변경되었습니다.');
      }
    } catch {
      onError('네트워크 오류가 발생했습니다.');
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (state.kind !== 'edit') return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/schedule/${state.slot.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const json = await res.json();
        onError(json.error ?? '삭제 실패');
        setSubmitting(false);
        return;
      }
      onSaved('스케줄이 삭제되었습니다.');
    } catch {
      onError('네트워크 오류가 발생했습니다.');
      setSubmitting(false);
    }
  }

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
            {state.kind === 'create' ? '슬롯 추가' : '슬롯 수정'}
          </p>
          <div className="flex items-baseline gap-3">
            <span className="font-display text-2xl">{state.dayLabel}</span>
            <span className="text-sm text-white/70 tabular">{state.timeLabel}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="label-input"
              className="block text-sm font-medium text-ink mb-2"
            >
              라벨{' '}
              <span className="text-ink-soft font-normal">
                (선택 · 30자 이내)
              </span>
            </label>
            <input
              id="label-input"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={30}
              placeholder="예: 중등 자바, 고등 파이썬"
              className="h-12 w-full rounded-xl border border-paper-border bg-white px-3 text-[15px] text-ink placeholder:text-ink-soft hover:border-brand-200 focus:border-brand-500 focus:outline-none"
            />
            <p className="mt-2 text-xs text-ink-soft">
              공개 페이지에 표시됩니다. 학생 이름 등 개인정보는 입력하지 마세요.
            </p>
          </div>

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
              className="flex-[1.5] h-12 rounded-xl bg-brand-900 text-white font-medium hover:bg-brand-800 disabled:opacity-60"
            >
              {submitting ? '저장 중...' : '저장'}
            </button>
          </div>

          {state.kind === 'edit' && (
            <div className="pt-4 border-t border-paper-border">
              {!confirmingDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  disabled={submitting}
                  className="w-full h-11 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 disabled:opacity-50"
                >
                  이 시간 슬롯 삭제하기
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-ink-muted text-center">
                    정말 삭제할까요? 공개 페이지에서 사라집니다.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(false)}
                      disabled={submitting}
                      className="flex-1 h-11 rounded-xl border border-paper-border text-sm text-ink-muted hover:bg-paper-subtle disabled:opacity-50"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={submitting}
                      className="flex-1 h-11 rounded-xl bg-danger text-white text-sm font-medium hover:bg-danger/90 disabled:opacity-60"
                    >
                      {submitting ? '삭제 중...' : '삭제 확인'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
