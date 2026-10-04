import { draftMode } from 'next/headers'
import Link from 'next/link'
import SpatialCanvas from '@/components/SpatialCanvas'
import VisualEditing from '@/components/VisualEditing'
import { sanityFetch } from '@/sanity/lib/client'
import { VIBE_CANVAS_QUERY, type VibeCanvasDocument } from '@/sanity/lib/queries'

export const revalidate = 60

const FALLBACK: VibeCanvasDocument = {
  _id: 'fallback',
  _updatedAt: new Date(0).toISOString(),
  title: 'Vibe Canvas',
  themeMode: 'cyberpunk',
  primaryColor: '#00F0FF',
  accentColor: '#FF007F',
  spatialLayout: 'floating-grid',
  soundscapeUrl: null,
  heroHeading: 'Interactive AI Spatial Content Studio',
  subheading:
    'No vibeCanvas document found yet. Open /studio, publish one, and this canvas will reshape itself around it.',
  interactiveNodes: [
    {
      _key: 'seed-1',
      label: 'Open the Studio',
      description: 'Visit /studio and create your first Vibe Canvas document.',
      xPos: -24,
      yPos: -14,
      nodeTheme: 'primary',
    },
    {
      _key: 'seed-2',
      label: 'Deploy Vibe',
      description: 'Use the custom Deploy Vibe action to publish and purge the cache.',
      xPos: 22,
      yPos: 16,
      nodeTheme: 'accent',
    },
  ],
}

export default async function HomePage() {
  const { isEnabled: isDraft } = await draftMode()

  const vibe = await sanityFetch<VibeCanvasDocument>({
    query: VIBE_CANVAS_QUERY,
    tags: ['vibeCanvas'],
    fallback: FALLBACK,
  })

  return (
    <>
      <SpatialCanvas vibe={vibe ?? FALLBACK} />
      {/*
        Plain <a>, not next/link: Sanity Studio owns its own router and needs
        a full page load to mount correctly. Client-side navigation here
        leaves the Studio shell blank.
        Pinned to the TOP (not bottom) so it never collides with the
        VibeController panel, which runs to the bottom of the page, or with
        Next.js's own dev-mode toolbar (bottom-left, dev only).
      */}
      <a
        href="/studio"
        className="fixed top-4 right-4 z-50 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs text-white/80 backdrop-blur transition hover:bg-black/80 hover:text-white"
      >
        Edit in Studio →
      </a>
      {isDraft && (
        <>
          <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/20 bg-black/80 px-4 py-2 text-xs text-white backdrop-blur">
            Draft Mode is on ·{' '}
            <Link href="/api/disable-draft" className="underline">
              exit preview
            </Link>
          </div>
          <VisualEditing />
        </>
      )}
    </>
  )
}
