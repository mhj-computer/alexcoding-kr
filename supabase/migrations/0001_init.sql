-- ==========================================================
-- 0001_init.sql
-- 코딩 과외 예약 시스템 초기 스키마
--
-- 예약 시간 정책 (애플리케이션 레이어에서 검증, DB check로도 보강):
--   평일 (월~금): 16:00, 17:00, 18:00, 19:00, 20:00, 21:00
--   주말 (토~일): 08:00 ~ 21:00 (매시간, 14개 슬롯)
--   각 1타임 = 50분
--
-- 취소 정책:
--   학생/학부모 직접 취소 불가. 관리자만 변경/삭제 가능.
-- ==========================================================

-- 확장
create extension if not exists "pgcrypto";

-- ==========================================================
-- students: 학생 정보
-- 관리자 계정은 DB에 저장되지 않고 환경변수(ADMIN_NAME, ADMIN_BIRTH)로만 존재
-- ==========================================================
create table students (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(name) between 2 and 20),
  birthdate_hash  text not null,                           -- bcrypt 해시 (평문 저장 절대 금지)
  parent_phone    text not null check (parent_phone ~ '^010-?\d{4}-?\d{4}$'),
  profile_note    text,                                    -- 관리자용 메모 (선택)
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- 동명이인 허용하되 (이름, 학부모 전화번호) 조합은 유일
  constraint students_name_phone_unique unique (name, parent_phone)
);

create index idx_students_name on students (name);

comment on table students is '학생 정보. 관리자(마스터)는 env에만 존재하며 이 테이블에 저장되지 않음.';
comment on column students.birthdate_hash is 'bcrypt 해시된 생년월일 6자리 (예: 120331). 평문 저장 금지.';

-- ==========================================================
-- bookings: 수업 예약
-- ==========================================================
create type booking_status as enum ('booked', 'cancelled', 'completed');

create table bookings (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references students(id) on delete cascade,
  slot_date       date not null,
  slot_start_time time not null,
  status          booking_status not null default 'booked',
  memo            text,                                    -- 관리자 메모
  created_by      text not null default 'student' check (created_by in ('student', 'admin')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- 시간대 유효성 (매 정시만 허용)
  constraint bookings_on_the_hour check (
    extract(minute from slot_start_time) = 0
    and extract(second from slot_start_time) = 0
  ),
  -- 허용 시간 범위 (08:00 ~ 21:00)
  constraint bookings_time_range check (
    slot_start_time between time '08:00' and time '21:00'
  )
);

-- 같은 (날짜, 시간) 슬롯에 'booked' 상태는 오직 1개만 허용 (동시 예약 race condition 방지)
-- PostgreSQL unique partial index: status = 'booked' 인 row 만 유니크 제약
create unique index uniq_active_slot
  on bookings (slot_date, slot_start_time)
  where status = 'booked';

create index idx_bookings_student on bookings (student_id, slot_date desc);
create index idx_bookings_date    on bookings (slot_date);
create index idx_bookings_status  on bookings (status);

comment on table bookings is '수업 예약. status=booked 인 슬롯은 (date, start_time) 기준 유일.';
comment on column bookings.created_by is 'student 또는 admin. 관리자 추가 예약 식별용.';

-- ==========================================================
-- feedbacks: 수업 피드백 (관리자 작성 → 학생 조회 전용)
-- ==========================================================
create table feedbacks (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students(id) on delete cascade,
  booking_id  uuid references bookings(id) on delete set null,
  content     text not null check (char_length(content) between 1 and 5000),
  image_urls  text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint feedbacks_max_images check (array_length(image_urls, 1) is null or array_length(image_urls, 1) <= 5)
);

create index idx_feedbacks_student on feedbacks (student_id, created_at desc);

comment on table feedbacks is '학생별 수업 피드백. 관리자만 작성/수정/삭제, 학생은 조회만.';

-- ==========================================================
-- login_attempts: 로그인 rate limit
-- ==========================================================
create table login_attempts (
  id           bigserial primary key,
  ip           text not null,
  name_input   text not null,
  success      boolean not null,
  attempted_at timestamptz not null default now()
);

create index idx_login_attempts_lookup on login_attempts (ip, name_input, attempted_at desc);

-- 90일 지난 시도 기록 자동 정리 (선택적 — 운영 시 cron 또는 수동)
-- DELETE FROM login_attempts WHERE attempted_at < now() - interval '90 days';

comment on table login_attempts is '로그인 시도 기록. rate limit 및 보안 로그 용도.';

-- ==========================================================
-- updated_at 자동 갱신 트리거
-- ==========================================================
create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger students_touch
  before update on students
  for each row execute function touch_updated_at();

create trigger bookings_touch
  before update on bookings
  for each row execute function touch_updated_at();

create trigger feedbacks_touch
  before update on feedbacks
  for each row execute function touch_updated_at();

-- ==========================================================
-- RLS: 모든 테이블 켜두되 policy 없음 = 기본 차단
-- → anon/authenticated 역할은 아무것도 못 함
-- → Next.js 서버가 service_role 키로만 접근
-- ==========================================================
alter table students       enable row level security;
alter table bookings       enable row level security;
alter table feedbacks      enable row level security;
alter table login_attempts enable row level security;

-- ==========================================================
-- Storage 버킷은 Supabase Studio에서 수동 생성:
--   1. feedback-images (private) — 학생별 피드백 이미지
--   2. profile-images  (public)  — 강사 프로필 (선택)
--
-- 또는 SQL로:
--   insert into storage.buckets (id, name, public) values
--     ('feedback-images', 'feedback-images', false),
--     ('profile-images', 'profile-images', true);
-- ==========================================================
