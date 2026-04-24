-- ==========================================================
-- 0002_schedule_slots.sql
--
-- 정규 수업 스케줄 테이블 추가.
--
-- 배경:
--   기존 bookings 테이블은 특정 날짜의 1회성 예약용.
--   이 테이블은 "매주 월요일 16시에 정기 수업" 같은 요일 기반 정기 슬롯용.
--   학부모 직접 예약이 없는 현재 단계에서 관리자가 수동 관리하는 스케줄만 표시.
--
--   bookings 테이블은 그대로 유지. 결제 연동 시 1회성 예약 기능으로 재활용 예정.
-- ==========================================================

create table schedule_slots (
  id           uuid primary key default gen_random_uuid(),
  day_of_week  smallint not null,      -- 0=월, 1=화, 2=수, 3=목, 4=금, 5=토, 6=일
  hour         smallint not null,      -- 0~23, 매 정시 시작
  label        text,                   -- 선택. 수업 종류 표시 (예: '중등 자바', '고등 파이썬')
                                       -- 개인정보는 금지. 공개되는 정보임.
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint schedule_slots_day_range check (day_of_week between 0 and 6),
  constraint schedule_slots_hour_range check (hour between 0 and 23),
  -- 같은 (요일, 시간) 조합은 유일
  constraint schedule_slots_unique unique (day_of_week, hour),
  -- label 길이 제한 (개인정보 유입 방지용으로 짧게)
  constraint schedule_slots_label_len check (label is null or char_length(label) <= 30)
);

create index idx_schedule_slots_day on schedule_slots (day_of_week, hour);

comment on table schedule_slots is '정규 수업 스케줄. 요일+시간 기반. 공개 페이지에 노출됨.';
comment on column schedule_slots.label is '공개 표시용 라벨. 학생 이름 등 개인정보 포함 금지.';

-- updated_at 자동 갱신
create trigger schedule_slots_touch
  before update on schedule_slots
  for each row execute function touch_updated_at();

-- RLS (policy 없음 → service_role 만 접근)
alter table schedule_slots enable row level security;

-- 공개 페이지에서 읽기만은 anon role 이 허용되도록 별도 정책 (선택적)
-- 우리는 Next.js 서버가 service_role 로 조회해서 응답 내려주므로 anon policy 불필요.
-- → 앱 레벨에서 처리.
