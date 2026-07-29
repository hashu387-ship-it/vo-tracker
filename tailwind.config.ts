import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

/**
 * Design system for the HW2C05 Commercial Register.
 *
 * Built on the Red Sea Global corporate palette — Deep Navy #0A2533,
 * Lagoon Teal #008C95, Sand Gold #C5A065, Light Sand #F7F5F0 — extended into a
 * full UI scale. Every colour is exposed as an HSL CSS variable in globals.css so
 * light and dark are two selected sets of steps rather than an automatic flip.
 */
const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1600px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        canvas: 'hsl(var(--canvas))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        // Brand anchors, available directly where a literal brand colour is wanted.
        navy: {
          50: '#eef3f6',
          100: '#d3e0e6',
          200: '#a6c1cd',
          300: '#6e94a6',
          400: '#3f6a80',
          500: '#1d4358',
          600: '#123448',
          700: '#0d2b3b',
          800: '#0a2533',
          900: '#071b26',
          950: '#04121a',
        },
        lagoon: {
          50: '#e6f6f7',
          100: '#c0e9ec',
          200: '#8ad7dd',
          300: '#4dc2cb',
          400: '#22a0aa',
          500: '#00949e',
          600: '#008c95',
          700: '#00727c',
          800: '#005c65',
          900: '#004a52',
        },
        sand: {
          50: '#faf7f1',
          100: '#f2ead9',
          200: '#e5d3b2',
          300: '#d5b986',
          400: '#c5a065',
          500: '#b98430',
          600: '#a8792f',
          700: '#8a6226',
          800: '#6d4d1f',
          900: '#523a17',
        },
        // Status semantics — reserved, never reused as a chart series colour.
        good: 'hsl(var(--status-good))',
        warning: 'hsl(var(--status-warning))',
        serious: 'hsl(var(--status-serious))',
        critical: 'hsl(var(--status-critical))',
        neutral: 'hsl(var(--status-neutral))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(10 37 51 / 0.04), 0 1px 3px 0 rgb(10 37 51 / 0.06)',
        lift: '0 4px 12px -2px rgb(10 37 51 / 0.10), 0 2px 6px -2px rgb(10 37 51 / 0.06)',
        pop: '0 12px 32px -8px rgb(10 37 51 / 0.22)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-up': 'fade-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.8s infinite',
      },
    },
  },
  plugins: [animate],
};

export default config;
