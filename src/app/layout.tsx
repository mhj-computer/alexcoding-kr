import type { Metadata, Viewport } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://alexcoding.kr'),
  title: {
    default: 'AlexCoding | 코딩을 만드는 경험으로 배우는 1:1 수업',
    template: '%s | AlexCoding',
  },
  description:
    'AI와 프로젝트 기반으로 실력을 만드는 초·중·고 1:1 맞춤 코딩 수업. 포트폴리오, 자격증, 대회, 게임 제작까지 학생의 목표에 맞춰 설계합니다.',
  keywords: [
    '코딩 과외',
    '초등 코딩',
    '중등 코딩',
    '고등 코딩',
    'AI 코딩 교육',
    'COS Pro',
    '정보올림피아드',
    'Python 과외',
    'Unity 게임 제작',
    '1:1 코딩 수업',
    '인천 코딩 과외',
  ],
  openGraph: {
    title: 'AlexCoding | 만드는 경험으로 배우는 1:1 코딩',
    description:
      'AI와 프로젝트 기반으로 실력을 만드는 초·중·고 1:1 맞춤 코딩 수업',
    locale: 'ko_KR',
    type: 'website',
    siteName: 'AlexCoding',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0b3d5c',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col bg-paper">
        <Header />
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
