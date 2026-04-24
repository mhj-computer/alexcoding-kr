import { z } from 'zod';

/**
 * 입력 검증 스키마. 클라이언트/서버 모두에서 사용.
 */

// 이름: 한글 2~20자 + 관리자 마스터 키 포함 가능해야 함 → 넉넉하게 2~40자 영숫자/한글/기호
export const nameSchema = z
  .string()
  .trim()
  .min(2, { message: '이름은 2자 이상이어야 합니다.' })
  .max(40, { message: '이름은 40자 이하여야 합니다.' });

// 생년월일: 6자리 숫자 OR 관리자 마스터 키 (iloveyou1! 같은 특수 문자열 허용)
// → 길이는 느슨하게 (4~20자), 서버에서 관리자 여부 판단 후 학생 로그인이면 추가로 엄격 검증
export const birthCredentialSchema = z
  .string()
  .min(4, { message: '생년월일을 입력해주세요.' })
  .max(20);

// 학생 전용 엄격한 생년월일: 정확히 6자리 숫자 YYMMDD
export const studentBirthdateSchema = z
  .string()
  .regex(/^\d{6}$/, { message: '생년월일은 숫자 6자리로 입력해주세요. (예: 120331)' })
  .refine(
    (v) => {
      const mm = parseInt(v.slice(2, 4), 10);
      const dd = parseInt(v.slice(4, 6), 10);
      return mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31;
    },
    { message: '올바른 날짜가 아닙니다.' },
  );

// 학부모 전화번호: 010-XXXX-XXXX 또는 01012345678
export const parentPhoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/\D/g, ''))
  .refine((v) => /^010\d{8}$/.test(v), {
    message: '전화번호는 010으로 시작하는 11자리로 입력해주세요.',
  })
  .transform((v) => `${v.slice(0, 3)}-${v.slice(3, 7)}-${v.slice(7)}`);

// 로그인 입력 (학생/관리자 공통 폼)
export const loginSchema = z.object({
  name: nameSchema,
  birth: birthCredentialSchema,
});
export type LoginInput = z.infer<typeof loginSchema>;

// 관리자가 학생 등록 시 입력 (엄격)
export const createStudentSchema = z.object({
  name: z.string().trim().min(2).max(20),
  birthdate: studentBirthdateSchema,
  parent_phone: parentPhoneSchema,
  profile_note: z.string().trim().max(500).optional().nullable(),
});
export type CreateStudentInput = z.infer<typeof createStudentSchema>;

// 관리자가 학생 수정
export const updateStudentSchema = z.object({
  name: z.string().trim().min(2).max(20).optional(),
  birthdate: studentBirthdateSchema.optional(), // 변경 시에만
  parent_phone: parentPhoneSchema.optional(),
  profile_note: z.string().trim().max(500).nullable().optional(),
});
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
