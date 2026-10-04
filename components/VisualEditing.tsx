'use client'

import { VisualEditing as SanityVisualEditing } from 'next-sanity'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Renders the Sanity Visual Editing overlay and refreshes RSC data whenever the
 * Presentation Tool reports a mutation.
 */
export default function VisualEditing(): JSX.Element {
  const router = useRouter()

  useEffect(() => {
    const onFocus = (): void => router.refresh()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [router])

  return (
    <SanityVisualEditing
      refresh={(payload) => {
        if (payload.source === 'mutation' && payload.livePreviewEnabled) {
          return false
        }
        router.refresh()
        return Promise.resolve()
      }}
    />
  )
}
