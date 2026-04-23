# 코딩 과외 예약 시스템

1:1 코딩 과외 강사와 학부모/학생을 잇는 예약·피드백 웹서비스.

## 기술 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js 14 (App Router) + TypeScript |
| 스타일 | Tailwind CSS, Pretendard + Playfair Display |
| DB / Storage | Supabase (PostgreSQL + Storage) |
| 인증 | 자체 JWT (jose) + HTTP-only 쿠키 + bcrypt |
| 배포 | Vercel |

## 단계별 구현 로드맵

- [x] **Step 1** — 프로젝트 세팅 + DB 마이그레이션 ← **현재**
- [ ] Step 2 — 인증 모듈 (회원가입/로그인/세션/미들웨어)
- [ ] Step 3 — 메인 페이지, 강사 소개, 커리큘럼
- [ ] Step 4 — 예약 시스템 (주간 스케줄)
- [ ] Step 5 — 피드백 시스템 (학생 조회 + 관리자 CRUD + 이미지)
- [ ] Step 6 — 관리자 대시보드 통합
- [ ] Step 7 — 배포 & 운영 체크리스트

## 설치 & 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 프로젝트 생성

1. https://supabase.com 가입 → New Project
2. 리전: `Northeast Asia (Seoul)` 선택
3. DB 비밀번호 안전하게 저장
4. 생성 후 Settings → API에서 다음 값 복사:
   - `Project URL`
   - `service_role` 키 (⚠️ 절대 외부 공개 금지)

### 3. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 열어서:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# JWT 시크릿 생성 (터미널에서 실행 후 결과 붙여넣기)
# node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
JWT_SECRET=...

ADMIN_NAME=mhj331212
ADMIN_BIRTH=iloveyou1!

NEXT_PUBLIC_KAKAO_OPENCHAT=https://open.kakao.com/o/s7DlmJri
NEXT_PUBLIC_PHONE=010-8637-3734
```

### 4. DB 마이그레이션 실행

Supabase Studio → SQL Editor → 새 쿼리 → `supabase/migrations/0001_init.sql` 전체 붙여넣고 **Run**.

테이블 4개 (`students`, `bookings`, `feedbacks`, `login_attempts`) 생성 확인.

### 5. Storage 버킷 생성

Supabase Studio → Storage → New bucket:
- 이름: `feedback-images`, **Private**

### 6. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 접속 → "프로젝트 기반이 준비됐습니다" 화면이 뜨면 Step 1 완료.

## 폴더 구조 (Step 1 기준)

```
coding-tutor/
├─ .env.local.example
├─ next.config.mjs
├─ package.json
├─ postcss.config.mjs
├─ tailwind.config.ts
├─ tsconfig.json
│
├─ supabase/
│  └─ migrations/
│     └─ 0001_init.sql          # 전체 DB 스키마 + RLS + 인덱스
│
├─ public/
│  └─ images/
│     └─ instructor.jpg         # 강사 프로필 이미지
│
└─ src/
   ├─ app/
   │  ├─ layout.tsx              # 루트 레이아웃 + 메타데이터
   │  ├─ page.tsx                # 메인 (Step 3에서 정교화)
   │  └─ globals.css             # Tailwind + 폰트 + 컴포넌트 유틸
   │
   └─ lib/
      ├─ utils.ts                # cn, formatPhone, maskName, parentTitle
      ├─ supabase/
      │  ├─ server.ts            # service role 클라이언트 (서버 전용)
      │  └─ types.ts             # DB 타입
      └─ booking/
         └─ slots.ts             # 예약 시간 슬롯 규칙 & 유틸
```

## 핵심 설계 결정

### 보안
- **service_role 키는 서버에서만.** 클라이언트는 Next.js API를 통해서만 DB 접근.
- **모든 테이블 RLS 활성화 + 정책 없음 = 기본 차단**. service_role만 통과.
- **생년월일은 bcrypt 해시 저장.** 평문 DB 저장 금지.
- **로그인 rate limit 기반 테이블** (`login_attempts`) 준비.

### 예약 동시성
- `bookings` 테이블에 **partial unique index**: `(slot_date, slot_start_time) WHERE status='booked'` → 같은 슬롯 중복 예약 DB 레벨 차단.
- status 취소/완료 시에도 해당 슬롯 재예약 가능 (과거 히스토리 보존).

### 시간대 규칙
- **평일 (월~금)**: 16, 17, 18, 19, 20, 21시 시작 (6개 슬롯)
- **주말 (토~일)**: 08, 09, ..., 21시 시작 (14개 슬롯)
- 각 50분 수업
- DB `CHECK` 제약 + 앱 레이어 검증 이중 방어

### 취소 정책
- **학생/학부모는 직접 취소 불가.** UI에 취소 버튼 없음.
- 수업 전날까지 카톡/전화로 강사에게 연락 → 관리자가 DB에서 변경.

## 다음 단계

Step 1이 정상 작동하는 것(`npm run dev`로 화면이 뜨는 것)이 확인되면 **Step 2 (인증 모듈)** 을 요청해주세요.
Step 2에서 구현할 내용:
- `src/lib/auth/` : JWT, 세션, 비밀번호 해싱, 관리자 판별
- `src/middleware.ts` : 라우트 보호
- `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- `/signup`, `/login` 페이지 (부모님이 이용하기 쉬운 큰 폼)
