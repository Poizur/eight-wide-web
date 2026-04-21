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
        // V2 tokens
        bg:        '#F7F6F2',
        white:     '#FFFFFF',
        ink:       '#111111',
        ink2:      '#3D3D3D',
        muted:     '#888880',
        subtle:    '#BDBDB5',
        border:    '#E4E3DC',
        red:       '#C8281E',
        'red-bg':  '#FDF1F0',
        gold:      '#A8831A',
        'gold-bg': '#FBF6EA',
        green:     '#1A7A42',
        'green-bg':'#EEF7F2',
        blue:      '#1565C0',
        purple:    '#7B3FA0',

        // Legacy aliases (mapped to V2)
        sur:    '#FFFFFF',
        sur2:   '#F7F6F2',
        gold2:  '#C8281E',
        orange: '#E67E22',
      },
      boxShadow: {
        card:      '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hv': '0 8px 24px rgba(0,0,0,0.10)',
      },
      fontFamily: {
        cond:  ['Plus Jakarta Sans', '-apple-system', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        sans:  ['Plus Jakarta Sans', '-apple-system', 'sans-serif'],
      },
      maxWidth: {
        content: '1280px',
      },
    },
  },
  plugins: [],
} satisfies Config
