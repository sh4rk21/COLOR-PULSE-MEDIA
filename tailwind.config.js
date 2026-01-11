/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        hero: ['clamp(3.5rem, 10vw, 8rem)', { lineHeight: '0.95', fontWeight: '500', letterSpacing: '-0.03em' }],
        display: ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.1', fontWeight: '500', letterSpacing: '-0.03em' }],
        section: ['clamp(2rem, 5vw, 3rem)', { lineHeight: '1.15', fontWeight: '500', letterSpacing: '-0.02em' }],
      },
      spacing: {
        section: 'clamp(80px, 15vh, 160px)',
        block: 'clamp(48px, 10vh, 96px)',
      },
      colors: {
        dark: {
          DEFAULT: '#0a0a0a',
          card: '#121212',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        light: {
          DEFAULT: '#f5f5f5',
          subtle: '#d1d1d1',
          muted: '#a1a1a1',
        },
        accent: {
          DEFAULT: '#007aff',
          hover: '#0062cc',
          light: 'rgba(0, 122, 255, 0.15)',
        },
      },
    },
  },
  plugins: [],
}