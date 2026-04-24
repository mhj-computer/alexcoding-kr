'use client';

import { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  context: {
    dayLabel: string;     // '월요일'
    timeLabel: string;    // '18:00 ~ 18:50'
    isOccupied: boolean;  // true면 "예약된 시간"인데 대기 문의
  } | null;
  onClose: () => void;
}

const KAKAO_URL =
  process.env.NEXT_PUBLIC_KAKAO_OPENCHAT ?? 'https://open.kakao.com/o/s7DlmJri';
const PHONE = process.env.NEXT_PUBLIC_PHONE ?? '010-8637-3734';
const PHONE_TEL = PHONE.replace(/-/g, '');

/**
 * 학부모가 스케줄 슬롯을 클릭했을 때 뜨는 문의 안내 모달.
 *
 * 빈 슬롯: "이 시간에 수업 가능한지 문의" 톤
 * 예약된 슬롯: "이 시간 외 다른 시간 / 대기 문의" 톤
 *
 * 카톡 또는 전화 두 개 큰 버튼 + 안내문.
 */
export function ContactModal({ open, context, onClose }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open && closeBtnRef.current) {
      closeBtnRef.current.focus();
    }
  }, [open]);

  if (!open || !context) return null;

  const title = context.isOccupied
    ? '이미 예약된 시간이에요'
    : '이 시간에 문의하시겠어요?';

  const description = context.isOccupied
    ? '선택하신 시간은 이미 정규 수업이 있습니다. 다른 시간을 원하시거나 대기를 희망하시면 카카오톡 또는 전화로 문의해주세요.'
    : '선택하신 시간을 강사에게 알려주시면 빠르게 답변드립니다. 현재 결제 시스템 준비중으로, 모든 수업 신청은 카카오톡 상담을 통해 진행됩니다.';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-md bg-white rounded-2xl shadow-card-hover animate-fade-up overflow-hidden">
        {/* 상단 컨텍스트 - 선택한 시간 강조 */}
        <div className="bg-brand-950 text-white px-6 md:px-7 py-6">
          <p className="font-display italic text-accent text-xs tracking-[0.22em] uppercase mb-3">
            {context.isOccupied ? 'Occupied' : 'Open inquiry'}
          </p>
          <div className="flex items-baseline gap-3 mb-1">
            <span className="font-display text-3xl md:text-[34px] text-white leading-none">
              {context.dayLabel}
            </span>
            <span className="text-base text-white/70 tabular">
              {context.timeLabel}
            </span>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-6 md:p-7">
          <h2
            id="contact-modal-title"
            className="font-display text-xl md:text-[22px] text-brand-900 leading-tight mb-3"
          >
            {title}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed mb-6">
            {description}
          </p>

          {/* 액션 버튼 */}
          <div className="space-y-2.5">
            <a
              href={KAKAO_URL}
              target="_blank"
              rel="noreferrer"
              onClick={onClose}
              className="group flex items-center justify-between gap-3 h-14 px-5 rounded-xl bg-[#FEE500] text-[#181600] hover:brightness-95 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <KakaoIcon />
                <div className="text-left">
                  <p className="text-[11px] font-medium opacity-70">
                    카카오톡 오픈채팅
                  </p>
                  <p className="text-[15px] font-semibold">상담 시작하기</p>
                </div>
              </div>
              <ArrowIcon />
            </a>

            <a
              href={`tel:${PHONE_TEL}`}
              onClick={onClose}
              className="group flex items-center justify-between gap-3 h-14 px-5 rounded-xl bg-paper-subtle text-brand-900 border border-paper-border hover:bg-brand-50 hover:border-brand-200 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <PhoneIcon />
                <div className="text-left">
                  <p className="text-[11px] font-medium text-ink-soft">
                    전화 문의
                  </p>
                  <p className="text-[15px] font-semibold tabular">{PHONE}</p>
                </div>
              </div>
              <ArrowIcon />
            </a>
          </div>

          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="mt-4 w-full h-11 text-sm text-ink-soft hover:text-ink-muted"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

function KakaoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden className="shrink-0">
      <path
        d="M14 4C7.925 4 3 7.78 3 12.45c0 3.02 2.04 5.67 5.12 7.18l-1.25 4.57c-.1.36.3.65.62.45l5.43-3.56c.36.03.72.05 1.08.05 6.075 0 11-3.78 11-8.45C25 7.78 20.075 4 14 4z"
        fill="currentColor"
      />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
