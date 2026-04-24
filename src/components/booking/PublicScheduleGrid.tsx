'use client';

import { useEffect, useMemo, useState } from 'react';
import { ContactModal } from './ContactModal';
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

/**
 * 공개 정규 스케줄 그리드.
 *
 * 구조:
 *   - 요일별 카드 7개 (월~일)
 *   - 각 카드 안에 시간별 슬롯
 *   - 슬롯 상태 2가지: '예약됨'(라벨 표시) / '예약 가능'
 *   - 슬롯 클릭: 카톡 문의 모달
 *
 * 평일은 16~21시 (6슬롯), 주말은 8~21시 (14슬롯) 표시.
 */
export function PublicScheduleGrid({ initialSlots }: Props) {
  const [slots, setSlots] = useState<ScheduleSlot[]>(initialSlots);
  const [modalCtx, setModalCtx] = useState<{
    dayLabel: string;
    timeLabel: string;
    isOccupied: boolean;
  } | null>(null);

  // 클라이언트에서 한 번 더 SWR 형태로 최신화 (배포 후 캐시 갭 방지)
  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      try {
        const res = await fetch('/api/schedule', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && Array.isArray(json.slots)) setSlots(json.slots);
      } catch {
        // ignore — initialSlots 유지
      }
    }
    // 페이지 진입 후 살짝 늦춰서 호출 (초기 렌더 우선)
    const t = setTimeout(refresh, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  // (day, hour) → ScheduleSlot 매핑
  const slotMap = useMemo(() => {
    const m = new Map<string, ScheduleSlot>();
    for (const s of slots) {
      m.set(`${s.day_of_week}|${s.hour}`, s);
    }
    return m;
  }, [slots]);

  return (
    <>
      {/* 데스크탑: 7요일 가로 그리드 */}
      <div className="hidden lg:block">
        <DesktopGrid
          slotMap={slotMap}
          onSlotClick={(day, hour) => {
            const slot = slotMap.get(`${day}|${hour}`);
            setModalCtx({
              dayLabel: DAY_LABELS_FULL[day],
              timeLabel: hourRangeLabel(hour),
              isOccupied: !!slot,
            });
          }}
        />
      </div>

      {/* 모바일·태블릿: 요일 카드 세로 스택 */}
      <div className="lg:hidden space-y-3">
        {[0, 1, 2, 3, 4, 5, 6].map((day) => (
          <DayCard
            key={day}
            day={day}
            slotMap={slotMap}
            onSlotClick={(d, h) => {
              const slot = slotMap.get(`${d}|${h}`);
              setModalCtx({
                dayLabel: DAY_LABELS_FULL[d],
                timeLabel: hourRangeLabel(h),
                isOccupied: !!slot,
              });
            }}
          />
        ))}
      </div>

      <Legend />

      <ContactModal
        open={!!modalCtx}
        context={modalCtx}
        onClose={() => setModalCtx(null)}
      />
    </>
  );
}

// ────────────────────────────────────────
// Desktop Grid (lg+)
// 한 화면에 7요일 × 시간 그리드
// ────────────────────────────────────────
function DesktopGrid({
  slotMap,
  onSlotClick,
}: {
  slotMap: Map<string, ScheduleSlot>;
  onSlotClick: (day: number, hour: number) => void;
}) {
  // 표시할 모든 시간대 (8~21) 합집합 — 주말이 더 넓음
  const allHours = [...WEEKEND_HOURS];

  return (
    <div className="bg-white rounded-2xl border border-paper-border shadow-card overflow-hidden">
      {/* 헤더: 요일 */}
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

      {/* 시간별 행 */}
      {allHours.map((hour) => (
        <div
          key={hour}
          className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-paper-border last:border-b-0"
        >
          <div className="px-3 py-3 text-sm text-ink-soft tabular flex items-center">
            {hourLabel(hour)}
          </div>

          {[0, 1, 2, 3, 4, 5, 6].map((day) => {
            const slot = slotMap.get(`${day}|${hour}`);
            const allowed =
              isWeekendDay(day)
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

            return (
              <button
                key={day}
                onClick={() => onSlotClick(day, hour)}
                className={
                  'border-l border-paper-border h-16 px-2 text-left transition-all hover:z-10 hover:shadow-sm focus-visible:z-10 ' +
                  (slot
                    ? 'bg-brand-900 text-white hover:bg-brand-800'
                    : 'bg-white text-brand-700 hover:bg-brand-50')
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
                    <p className="text-[10px] font-medium text-brand-500 uppercase tracking-wider">
                      예약 가능
                    </p>
                    <p className="text-xs text-ink-soft mt-0.5">
                      문의 →
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────────────────
// Mobile Day Card
// ────────────────────────────────────────
function DayCard({
  day,
  slotMap,
  onSlotClick,
}: {
  day: number;
  slotMap: Map<string, ScheduleSlot>;
  onSlotClick: (day: number, hour: number) => void;
}) {
  const isWeekend = isWeekendDay(day);
  const hours = isWeekend ? WEEKEND_HOURS : WEEKDAY_HOURS;
  const dayName = DAY_LABELS_FULL[day];

  return (
    <article className="bg-white rounded-2xl border border-paper-border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-paper-border">
        <div className="flex items-baseline gap-3">
          <span
            className={
              'font-display text-2xl ' +
              (isWeekend ? 'text-brand-700' : 'text-brand-900')
            }
          >
            {dayName}
          </span>
        </div>
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
              onClick={() => onSlotClick(day, hour)}
              className={
                'h-14 rounded-xl text-sm transition-all flex flex-col items-center justify-center gap-0.5 tabular ' +
                (slot
                  ? 'bg-brand-900 text-white hover:bg-brand-800 active:scale-[0.97]'
                  : 'bg-white border border-paper-border text-brand-900 hover:bg-brand-50 hover:border-brand-300 active:scale-[0.97]')
              }
            >
              <span className="font-medium">{hourLabel(hour)}</span>
              <span
                className={
                  'text-[10px] tracking-wider uppercase ' +
                  (slot ? 'opacity-80' : 'text-brand-500')
                }
              >
                {slot ? slot.label || '예약됨' : '문의'}
              </span>
            </button>
          );
        })}
      </div>
    </article>
  );
}

// ────────────────────────────────────────
// Legend
// ────────────────────────────────────────
function Legend() {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-muted">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm bg-white border border-paper-border" />
        <span>예약 가능 — 클릭 시 카카오톡 문의</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm bg-brand-900" />
        <span>이미 예약됨</span>
      </div>
      <span className="ml-auto text-ink-soft">1타임 = 50분</span>
    </div>
  );
}
