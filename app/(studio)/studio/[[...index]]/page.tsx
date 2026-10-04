import { NextStudio } from 'next-sanity/studio'
import type { Metadata, Viewport } from 'next'
import config from '@/sanity.config'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Vibe Canvas Studio',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
}

export default function StudioPage() {
  return <NextStudio config={config} />
}
