import { useState } from 'react'
import { useDocumentOperation, type DocumentActionProps, type DocumentActionDescription } from 'sanity'
import { useToast } from '@sanity/ui'

interface RevalidateResponse {
  revalidated?: boolean
  now?: number
  message?: string
}

/**
 * Custom document action that publishes the document and then purges the
 * Next.js cache through /api/revalidate, reporting status with a Sanity toast.
 */
export function deployVibeAction(props: DocumentActionProps): DocumentActionDescription {
  const { id, type, draft, onComplete } = props
  const { publish } = useDocumentOperation(id, type)
  const toast = useToast()
  const [isDeploying, setIsDeploying] = useState(false)
  const status = (props.published ?? draft)?.reviewStatus
  const isCleared = status === 'approved' || status === 'live'

  const revalidate = async (): Promise<RevalidateResponse> => {
    const response = await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.NEXT_PUBLIC_SANITY_REVALIDATE_SECRET,
        documentId: id,
      }),
    })

    if (!response.ok) {
      throw new Error(`Revalidate failed with status ${response.status}`)
    }

    return (await response.json()) as RevalidateResponse
  }

  return {
    label: isDeploying ? 'Deploying…' : 'Deploy Vibe',
    tone: 'positive',
    icon: () => '🚀',
    disabled: !isCleared || isDeploying || publish.disabled !== false,
    title: isCleared
      ? undefined
      : 'Deploy Vibe unlocks once the review status is Approved or Live.',
    onHandle: async () => {
      setIsDeploying(true)

      try {
        publish.execute()
        toast.push({
          status: 'success',
          title: 'Published',
          description: draft?.title ? String(draft.title) : 'Document published to production.',
        })

        const result = await revalidate()
        toast.push({
          status: 'success',
          title: 'Cache purged',
          description: result.message ?? 'Front-end cache revalidated and vibe deployed.',
        })
      } catch (error) {
        toast.push({
          status: 'error',
          title: 'Deploy incomplete',
          description:
            error instanceof Error
              ? `Published, but cache purge failed: ${error.message}`
              : 'Published, but cache purge failed.',
        })
      } finally {
        setIsDeploying(false)
        onComplete()
      }
    },
  }
}

export default deployVibeAction
