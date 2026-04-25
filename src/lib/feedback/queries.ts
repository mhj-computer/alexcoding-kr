import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import type { FeedbackRow } from '@/lib/supabase/types';
import { createSignedUrl, extractPathFromUrl } from './storage';

/**
 * 피드백 조회 헬퍼.
 *
 * 학생/관리자 모두 사용. 학생은 본인 것만 조회.
 * image_urls 안의 signed URL이 만료되었을 가능성을 대비해
 * 응답 직전에 path 추출 후 재서명한다.
 */

export interface FeedbackView {
  id: string;
  student_id: string;
  content: string;
  image_urls: string[];   // refresh된 signed URL
  created_at: string;
  updated_at: string;
}

export async function fetchStudentFeedbacks(studentId: string): Promise<FeedbackView[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('feedbacks')
    .select('id, student_id, content, image_urls, created_at, updated_at')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .returns<FeedbackRow[]>();

  if (error) {
    console.error('[fetchStudentFeedbacks]', error.message);
    return [];
  }

  return Promise.all((data ?? []).map(refreshUrls));
}

/**
 * 단일 피드백의 image_urls를 모두 fresh signed URL로 교체.
 * URL → path 추출 실패 시 (이미 만료된 외부 URL 등) 원본을 그대로 둔다.
 */
async function refreshUrls(row: FeedbackRow): Promise<FeedbackView> {
  const refreshed = await Promise.all(
    (row.image_urls ?? []).map(async (url) => {
      const path = extractPathFromUrl(url);
      if (!path) return url;
      try {
        return await createSignedUrl(path);
      } catch {
        return url;
      }
    }),
  );

  return {
    id: row.id,
    student_id: row.student_id,
    content: row.content,
    image_urls: refreshed,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
