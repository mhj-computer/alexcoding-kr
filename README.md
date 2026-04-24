# 코딩 과외 예약 시스템

1:1 코딩 과외 강사와 학부모/학생을 잇는 예약·피드백 웹서비스.

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
- [x] **Step 2** — 인증 모듈 (로그인/세션/관리자 분기/rate limit) ← **현재**
- [ ] Step 3 — 메인 페이지, 강사 소개, 커리큘럼
- [ ] Step 4 — 예약 시스템 (주간 스케줄)
- [ ] Step 5 — 피드백 시스템
- [ ] Step 6 — 관리자 대시보드 통합
- [ ] Step 7 — 배포 체크리스트 & 운영 문서

## Step 2 변경 사항

### 정책 결정 반영
- **공개 회원가입 없음.** 관리자가 사전 등록한 학생만 로그인 가능.
- 로그인 정보: 학생 **이름 + 생년월일 6자리**.
- 관리자도 같은 로그인 폼에서 마스터 키(ADMIN_NAME / ADMIN_BIRTH)로 진입.

### 추가된 파일
```
src/
├─ middleware.ts                   # Edge 미들웨어 (라우트 보호)
├─ app/
│  ├─ actions/auth.ts              # logoutAction
│  ├─ login/page.tsx               # 로그인 페이지
│  ├─ admin/page.tsx               # 임시 관리자 대시보드
│  └─ api/
│     ├─ auth/
│     │  ├─ login/route.ts
│     │  ├─ logout/route.ts
│     │  └─ me/route.ts
│     └─ admin/students/route.ts   # GET/POST 학생 관리
├─ components/ui/
│  ├─ Button.tsx, Input.tsx, Label.tsx, FormField.tsx
└─ lib/auth/
   ├─ jwt.ts                       # jose JWT 서명/검증
   ├─ password.ts                  # bcrypt 생일 해싱
   ├─ admin.ts                     # 관리자 마스터 키 (상수시간 비교)
   ├─ schema.ts                    # zod 입력 스키마
   ├─ rate-limit.ts                # 1분/5회 제한
   └─ session.ts                   # getSession / requireAuth / requireAdmin

scripts/
└─ add-student.mjs                 # CLI 학생 등록 도구
```

## 설치 & 실행

```bash
npm install
npm run dev
```

`http://localhost:3000` 접속 → "Step 2 Complete" 화면.

## 로그인 테스트

### 1. 관리자 로그인 (DB 등록 불필요)

`/login` 접속 → 아래 값 입력:
- 학생 이름: `mhj331212`
- 생년월일: `iloveyou1!`

→ `/admin` 으로 자동 이동, 임시 대시보드 표시.

### 2. 학생 등록 후 학생 로그인

관리자 UI 완성 전까지는 CLI로 학생 등록:

```bash
node scripts/add-student.mjs "홍길동" 120331 01012345678 "중2, 수학 강함"
```

인자:
1. 학생 이름 (2~20자)
2. 생년월일 6자리 YYMMDD (DB엔 bcrypt 해시만 저장)
3. 학부모 전화번호 (하이픈 무관)
4. 관리자 메모 (선택)

성공 후 `/login` 에서 이름+생일로 로그인 가능.

## 보안 체크리스트

- [x] service_role 키는 서버 전용 (`'server-only'` import로 클라이언트 차단)
- [x] 생년월일은 bcrypt 해시로만 DB 저장
- [x] JWT HS256 서명, HTTP-only + SameSite=Lax + Secure(프로덕션)
- [x] 관리자 마스터 키는 env로만, DB 저장 안 함, 상수시간 비교
- [x] 로그인 rate limit (같은 IP+이름 1분/5회)
- [x] 학생 존재 여부를 드러내지 않는 공통 에러 메시지
- [x] RLS 활성화 + policy 없음 → anon/authenticated DB 차단
- [x] 보안 헤더 (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)

## 알려진 한계 (이름+생일 인증)

본질적 약점:
- 타인이 이름/생일을 알면 로그인 가능 (학교 친구 등)
- 완화책: 관리자 사전 등록 필수, rate limit

추후 보안 강화 옵션:
- 학부모 전화번호를 3번째 요소로 추가 (2FA 흉내)
- 또는 4자리 PIN을 관리자가 학생에게 전달하는 방식

## 다음 단계

Step 2 정상 작동 확인되면 Step 3 요청:
- 메인 페이지 (슬로건 + 메뉴 3개 + 연락처 푸터)
- 강사 소개 페이지 (프로필 + 경력 카드 + 철학 + 커리큘럼 4종)
- 모바일 반응형 전체 점검
