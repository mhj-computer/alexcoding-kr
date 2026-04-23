import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '코딩 과외 | 만드는 경험으로 배우는 1:1 코딩',
    template: '%s | 코딩 과외',
  },
  description:
    'AI와 프로젝트 기반으로 실력을 만드는 초·중·고 1:1 맞춤 코딩 수업. 포트폴리오, 자격증, 대회, 게임 제작 커리큘럼 제공.',
  keywords: ['코딩 과외', '초등 코딩', '중등 코딩', '고등 코딩', 'AI 코딩', 'COS Pro', '정보올림피아드', 'Python', 'Unity', '1:1 과외'],
  openGraph: {
    title: '코딩 과외 | 만드는 경험으로 배우는 1:1 코딩',
    description: 'AI와 프로젝트 기반으로 실력을 만드는 1:1 코딩 수업',
    locale: 'ko_KR',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0b3d5c',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
