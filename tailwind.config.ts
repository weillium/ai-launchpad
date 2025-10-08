import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './agents/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f1115',
        surface: '#171b23',
        accent: '#3b82f6',
        muted: '#1f2430',
        border: '#2a2f3a',
        text: {
          DEFAULT: '#f5f7fa',
          muted: '#9aa2b1'
        }
      },
      boxShadow: {
        glow: '0 0 20px rgba(59, 130, 246, 0.25)'
      },
      borderRadius: {
        xl: '1.25rem'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        fadeIn: 'fadeIn 250ms ease-out'
      }
    }
  },
  plugins: []
};

export default config;
