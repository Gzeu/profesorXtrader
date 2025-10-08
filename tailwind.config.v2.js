/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // MultiversX Brand Colors
        mvx: {
          primary: '#1B46C2',
          secondary: '#00D4FF', 
          gold: '#FFB800',
          dark: '#0A0E27',
          light: '#F8FAFC',
          gray: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
            400: '#94A3B8',
            500: '#64748B',
            600: '#475569',
            700: '#334155',
            800: '#1E293B',
            900: '#0F172A',
            950: '#0A0E27',
          },
        },
        // Trading Status Colors
        trading: {
          profit: '#10B981',
          loss: '#EF4444',
          neutral: '#6B7280',
          warning: '#F59E0B',
          info: '#3B82F6',
        },
        // Chart & Analytics Colors
        chart: {
          primary: '#1B46C2',
          secondary: '#00D4FF',
          tertiary: '#FFB800',
          success: '#10B981',
          danger: '#EF4444',
          warning: '#F59E0B',
          info: '#3B82F6',
          purple: '#8B5CF6',
          pink: '#EC4899',
        },
        // Enhanced shadcn colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        mono: ['var(--font-fira-code)', ...fontFamily.mono],
        heading: ['var(--font-cal-sans)', ...fontFamily.sans],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'slide-left': 'slide-left 0.3s ease-out',
        'slide-right': 'slide-right 0.3s ease-out',
        'bounce-subtle': 'bounce-subtle 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
        'gradient-y': 'gradient-y 3s ease infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
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
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-left': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-right': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center bottom'
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 20px rgba(27, 70, 194, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(0, 212, 255, 0.8)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mvx-gradient': 'linear-gradient(135deg, #1B46C2 0%, #00D4FF 100%)',
        'mvx-gradient-dark': 'linear-gradient(135deg, #0A0E27 0%, #1B46C2 100%)',
        'trading-profit': 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
        'trading-loss': 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
      },
      boxShadow: {
        'mvx': '0 8px 32px rgba(27, 70, 194, 0.3)',
        'mvx-hover': '0 12px 40px rgba(27, 70, 194, 0.4)',
        'trading': '0 4px 20px rgba(16, 185, 129, 0.2)',
        'danger': '0 4px 20px rgba(239, 68, 68, 0.2)',
        'glow': '0 0 20px rgba(27, 70, 194, 0.5)',
        'inner-light': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    
    // Custom MultiversX Components Plugin
    function({ addComponents, theme }) {
      addComponents({
        '.mvx-card': {
          background: 'linear-gradient(145deg, rgba(27, 70, 194, 0.1) 0%, rgba(0, 212, 255, 0.05) 100%)',
          border: '1px solid rgba(27, 70, 194, 0.2)',
          backdropFilter: 'blur(20px)',
          borderRadius: theme('borderRadius.lg'),
          padding: theme('spacing.6'),
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.mvx-card:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 40px rgba(27, 70, 194, 0.4)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
        },
        '.mvx-button': {
          background: 'linear-gradient(135deg, #1B46C2 0%, #00D4FF 100%)',
          color: theme('colors.white'),
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          borderRadius: theme('borderRadius.md'),
          fontWeight: theme('fontWeight.semibold'),
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 8px 32px rgba(27, 70, 194, 0.3)',
        },
        '.mvx-button:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 40px rgba(27, 70, 194, 0.4)',
        },
        '.mvx-button:disabled': {
          opacity: '0.5',
          cursor: 'not-allowed',
          transform: 'none',
        },
        '.trading-card-profit': {
          background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.05) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
        },
        '.trading-card-loss': {
          background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(248, 113, 113, 0.05) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        },
        '.glass-card': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: theme('borderRadius.xl'),
        },
        '.gradient-text': {
          background: 'linear-gradient(135deg, #1B46C2 0%, #00D4FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
        '.animate-gradient': {
          backgroundSize: '200% 200%',
          animation: 'gradient-x 3s ease infinite',
        },
      })
    },
    
    // Custom Utilities Plugin
    function({ addUtilities }) {
      addUtilities({
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
        '.text-shadow-lg': {
          textShadow: '0 4px 8px rgba(0,0,0,0.2)',
        },
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(27, 70, 194, 0.3) transparent',
        },
        '.scrollbar-webkit': {
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(27, 70, 194, 0.3)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(27, 70, 194, 0.5)',
          },
        },
      })
    },
  ],
}