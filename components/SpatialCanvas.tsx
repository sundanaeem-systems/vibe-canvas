'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import VibeController from './VibeController'
import type {
  InteractiveNode,
  SpatialLayout,
  ThemeMode,
  VibeCanvasDocument,
} from '@/sanity/lib/queries'

export interface SpatialCanvasProps {
  vibe: VibeCanvasDocument
}

function nodeColor(node: InteractiveNode): string {
  return node.nodeTheme === 'accent' ? 'var(--vibe-accent)' : 'var(--vibe-primary)'
}

function positionFor(
  layout: SpatialLayout,
  node: InteractiveNode,
  index: number,
  total: number,
): { left: string; top: string } {
  if (layout === 'circular-orbit') {
    const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2
    const radius = 34
    return {
      left: `${50 + Math.cos(angle) * radius}%`,
      top: `${50 + Math.sin(angle) * (radius * 0.78)}%`,
    }
  }
  if (layout === '3d-card-stack') {
    return {
      left: `${50 + index * 3.2 - (total * 3.2) / 2}%`,
      top: `${46 + index * 3.6 - (total * 3.6) / 2}%`,
    }
  }
  return {
    left: `${50 + node.xPos * 0.82}%`,
    top: `${50 + node.yPos * 0.86}%`,
  }
}

function cardTransform(
  layout: SpatialLayout,
  index: number,
  total: number,
): { rotateX: number; rotateY: number; z: number; scale: number } {
  if (layout === '3d-card-stack') {
    const depth = index - (total - 1) / 2
    return {
      rotateX: -8,
      rotateY: depth * 6,
      z: -Math.abs(depth) * 60,
      scale: 1 - Math.abs(depth) * 0.04,
    }
  }
  return { rotateX: 0, rotateY: 0, z: 0, scale: 1 }
}

export default function SpatialCanvas({ vibe }: SpatialCanvasProps): JSX.Element {
  const [themeMode, setThemeMode] = useState<ThemeMode>(vibe.themeMode)
  const [layout, setLayout] = useState<SpatialLayout>(vibe.spatialLayout)
  const [primaryColor, setPrimaryColor] = useState<string>(vibe.primaryColor)
  const [accentColor, setAccentColor] = useState<string>(vibe.accentColor)
  const [activeKey, setActiveKey] = useState<string | null>(null)

  const nodes = vibe.interactiveNodes ?? []

  const handleThemeChange = (next: ThemeMode): void => {
    setThemeMode(next)
    void confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.3 },
      colors: [primaryColor, accentColor],
    })
  }

  return (
    <div
      data-vibe={themeMode}
      style={
        {
          '--vibe-primary': primaryColor,
          '--vibe-accent': accentColor,
        } as React.CSSProperties
      }
      className="vibe-shell min-h-screen"
    >
      <div className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="h-8 w-8 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, var(--vibe-primary), var(--vibe-accent))',
              }}
            />
            <span className="font-display text-sm font-semibold tracking-tight">{vibe.title}</span>
          </div>
        </header>

        <section className="mt-14 max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="vibe-gradient-text font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
          >
            {vibe.heroHeading}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: 'easeOut' }}
            className="mt-5 max-w-xl text-base leading-relaxed text-[color:var(--vibe-ink-soft)]"
          >
            {vibe.subheading}
          </motion.p>
        </section>

        <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-start">
          <div
            className="relative h-[38rem] min-w-0 flex-1 select-none sm:h-[34rem]"
            style={{ perspective: '1000px' }}
          >
            <div className="vibe-grid-lines pointer-events-none absolute inset-0 rounded-3xl" aria-hidden />

            {layout === 'circular-orbit' && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border"
                style={{ borderColor: 'var(--vibe-line)' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              />
            )}

            <AnimatePresence mode="popLayout">
              {nodes.map((node, index) => {
                const pos = positionFor(layout, node, index, nodes.length)
                const transform = cardTransform(layout, index, nodes.length)
                const isActive = activeKey === node._key

                return (
                  <motion.button
                    key={node._key}
                    type="button"
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{
                      opacity: 1,
                      ...transform,
                      scale: isActive ? transform.scale + 0.06 : transform.scale,
                      y: layout === 'floating-grid' ? [0, -10, 0] : 0,
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      layout: { type: 'spring', stiffness: 120, damping: 18 },
                      y: {
                        duration: 5 + index * 0.6,
                        repeat: layout === 'floating-grid' ? Infinity : 0,
                        ease: 'easeInOut',
                      },
                      default: { type: 'spring', stiffness: 140, damping: 20 },
                    }}
                    onClick={() => setActiveKey(isActive ? null : node._key)}
                    className="vibe-glass vibe-node-glow absolute w-56 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-2xl p-4 text-left"
                    style={{
                      ...pos,
                      zIndex: isActive ? 40 : 10 + index,
                      borderColor: isActive ? nodeColor(node) : 'var(--vibe-line)',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <span
                      aria-hidden
                      className="mb-2 block h-1.5 w-8 rounded-full"
                      style={{ backgroundColor: nodeColor(node) }}
                    />
                    <span className="font-display block text-sm font-semibold tracking-tight">
                      {node.label}
                    </span>
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.span
                          key="description"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 block overflow-hidden text-xs leading-relaxed text-[color:var(--vibe-ink-soft)]"
                        >
                          {node.description}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>

          <VibeController
            themeMode={themeMode}
            layout={layout}
            primaryColor={primaryColor}
            accentColor={accentColor}
            soundscapeUrl={vibe.soundscapeUrl}
            onThemeChange={handleThemeChange}
            onLayoutChange={setLayout}
            onPrimaryChange={setPrimaryColor}
            onAccentChange={setAccentColor}
          />
        </div>
      </div>
    </div>
  )
}
