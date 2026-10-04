import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse, type NextRequest } from 'next/server'
import { validatePreviewUrl } from '@sanity/preview-url-secret'
import { client } from '@/sanity/lib/client'
import { readToken, revalidateSecret } from '@/sanity/lib/token'

export async function GET(request: NextRequest): Promise<NextResponse | never> {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug') ?? '/'

  // Path 1: plain shared-secret preview link.
  if (secret) {
    if (!revalidateSecret || secret !== revalidateSecret) {
      return NextResponse.json({ message: 'Invalid preview secret' }, { status: 401 })
    }
    const draft = await draftMode()
    draft.enable()
    redirect(slug)
  }

  // Path 2: Presentation Tool preview-url-secret handshake.
  if (!readToken) {
    return NextResponse.json(
      { message: 'Missing SANITY_API_READ_TOKEN' },
      { status: 500 },
    )
  }

  const { isValid, redirectTo = '/' } = await validatePreviewUrl(
    client.withConfig({ token: readToken }),
    request.url,
  )

  if (!isValid) {
    return NextResponse.json({ message: 'Invalid preview secret' }, { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()
  redirect(redirectTo)
}
