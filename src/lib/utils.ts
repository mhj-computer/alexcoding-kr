import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind 클래스 조건부 병합 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 전화번호 포맷팅: 01012345678 → 010-1234-5678 */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return raw;
}

/** 이름 마스킹: "홍길동" → "홍*동", "김철수" → "김*수", "이수" → "이*" */
export function maskName(name: string): string {
  if (!name) return '';
  if (name.length === 1) return name;
  if (name.length === 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
}

/** 학부모 존칭 표시: "홍길동" → "홍*동 학부모님" */
export function parentTitle(studentName: string): string {
  return `${maskName(studentName)} 학부모님`;
}

/** 생년월일 6자리 유효성 (YYMMDD, 간단 검증) */
export function isValidBirthdate(birth: string): boolean {
  if (!/^\d{6}$/.test(birth)) return false;
  const mm = parseInt(birth.slice(2, 4), 10);
  const dd = parseInt(birth.slice(4, 6), 10);
  return mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31;
}

/** 타이포용 천단위 콤마 */
export function formatNumber(n: number): string {
  return n.toLocaleString('ko-KR');
}
