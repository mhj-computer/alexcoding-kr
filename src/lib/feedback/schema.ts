import { z } from 'zod';

/**
 * 피드백 입력 스키마.
 *
 * - content: 1~5000자 (DB CHECK와 동일)
 * - lesson_date: 강사가 수기로 입력하는 수업 날짜 (선택). 'YYYY-MM-DD'
 * - image_urls: Storage 업로드 후 받은 public/signed URL 배열, 최대 5장
 *
 * 참고: 현재는 booking과 연결하지 않음. 결제 연동 후 booking_id 필드 활용 예정.
 *       lesson_date 은 화면 표시용으로만 사용 (DB의 created_at 과 별개).
 *       lesson_date 는 실제로 feedbacks 테이블에 컬럼이 없어서 향후 추가하거나,
 *       지금 단계에서는 created_at 으로 갈음하고 lesson_date 입력은 받지 않음.
 *
 * → 결정: lesson_date 입력 받지 않음. created_at 이 곧 작성일.
 *         "수업 날짜"가 필요하면 content 본문에 강사가 직접 적도록 안내.
 */

export const createFeedbackSchema = z.object({
  student_id: z.string().uuid({ message: '학생 ID가 올바르지 않습니다.' }),
  content: z
    .string()
    .trim()
    .min(1, { message: '내용을 입력해주세요.' })
    .max(5000, { message: '내용은 5000자 이내로 입력해주세요.' }),
  image_urls: z
    .array(z.string().url())
    .max(5, { message: '이미지는 최대 5장까지 업로드할 수 있습니다.' })
    .default([]),
});
export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;

export const updateFeedbackSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1)
    .max(5000)
    .optional(),
  image_urls: z
    .array(z.string().url())
    .max(5)
    .optional(),
});
export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>;
