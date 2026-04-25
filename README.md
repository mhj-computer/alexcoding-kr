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
- [x] **Step 4.5** — 요일 기반 공개 스케줄로 전환
- [x] **Step 5** — 피드백 시스템 ← **현재**
- [ ] Step 6 — 관리자 학생 CRUD 통합
- [ ] Step 7 — 결제 연동 + 학부모 직접 예약 재활성화

## Step 5 구현 내용

### 정책
- 학생 로그인: 본인 피드백만 조회. 최신순 정렬.
- 관리자 로그인: 학생 목록 → 학생 선택 → 피드백 CRUD.
- 피드백 ↔ 수업(booking) 연결 안 함 (피드백은 학생별 글 목록).
- 이미지 첨부: 최대 5장, 각 5MB.

### 신규 API
- `GET /api/feedback?studentId=...` — 학생/관리자 분기 조회 (최신순)
- `POST /api/admin/feedback` — 관리자 피드백 작성
- `PATCH /api/admin/feedback/[id]` — 수정 (이미지 변경 시 storage 정리)
- `DELETE /api/admin/feedback/[id]` — 삭제 (첨부 이미지도 함께)
- `POST /api/admin/upload` — 이미지 업로드 (multipart)

### 신규 페이지
- `/feedback` — 학생 본인 피드백 목록
- `/admin/feedback` — 학생 목록 (가나다순, 피드백 카운트)
- `/admin/feedback/[studentId]` — 학생별 피드백 작성·수정·삭제

### 신규 컴포넌트
```
src/components/feedback/
├─ FeedbackCard.tsx              # 단일 피드백 표시 (학생/관리자 공용)
├─ FeedbackForm.tsx              # 작성·수정 통합 폼 (이미지 업로드 포함)
├─ AdminStudentFeedback.tsx      # 관리자 학생별 피드백 통합 패널
└─ ImageGallery.tsx              # 썸네일 그리드 + 라이트박스 모달
```

### 신규 라이브러리
```
src/lib/feedback/
├─ schema.ts                     # zod (create/update)
├─ storage.ts                    # Supabase Storage 업로드/삭제 + signed URL
└─ queries.ts                    # 피드백 조회 + signed URL 갱신
```

### 보안 / UX
- 이미지는 **Private 버킷** + 1주일짜리 signed URL.
- 페이지 진입할 때마다 서버에서 URL 재발급 → 만료 신경 안 써도 됨.
- 학생은 자기 피드백만 볼 수 있도록 API 레벨 권한 검증 (session.sub 비교).
- 관리자 학생별 페이지: 잘못된 UUID는 즉시 404.
- 피드백 삭제 시 첨부 이미지도 storage에서 삭제 (orphan 방지).
- 라이트박스: ESC 닫기, 좌우 화살표 이동, 카운터 표시.

## 설치 & 실행

### Storage 버킷 확인 (중요)

Supabase Studio → **Storage** → `feedback-images` 버킷이 있어야 합니다.
없으면 만드세요:

1. Storage → **New bucket**
2. Name: `feedback-images`
3. **Public bucket 체크 해제** (Private)
4. Create

### 의존성 & 실행

```bash
npm install
npm run dev
```

## 사용 흐름

### 강사 (관리자)
1. `/login` → `mhj331212` / `iloveyou1!`
2. `/admin` → "피드백 관리" 카드
3. `/admin/feedback` → 학생 가나다순 목록
4. 학생 선택 → `/admin/feedback/[id]`
5. 상단 "+ 새 피드백 작성하기" → 폼 펼침
6. 텍스트 작성 + (선택) 이미지 첨부 → "피드백 등록"
7. 기존 피드백 카드: "수정" 또는 "삭제" 버튼

### 학생 (학부모)
1. `/login` → 학생 이름 + 생년월일
2. 헤더 "학생 피드백" → `/feedback`
3. 본인 피드백 최신순 표시
4. 이미지 클릭 → 라이트박스 (좌우 화살표, ESC 닫기)

## 시나리오 테스트

### A. 피드백 작성·표시
1. 관리자 로그인 → `/admin/feedback` → 홍길동 클릭
2. "+ 새 피드백 작성하기" → 텍스트 + 이미지 1~2장 → 등록
3. 토스트 "피드백이 등록되었습니다" 확인
4. 로그아웃 → 학생(`홍길동`/`120331`) 로그인 → `/feedback`
5. 방금 작성한 피드백 카드 확인 → 이미지 클릭 → 라이트박스 동작

### B. 수정·삭제
1. 관리자로 돌아가서 같은 학생 피드백 페이지
2. 카드의 "수정" → 폼이 인라인으로 펼침 → 텍스트 변경 → "수정 저장"
3. 학생 화면에서 "수정됨" 표시 확인
4. 다른 카드 "삭제" → 확인 박스 → "삭제 확인" → 사라짐

### C. 권한 분리
1. 학생 A 로그인 → `/feedback` → A의 피드백만 보임
2. 학생 B 로그인 → A의 피드백 안 보임
3. 학생이 직접 `/admin/feedback` 접속 시도 → 미들웨어가 홈으로 리다이렉트

## 다음 단계

Step 6 — 관리자 학생 CRUD 통합 (CLI 대신 UI로).

이후 Step 7 — 결제 연동 + 학부모 직접 예약 재활성화. 이때 `bookings` 테이블이 다시 살아나며, 피드백은 옵션으로 booking_id에 연결할 수 있게 확장 가능.
