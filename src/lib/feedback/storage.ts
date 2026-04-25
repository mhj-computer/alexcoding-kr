import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { randomUUID } from 'node:crypto';

/**
 * 피드백 이미지 업로드 헬퍼.
 *
 * Storage 버킷: feedback-images (Private)
 * 경로 컨벤션: {student_id}/{uuid}.{ext}
 *
 * 학생은 자기 피드백 조회 시 signed URL을 통해서만 이미지에 접근 (private bucket).
 * 관리자는 작성/조회 시 service_role 키로 signed URL 생성.
 */

const BUCKET = 'feedback-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

export interface UploadedImage {
  path: string;        // storage 내부 경로 (예: 'student-id/uuid.jpg')
  signedUrl: string;   // 1주일짜리 signed URL
}

/** 단일 파일 검증 + 업로드 */
export async function uploadFeedbackImage(
  studentId: string,
  file: File,
): Promise<UploadedImage> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new UploadError(
      'JPG, PNG, WebP, HEIC 형식의 이미지만 업로드할 수 있습니다.',
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new UploadError('이미지 1장당 5MB 이하만 업로드할 수 있습니다.');
  }

  // 확장자 결정 (mime → ext)
  const ext = mimeToExt(file.type);
  const path = `${studentId}/${randomUUID()}.${ext}`;

  const supabase = getSupabaseAdmin();
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadErr) {
    console.error('[storage upload]', uploadErr.message);
    throw new UploadError('이미지 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }

  const signedUrl = await createSignedUrl(path);
  return { path, signedUrl };
}

/** 1주일짜리 signed URL 발급 */
export async function createSignedUrl(path: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  const expiresIn = 60 * 60 * 24 * 7; // 7일
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) {
    console.error('[storage signed url]', error?.message);
    throw new UploadError('이미지 URL을 생성하지 못했습니다.');
  }
  return data.signedUrl;
}

/** 이미지 삭제 */
export async function deleteFeedbackImage(path: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.error('[storage delete]', error.message);
    // 삭제 실패해도 큰 문제 안되므로 throw 안 함
  }
}

/**
 * URL에서 storage path 추출.
 * Signed URL은 만료되므로 DB에는 path만 저장하는 게 이상적이지만,
 * 단순화를 위해 image_urls에 signed URL 통째로 저장하고,
 * 필요시 path만 추출해서 갱신/삭제에 사용.
 *
 * 예: https://xxx.supabase.co/storage/v1/object/sign/feedback-images/abc/uuid.jpg?token=...
 *   → 'abc/uuid.jpg'
 */
export function extractPathFromUrl(url: string): string | null {
  const match = /\/storage\/v1\/object\/(?:sign|public)\/feedback-images\/([^?]+)/.exec(url);
  return match ? decodeURIComponent(match[1]) : null;
}

function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
  };
  return map[mime] ?? 'bin';
}

export class UploadError extends Error {}
