# AlexCoding

1:1 코딩 과외 강사와 학부모/학생을 잇는 예약·피드백 웹서비스.
도메인: https://alexcoding.kr

## 기술 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js 14 (App Router) + TypeScript |
| 스타일 | Tailwind CSS, Pretendard + Playfair Display |
| DB / Storage | Supabase (PostgreSQL + Storage) |
| 인증 | 자체 JWT (jose) + HTTP-only 쿠키 + bcrypt |
| 배포 | Vercel + alexcoding.kr |

## 단계별 구현 로드맵

- [x] **Step 1** — 프로젝트 세팅 + DB 마이그레이션
- [x] **Step 2** — 인증 모듈
- [x] **Step 3** — 메인/소개/커리큘럼
- [x] **Step 4** — 학생 예약 시스템 (이후 4.5에서 변경)
- [x] **Step 4.5** — **요일 기반 공개 스케줄로 전환** ← **현재**
- [ ] Step 5 — 피드백 시스템
- [ ] Step 6 — 관리자 대시보드 통합 (학생 CRUD)
- [ ] Step 7 — 결제 연동 + 학부모 직접 예약 재활성화
- [ ] Step 8 — 배포 체크리스트

## Step 4.5 변경 요약

### 정책 변경
- 결제 시스템이 없으므로 **학부모 직접 예약 차단**
- 모든 수업 신청은 **카카오톡 상담**으로 일원화
- 페이지는 **"내 스케줄을 보여주는 정보 페이지"**로 전환
- 날짜가 아닌 **요일 기반** (월~일 고정) 정규 스케줄
- 주간 네비게이션 제거 (단일 뷰)

### DB 변경
새 테이블 `schedule_slots` 추가. 기존 `bookings` 테이블은 보존 (Step 7에서 재활용).

```sql
schedule_slots
├─ id            uuid
├─ day_of_week   smallint (0=월 ~ 6=일)
├─ hour          smallint (0~23)
├─ label         text (선택, 30자 이내, 개인정보 금지)
└─ created_at / updated_at
```

### 페이지 변경
| 페이지 | 변경 |
|---|---|
| `/booking` | **공개 페이지**. 요일 스케줄 + 카톡 모달 |
| `/admin/schedule` | 신규. 정규 슬롯 CRUD |
| `/admin` | "예약 관리" → "스케줄 관리" |
| 헤더/푸터 | "수업 예약" → "수업 스케줄" |

### 신규 파일
```
supabase/migrations/0002_schedule_slots.sql

src/lib/booking/schedule.ts          # zod + 요일 라벨

src/app/api/
├─ schedule/route.ts                 # 공개 GET
└─ admin/schedule/
   ├─ route.ts                       # POST
   └─ [id]/route.ts                  # PATCH/DELETE

src/app/admin/schedule/page.tsx      # 관리자 페이지

src/components/booking/
├─ PublicScheduleGrid.tsx            # 공개 그리드 (학부모용)
├─ AdminScheduleGrid.tsx             # 관리자 그리드
└─ ContactModal.tsx                  # 카톡/전화 안내 모달
```

### 제거된 파일 (Step 4 잔재)
```
src/components/booking/
- StudentWeeklySchedule.tsx
- AdminWeeklySchedule.tsx
- BookingConfirmDialog.tsx
- AdminBookingDialog.tsx
- WeekNavigator.tsx

src/app/api/
- bookings/                          # 학생 예약 API
- admin/bookings/                    # 관리자 예약 API

src/lib/booking/
- schema.ts                          # 1회성 예약 zod
- queries.ts                         # 주간 예약 조회
```

`bookings` 테이블 자체는 유지 (Step 7 결제 연동 시 재사용).

## 설치 & 실행

### 새 마이그레이션 실행 (중요)

Supabase Studio → SQL Editor → 새 쿼리 → `supabase/migrations/0002_schedule_slots.sql` 실행.

확인:
```sql
SELECT * FROM schedule_slots;  -- 빈 결과 (정상)
```

### 의존성 설치 & 개발 서버

```bash
npm install
npm run dev
```

http://localhost:3000/booking 접속 → 빈 스케줄 그리드 + 카톡 안내 화면.

## 사용 흐름

### 학부모 (로그인 없음)
1. https://alexcoding.kr/booking 접속
2. 정규 수업 스케줄 확인 (예약됨/예약 가능 두 가지 상태)
3. 빈 시간 클릭 → 카톡 모달 → 카카오톡 오픈채팅 이동

### 관리자 (로그인 후)
1. `/login` → `mhj331212` / `iloveyou1!`
2. `/admin` → "스케줄 관리" 카드 클릭
3. `/admin/schedule` → 빈 슬롯 클릭 → 라벨 입력 → 저장
4. 라벨 예: `중등 자바`, `고등 파이썬`, `정올 대비` (개인정보 금지)
5. 기존 슬롯 클릭 → 라벨 수정 또는 삭제

## 보안

- 공개 GET `/api/schedule`은 인증 없이 접근 가능. label은 안전한 정보만 노출.
- 관리자 CRUD는 JWT + role==='admin' 검증.
- DB의 unique constraint `(day_of_week, hour)`로 중복 슬롯 차단.
- label 컬럼에 30자 길이 제한 (개인정보 유입 최소화).

## 다음 단계

Step 5 — 피드백 시스템.
- 학생 로그인 후 자기 피드백 조회
- 관리자가 학생별 피드백 작성/수정/삭제
- 이미지 업로드 (Supabase Storage `feedback-images` 버킷)
