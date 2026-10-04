'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play, Volume2 } from 'lucide-react'
import type { SpatialLayout, ThemeMode } from '@/sanity/lib/queries'

export const THEME_PRESETS: Record<ThemeMode, { label: string; primaryColor: string; accentColor: string }> = {
  cyberpunk: { label: 'Cyberpunk', primaryColor: '#00F0FF', accentColor: '#FF007F' },
  vaporwave: { label: 'Vaporwave', primaryColor: '#FF71CE', accentColor: '#01CDFE' },
  'zen-minimal': { label: 'Zen Minimal', primaryColor: '#B8B8B8', accentColor: '#6E6E6E' },
  'aurora-glitch': { label: 'Aurora Glitch', primaryColor: '#39FF14', accentColor: '#7B5CFF' },
}

export const LAYOUT_LABELS: Record<SpatialLayout, string> = {
  'floating-grid': 'Floating Grid',
  'circular-orbit': 'Circular Orbit',
  '3d-card-stack': '3D Card Stack',
}

export interface VibeControllerProps {
  themeMode: ThemeMode
  layout: SpatialLayout
  primaryColor: string
  accentColor: string
  soundscapeUrl: string | null
  onThemeChange: (theme: ThemeMode) => void
  onLayoutChange: (layout: SpatialLayout) => void
  onPrimaryChange: (hex: string) => void
  onAccentChange: (hex: string) => void
}

export default function VibeController(props: VibeControllerProps): JSX.Element {
  const {
    themeMode,
    layout,
    primaryColor,
    accentColor,
    soundscapeUrl,
    onThemeChange,
    onLayoutChange,
    onPrimaryChange,
    onAccentChange,
  } = props

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState<boolean>(false)
  const [volume, setVolume] = useState<number>(0.4)
  const [audioError, setAudioError] = useState<boolean>(false)

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  const toggleAudio = async (): Promise<void> => {
    const element = audioRef.current
    if (!element) return
    try {
      if (playing) {
        element.pause()
        setPlaying(false)
      } else {
        element.volume = volume
        await element.play()
        setPlaying(true)
        setAudioError(false)
      }
    } catch {
      setAudioError(true)
      setPlaying(false)
    }
  }

  return (
    <aside className="vibe-glass w-full rounded-3xl p-5 lg:max-w-sm">
      <h2 className="font-display text-sm font-semibold tracking-tight">Vibe controller</h2>
      <p className="mt-1 text-xs text-[color:var(--vibe-ink-soft)]">
        Retune the canvas live. Values mirror the Sanity document fields.
      </p>

      <div className="mt-5 space-y-5">
        <div className="space-y-2">
          <span className="text-xs font-medium text-[color:var(--vibe-ink-soft)]">Theme mode</span>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(THEME_PRESETS) as ThemeMode[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onThemeChange(key)}
                className="rounded-xl border px-3 py-2 text-left text-xs font-medium transition-colors"
                style={{
                  borderColor: themeMode === key ? 'var(--vibe-primary)' : 'var(--vibe-line)',
                  backgroundColor:
                    themeMode === key
                      ? 'color-mix(in oklab, var(--vibe-primary) 16%, transparent)'
                      : 'transparent',
                }}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: THEME_PRESETS[key].primaryColor }}
                  />
                  {THEME_PRESETS[key].label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-medium text-[color:var(--vibe-ink-soft)]">Spatial layout</span>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(LAYOUT_LABELS) as SpatialLayout[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onLayoutChange(key)}
                className="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  borderColor: layout === key ? 'var(--vibe-accent)' : 'var(--vibe-line)',
                  backgroundColor:
                    layout === key
                      ? 'color-mix(in oklab, var(--vibe-accent) 18%, transparent)'
                      : 'transparent',
                }}
              >
                {LAYOUT_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        <ColorField label="Primary colour" value={primaryColor} onChange={onPrimaryChange} />
        <ColorField label="Accent colour" value={accentColor} onChange={onAccentChange} />

        <div className="space-y-2 border-t pt-4" style={{ borderColor: 'var(--vibe-line)' }}>
          <span className="text-xs font-medium text-[color:var(--vibe-ink-soft)]">
            Ambient soundscape
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleAudio}
              disabled={!soundscapeUrl}
              aria-label={playing ? 'Pause soundscape' : 'Play soundscape'}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105 disabled:opacity-40"
              style={{ backgroundColor: 'var(--vibe-primary)', color: '#0b0b12' }}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <Volume2 className="h-4 w-4 shrink-0 text-[color:var(--vibe-ink-soft)]" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              aria-label="Soundscape volume"
              onChange={(event) => setVolume(Number(event.target.value))}
              className="w-full accent-[var(--vibe-accent)]"
            />
          </div>
          {audioError && (
            <p className="text-[11px] text-[color:var(--vibe-ink-soft)]">
              This soundscape could not be loaded. Check the URL in the Studio.
            </p>
          )}
          {soundscapeUrl && (
            <audio
              ref={audioRef}
              src={soundscapeUrl}
              loop
              preload="none"
              onError={() => setAudioError(true)}
            />
          )}
        </div>
      </div>
    </aside>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (hex: string) => void
}): JSX.Element {
  const [draft, setDraft] = useState<string>(value)

  useEffect(() => {
    setDraft(value)
  }, [value])

  const isValid = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(draft)

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-[color:var(--vibe-ink-soft)]">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={isValid ? draft : '#000000'}
          onChange={(event) => {
            setDraft(event.target.value)
            onChange(event.target.value)
          }}
          className="h-9 w-9 cursor-pointer rounded-lg border bg-transparent p-1"
          style={{ borderColor: 'var(--vibe-line)' }}
        />
        <input
          type="text"
          aria-label={`${label} hex`}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(event.target.value)) {
              onChange(event.target.value)
            }
          }}
          className="w-full rounded-lg border bg-transparent px-3 py-1.5 font-mono text-xs outline-none"
          style={{ borderColor: 'var(--vibe-line)' }}
        />
      </div>
    </div>
  )
}
