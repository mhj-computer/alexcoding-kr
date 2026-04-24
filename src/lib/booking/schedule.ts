import { z } from 'zod';
import { allowedHoursFor } from './slots';

/**
 * 정규 스케줄 슬롯 (요일 기반) 입력 스키마.
 *
 * 요일/시간 규칙은 slots.ts 의 평일/주말 시간 정의를 그대로 따름.
 *  - 평일 (월~금, day_of_week 0~4): 16, 17, 18, 19, 20, 21시
 *  - 주말 (토~일, day_of_week 5~6): 08~21시
 */

export const scheduleSlotSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  hour: z.number().int().min(0).max(23),
  label: z
    .string()
    .trim()
    .max(30, { message: '라벨은 30자 이내로 입력해주세요.' })
    .optional()
    .nullable(),
});

export type ScheduleSlotInput = z.infer<typeof scheduleSlotSchema>;

export const updateScheduleSlotSchema = z.object({
  label: z
    .string()
    .trim()
    .max(30, { message: '라벨은 30자 이내로 입력해주세요.' })
    .nullable()
    .optional(),
});

export type UpdateScheduleSlotInput = z.infer<typeof updateScheduleSlotSchema>;

/**
 * 요일·시간 조합이 허용 범위 내인지 검증.
 * day_of_week: 0=월, 5=토, 6=일
 */
export function isValidDayHour(day: number, hour: number): boolean {
  if (!Number.isInteger(day) || day < 0 || day > 6) return false;
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return false;

  // slots.ts 의 allowedHoursFor 는 Date를 받으므로 임시 Date 생성
  // 0=월요일, 5=토요일, 6=일요일
  // JS Date.getDay(): 0=일, 1=월, ..., 6=토
  // 우리 day_of_week 0~6 (월~일) → JS getDay 1,2,3,4,5,6,0
  const jsDay = day === 6 ? 0 : day + 1;

  // 임의의 날짜를 만들어서 jsDay에 맞는 요일이 되도록
  // 2024-01-01은 월요일 → 거기서 +offset
  const baseDate = new Date(2024, 0, 1); // 월요일
  baseDate.setDate(baseDate.getDate() + day);

  return (allowedHoursFor(baseDate) as readonly number[]).includes(hour);
}

export const DAY_LABELS_FULL: Record<number, string> = {
  0: '월요일',
  1: '화요일',
  2: '수요일',
  3: '목요일',
  4: '금요일',
  5: '토요일',
  6: '일요일',
};

export const DAY_LABELS_SHORT: Record<number, string> = {
  0: '월', 1: '화', 2: '수', 3: '목', 4: '금', 5: '토', 6: '일',
};

/** day_of_week 가 주말인지 (토/일) */
export function isWeekendDay(day: number): boolean {
  return day === 5 || day === 6;
}

/** 시간 → 'HH:00' 라벨 */
export function hourLabel(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

/** 'HH:00 ~ HH:50' */
export function hourRangeLabel(hour: number): string {
  const h = hour.toString().padStart(2, '0');
  return `${h}:00 ~ ${h}:50`;
}
