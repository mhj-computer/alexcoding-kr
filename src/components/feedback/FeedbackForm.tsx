'use client';

import { useRef, useState } from 'react';

interface Props {
  studentId: string;
  /** 수정 모드일 경우 기존 피드백 정보 */
  initial?: {
    id: string;
    content: string;
    image_urls: string[];
  };
  onSaved: () => void;
  onCancel?: () => void;
}

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;

/**
 * 피드백 작성/수정 폼.
 *
 * - 텍스트 textarea (1~5000자)
 * - 이미지 업로드: 최대 5장, 각 5MB
 *   - 추가는 /api/admin/upload 로 즉시 업로드 (responsive UX)
 *   - 제거는 클라이언트 상태에서만 (저장 시 PATCH로 반영, storage는 서버가 정리)
 * - 글자 수 카운터
 */
export function FeedbackForm({ studentId, initial, onSaved, onCancel }: Props) {
  const isEdit = !!initial;
  const [content, setContent] = useState(initial?.content ?? '');
  const [imageUrls, setImageUrls] = useState<string[]>(initial?.image_urls ?? []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remaining = MAX_IMAGES - imageUrls.length;
    if (remaining <= 0) {
      setError(`이미지는 최대 ${MAX_IMAGES}장까지 첨부할 수 있습니다.`);
      return;
    }

    const toUpload = files.slice(0, remaining);
    if (files.length > remaining) {
      setError(
        `이미지는 최대 ${MAX_IMAGES}장까지 첨부할 수 있습니다. ${remaining}장만 추가합니다.`,
      );
    }

    setUploading(true);
    const newUrls: string[] = [];
    try {
      for (const file of toUpload) {
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          setError(`"${file.name}"이 ${MAX_SIZE_MB}MB를 초과합니다.`);
          continue;
        }
        const fd = new FormData();
        fd.append('studentId', studentId);
        fd.append('file', file);
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? '업로드에 실패했습니다.');
          continue;
        }
        newUrls.push(json.url);
      }
      setImageUrls((prev) => [...prev, ...newUrls]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleRemoveImage(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = content.trim();
    if (!trimmed) {
      setError('피드백 내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const url = isEdit
        ? `/api/admin/feedback/${initial!.id}`
        : '/api/admin/feedback';
      const method = isEdit ? 'PATCH' : 'POST';
      const body = isEdit
        ? { content: trimmed, image_urls: imageUrls }
        : { student_id: studentId, content: trimmed, image_urls: imageUrls };

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
      onSaved();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-paper-border rounded-2xl p-6 md:p-7 shadow-sm space-y-5"
    >
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label
            htmlFor={isEdit ? `content-${initial!.id}` : 'content-new'}
            className="text-sm font-medium text-ink"
          >
            피드백 내용
          </label>
          <span className="text-xs text-ink-soft tabular">
            {content.length} / 5000
          </span>
        </div>
        <textarea
          id={isEdit ? `content-${initial!.id}` : 'content-new'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          maxLength={5000}
          placeholder="이번 수업의 진도, 강점, 다음 수업 계획 등을 자유롭게 적어주세요."
          className="w-full rounded-xl border border-paper-border bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft hover:border-brand-200 focus:border-brand-500 focus:outline-none resize-y"
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm font-medium text-ink">
            이미지{' '}
            <span className="font-normal text-ink-soft">
              ({imageUrls.length}/{MAX_IMAGES} · 각 {MAX_SIZE_MB}MB 이내)
            </span>
          </span>
        </div>

        {imageUrls.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {imageUrls.map((url, i) => (
              <div
                key={url}
                className="relative aspect-square rounded-lg overflow-hidden bg-paper-subtle border border-paper-border group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`첨부 ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(i)}
                  className="absolute top-1 right-1 h-7 w-7 rounded-full bg-ink/70 text-white text-xs flex items-center justify-center hover:bg-ink"
                  aria-label="이미지 제거"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {imageUrls.length < MAX_IMAGES && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="block w-full text-sm text-ink-muted
                file:mr-3 file:h-10 file:px-4 file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100
                file:cursor-pointer disabled:opacity-50"
            />
            {uploading && (
              <p className="mt-2 text-xs text-brand-700 flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                업로드 중...
              </p>
            )}
          </div>
        )}
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
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 h-12 rounded-xl border border-paper-border text-ink-muted font-medium hover:bg-paper-subtle disabled:opacity-50"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || uploading}
          className="flex-[2] h-12 rounded-xl bg-brand-900 text-white font-medium hover:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              저장 중...
            </>
          ) : isEdit ? (
            '수정 저장'
          ) : (
            '피드백 등록'
          )}
        </button>
      </div>
    </form>
  );
}
