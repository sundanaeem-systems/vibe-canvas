import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest): Promise<never> {
  const draft = await draftMode()
  draft.disable()

  const { searchParams } = new URL(request.url)
  redirect(searchParams.get('slug') ?? '/')
}
