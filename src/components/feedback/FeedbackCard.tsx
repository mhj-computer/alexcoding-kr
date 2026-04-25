'use client';

import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ImageGallery } from './ImageGallery';

interface Props {
  feedback: {
    id: string;
    content: string;
    image_urls: string[];
    created_at: string;
    updated_at: string;
  };
  /** 관리자 모드일 경우 편집/삭제 버튼 표시 */
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * 단일 피드백 카드.
 * - 작성일 (상대 시간 + 절대 날짜)
 * - 본문 (줄바꿈 보존, whitespace-pre-line)
 * - 첨부 이미지 갤러리
 * - 수정 표시 (created != updated)
 */
export function FeedbackCard({ feedback, onEdit, onDelete }: Props) {
  const created = new Date(feedback.created_at);
  const updated = new Date(feedback.updated_at);
  const isEdited =
    Math.abs(updated.getTime() - created.getTime()) > 5_000;

  const absolute = format(created, "yyyy년 M월 d일 (EEE) a h시 mm분", {
    locale: ko,
  });
  const relative = formatDistanceToNow(created, { addSuffix: true, locale: ko });

  return (
    <article className="bg-white border border-paper-border rounded-2xl shadow-sm p-6 md:p-7">
      <header className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="font-display italic text-brand-500 text-xs tracking-[0.22em] uppercase mb-1">
            Feedback
          </p>
          <h3 className="font-display text-base md:text-lg text-brand-900 tabular leading-tight">
            {absolute}
          </h3>
          <p className="mt-1 text-xs text-ink-soft">
            {relative}
            {isEdited && (
              <>
                <span className="mx-1.5">·</span>
                <span>수정됨</span>
              </>
            )}
          </p>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex gap-1.5 shrink-0">
            {onEdit && (
              <button
                onClick={onEdit}
                className="h-9 px-3 rounded-lg text-sm text-ink-muted hover:text-brand-900 hover:bg-paper-subtle"
              >
                수정
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="h-9 px-3 rounded-lg text-sm text-danger hover:bg-danger/10"
              >
                삭제
              </button>
            )}
          </div>
        )}
      </header>

      <div className="text-[15px] md:text-base text-ink leading-[1.75] whitespace-pre-line">
        {feedback.content}
      </div>

      {feedback.image_urls?.length > 0 && (
        <ImageGallery urls={feedback.image_urls} />
      )}
    </article>
  );
}
