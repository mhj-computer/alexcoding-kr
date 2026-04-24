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
- [x] **Step 2** — 인증 모듈 (로그인/세션/관리자 분기/rate limit)
- [x] **Step 3** — 메인 페이지 + 강사 소개 + 커리큘럼 ← **현재**
- [ ] Step 4 — 예약 시스템 (주간 스케줄)
- [ ] Step 5 — 피드백 시스템
- [ ] Step 6 — 관리자 대시보드 통합
- [ ] Step 7 — 배포 체크리스트 & 운영 문서

## Step 3 변경 사항

### 신규 페이지
- `/` — 메인 페이지: Hero → Trust Strip → Menu Cards → Approach Preview → Footer
- `/about` — 강사 소개 & 커리큘럼 (프로필 + 경력 타임라인 + 커리큘럼 3종)
- `/booking` — Coming Soon 플레이스홀더 (Step 4에서 구현)
- `/feedback` — Coming Soon 플레이스홀더 (Step 5에서 구현)

### 신규 컴포넌트
```
src/components/
├─ layout/
│  ├─ Header.tsx              # 로고 + 네비 + 로그인 상태
│  └─ Footer.tsx              # 카톡/전화 CTA + 크레딧
├─ home/
│  ├─ Hero.tsx                # 슬로건 "배우는 것이 아닌 만드는 경험으로"
│  ├─ TrustStrip.tsx          # 5,000회 / 6년 / 3→1 / 30+ 숫자 임팩트
│  ├─ MenuCards.tsx           # 3개 주요 메뉴 카드
│  └─ ApproachPreview.tsx     # 프로젝트 기반 + AI 활용 철학
└─ about/
   ├─ AboutHero.tsx           # 프로필 사진 + 소개문
   ├─ CareerTimeline.tsx      # 2020~2025 경력 12개
   └─ CurriculumSection.tsx   # 3개 트랙 (포트폴리오/프로그래밍/게임)
```

### 디자인 포인트
- **Editorial Tech 컨셉** — Playfair Display italic으로 강조어, 넉넉한 여백
- **색상 리듬** — 섹션마다 배경 톤 변화 (mesh → brand-950 → paper → white)
- **amber 포인트** — 키 문구 밑줄 + 어두운 섹션 eyebrow 라벨에만 제한적 사용
- **학부모 친화** — 모든 터치 영역 48px 이상, 본문 16~17px, 포커스 링 명확
- **타이포 중심** — 이미지 리소스 부족을 강한 타이포그래피로 보완

## 설치 & 실행

```bash
npm install
npm run dev
```

http://localhost:3000 접속 → 새로운 메인 페이지 확인.

주요 URL:
- `/` — 메인
- `/about` — 강사 소개 & 커리큘럼
- `/login` — 로그인
- `/admin` — 관리자 (로그인 필요)

## 로그인 테스트

### 관리자
- 이름: `mhj331212`
- 생일: `iloveyou1!`

### 학생 (CLI로 등록 후)
```bash
node scripts/add-student.mjs "홍길동" 120331 01012345678 "메모(선택)"
```

## Vercel 배포

```bash
git add .
git commit -m "Step 3: marketing pages"
git push
```

약 2분 후 https://alexcoding.kr 에 반영.

## 다음 단계

Step 3 정상 작동 확인되면 **Step 4 진행** 이라고 답해주세요.

Step 4 범위:
- 주간 스케줄 UI (월~일, 평일 6슬롯/주말 14슬롯)
- 학생: 예약 생성 (직접 취소는 불가, 전날까지 카톡 연락)
- 관리자: 예약 추가/변경/삭제
- 동시 예약 race condition 방지 (DB partial unique index 활용)
