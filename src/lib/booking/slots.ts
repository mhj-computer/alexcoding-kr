/**
 * 예약 시간 슬롯 정의 및 유틸.
 *
 * 규칙:
 *   - 평일 (월~금): 16, 17, 18, 19, 20, 21시 시작 (6 슬롯)
 *   - 주말 (토~일): 08 ~ 21시 시작 (14 슬롯)
 *   - 각 1타임 = 50분 수업
 *
 * 날짜 표기는 모두 'YYYY-MM-DD', 시간은 'HH:MM' 기준 (한국 시간대).
 */

import { addDays, format, startOfWeek, parseISO, isBefore, startOfDay } from 'date-fns';

export const SESSION_DURATION_MIN = 50;

export const WEEKDAY_HOURS = [16, 17, 18, 19, 20, 21] as const;
export const WEEKEND_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21] as const;

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export const DAY_KEYS: readonly DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
export const DAY_LABELS_KO: Record<DayKey, string> = {
  mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토', sun: '일',
};

/** date-fns의 getDay는 일요일=0. 우리 DayKey 순서로 변환 */
export function dayKeyOf(date: Date): DayKey {
  // 월요일 시작 순서로 변환: 일=0 → 6, 월=1 → 0, ...
  const d = date.getDay();
  const idx = (d + 6) % 7;
  return DAY_KEYS[idx];
}

export function isWeekend(date: Date): boolean {
  const d = date.getDay();
  return d === 0 || d === 6;
}

/** 해당 날짜의 가능한 시작 시각들 (정수 시 기준) */
export function allowedHoursFor(date: Date): readonly number[] {
  return isWeekend(date) ? WEEKEND_HOURS : WEEKDAY_HOURS;
}

/** 주어진 날짜를 기준으로 월요일 시작 일주일의 날짜 배열 반환 */
export function weekDaysFrom(anyDateInWeek: Date): Date[] {
  const monday = startOfWeek(anyDateInWeek, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** 'YYYY-MM-DD' → Date (로컬) */
export function toDate(ymd: string): Date {
  return parseISO(ymd);
}

/** Date → 'YYYY-MM-DD' */
export function toYmd(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

/** 'HH:MM' 포맷팅 */
export function formatHourLabel(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

/** 시작 시각 + 50분 종료 시각 라벨 */
export function formatSlotRange(hour: number): string {
  const start = formatHourLabel(hour);
  const endMin = 50;
  const end = `${hour.toString().padStart(2, '0')}:${endMin}`;
  return `${start} ~ ${end}`;
}

export interface Slot {
  date: string;       // 'YYYY-MM-DD'
  time: string;       // 'HH:00'
  hour: number;
  isPast: boolean;
}

/** 특정 날짜의 모든 슬롯 생성 (과거 여부 포함) */
export function slotsForDate(date: Date, now: Date = new Date()): Slot[] {
  const hours = allowedHoursFor(date);
  const ymd = toYmd(date);
  const dayStart = startOfDay(date);
  const isPastDay = isBefore(dayStart, startOfDay(now));

  return hours.map((h) => {
    const slotMoment = new Date(date);
    slotMoment.setHours(h, 0, 0, 0);
    const isPast = isPastDay || isBefore(slotMoment, now);
    return {
      date: ymd,
      time: formatHourLabel(h),
      hour: h,
      isPast,
    };
  });
}

/** 주간 전체 슬롯 생성 (날짜별 배열) */
export function weekSlots(weekStart: Date, now: Date = new Date()): { date: Date; slots: Slot[] }[] {
  return weekDaysFrom(weekStart).map((d) => ({
    date: d,
    slots: slotsForDate(d, now),
  }));
}

/** 해당 슬롯이 규칙상 유효한지 서버에서 재검증 */
export function isValidSlot(ymd: string, time: string): boolean {
  const date = toDate(ymd);
  if (isNaN(date.getTime())) return false;
  const match = /^(\d{2}):00(:00)?$/.exec(time);
  if (!match) return false;
  const hour = parseInt(match[1], 10);
  return (allowedHoursFor(date) as readonly number[]).includes(hour);
}
