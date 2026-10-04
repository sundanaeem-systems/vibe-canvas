import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { revalidateSecret } from '@/sanity/lib/token'

interface RevalidatePayload {
  secret?: string
  documentId?: string
  path?: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!revalidateSecret) {
    return NextResponse.json(
      { revalidated: false, message: 'SANITY_REVALIDATE_SECRET is not configured' },
      { status: 500 },
    )
  }

  let payload: RevalidatePayload = {}
  try {
    payload = (await request.json()) as RevalidatePayload
  } catch {
    payload = {}
  }

  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const provided = payload.secret ?? bearer ?? request.nextUrl.searchParams.get('secret') ?? ''

  if (provided !== revalidateSecret) {
    return NextResponse.json(
      { revalidated: false, message: 'Invalid revalidation secret' },
      { status: 401 },
    )
  }

  revalidateTag('vibeCanvas')
  revalidatePath(payload.path ?? '/')

  return NextResponse.json({
    revalidated: true,
    now: Date.now(),
    documentId: payload.documentId ?? null,
    message: 'Cache purged for tag "vibeCanvas" and path "/".',
  })
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { message: 'POST a JSON body { secret, documentId } to revalidate.' },
    { status: 405 },
  )
}
