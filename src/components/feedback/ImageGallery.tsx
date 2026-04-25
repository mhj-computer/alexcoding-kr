'use client';

import { useEffect, useState } from 'react';

/**
 * 피드백 첨부 이미지 갤러리.
 * 썸네일 그리드 + 클릭 시 라이트박스 모달로 확대.
 */
export function ImageGallery({ urls }: { urls: string[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    if (openIdx === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenIdx(null);
      if (e.key === 'ArrowLeft') setOpenIdx((i) => (i === null ? null : Math.max(0, i - 1)));
      if (e.key === 'ArrowRight')
        setOpenIdx((i) => (i === null ? null : Math.min(urls.length - 1, i + 1)));
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openIdx, urls.length]);

  if (!urls?.length) return null;

  return (
    <>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {urls.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenIdx(i)}
            className="relative aspect-[4/3] overflow-hidden rounded-lg bg-paper-subtle border border-paper-border hover:border-brand-300 transition-colors group"
            aria-label={`이미지 ${i + 1} 확대 보기`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`첨부 이미지 ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {openIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 backdrop-blur-sm animate-fade-in p-4"
          onClick={() => setOpenIdx(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urls[openIdx]}
            alt={`이미지 ${openIdx + 1}`}
            className="max-h-[88vh] max-w-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenIdx(null);
            }}
            className="absolute top-5 right-5 h-11 w-11 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 flex items-center justify-center text-lg"
            aria-label="닫기"
          >
            ✕
          </button>

          {urls.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIdx((i) => (i === null ? null : Math.max(0, i - 1)));
                }}
                disabled={openIdx === 0}
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center"
                aria-label="이전 이미지"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIdx((i) =>
                    i === null ? null : Math.min(urls.length - 1, i + 1),
                  );
                }}
                disabled={openIdx === urls.length - 1}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center"
                aria-label="다음 이미지"
              >
                ›
              </button>
              <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-white/70 tabular">
                {openIdx + 1} / {urls.length}
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
}
