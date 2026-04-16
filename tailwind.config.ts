import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.mdx',
  ],
  theme: {
    extend: {
      colors: {
        bg:     '#0A0C10',
        sur:    '#111620',
        sur2:   '#181F2E',
        gold:   '#C9A227',
        gold2:  '#E8C547',
        red:    '#C8281E',
        green:  '#27AE60',
        orange: '#E67E22',
        blue:   '#3498DB',
      },
      fontFamily: {
        cond:  ['Barlow Condensed', 'Arial', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        sans:  ['DM Sans', '-apple-system', 'sans-serif'],
      },
      maxWidth: {
        content: '1280px',
      },
    },
  },
  plugins: [],
} satisfies Config
