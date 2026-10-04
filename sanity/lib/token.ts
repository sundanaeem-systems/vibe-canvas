export const projectId: string = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID',
)

export const dataset: string =
  process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'

export const apiVersion: string =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-10-01'

/** Server-only read token used for Draft Mode / Presentation previews. */
export const readToken: string = process.env.SANITY_API_READ_TOKEN ?? ''

/** Shared secret validated by /api/draft and /api/revalidate. */
export const revalidateSecret: string = process.env.SANITY_REVALIDATE_SECRET ?? ''

export const studioUrl = '/studio'

function assertValue<T>(value: T | undefined, errorMessage: string): T {
  if (value === undefined) {
    throw new Error(errorMessage)
  }
  return value
}
