import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Brand - 깊고 차분한 네이비 블루 (신뢰감)
        brand: {
          50: '#f0f6ff',
          100: '#dcebfe',
          200: '#bdd9fe',
          300: '#8ebdfd',
          400: '#5796fa',
          500: '#2d7ff9',
          600: '#1a62ee',
          700: '#154edb',
          800: '#173fb0',
          900: '#0b3d5c',  // 주 사용 네이비
          950: '#071f34',
        },
        // Ink - 텍스트 컬러
        ink: {
          DEFAULT: '#0f172a',
          muted: '#475569',
          soft: '#64748b',
        },
        // Paper - 배경 계열
        paper: {
          DEFAULT: '#fcfcfd',
          subtle: '#f8fafc',
          border: '#e2e8f0',
        },
        // Accent - 따뜻한 강조 (친근함)
        accent: {
          DEFAULT: '#f59e0b', // 호박색 - 포인트
          soft: '#fef3c7',
        },
        success: '#10b981',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Pretendard', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'ui-serif', 'Georgia', 'serif'],
      },
      fontSize: {
        'display-xl': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2rem, 4.5vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
      },
      boxShadow: {
        'card': '0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.06)',
        'card-hover': '0 4px 8px rgba(15,23,42,0.06), 0 12px 32px rgba(15,23,42,0.10)',
        'focus-ring': '0 0 0 3px rgba(45,127,249,0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out both',
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
