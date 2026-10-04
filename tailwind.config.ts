import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './sanity/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        vibe: {
          primary: 'var(--vibe-primary)',
          accent: 'var(--vibe-accent)',
          surface: 'var(--vibe-surface)',
          ink: 'var(--vibe-ink)',
          'ink-soft': 'var(--vibe-ink-soft)',
          line: 'var(--vibe-line)',
        },
      },
    },
  },
  plugins: [],
}

export default config
