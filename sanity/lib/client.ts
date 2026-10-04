import { createClient, type QueryParams } from 'next-sanity'
import { draftMode } from 'next/headers'
import { apiVersion, dataset, projectId, readToken, studioUrl } from './token'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
  stega: {
    enabled: process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview',
    studioUrl,
  },
})

interface SanityFetchOptions<T> {
  query: string
  params?: QueryParams
  tags?: string[]
  revalidate?: number | false
  /** Fallback returned when the query yields nothing. */
  fallback?: T
}

/**
 * Draft-aware fetch helper. When Next.js Draft Mode is on it reads drafts with
 * the server-side token, enables stega encoding and skips the CDN.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags = ['vibeCanvas'],
  revalidate = 60,
  fallback,
}: SanityFetchOptions<T>): Promise<T> {
  const { isEnabled: isDraft } = await draftMode()

  if (isDraft && !readToken) {
    throw new Error('Draft Mode requires the SANITY_API_READ_TOKEN environment variable.')
  }

  const result = await client
    .withConfig({
      token: isDraft ? readToken : undefined,
      useCdn: isDraft ? false : true,
      perspective: isDraft ? 'previewDrafts' : 'published',
      stega: {
        enabled: isDraft || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview',
        studioUrl,
      },
    })
    .fetch<T>(query, params, {
      next: isDraft ? { revalidate: 0 } : { revalidate, tags },
    })

  if ((result === null || result === undefined) && fallback !== undefined) {
    return fallback
  }

  return result
}
