import { useState } from 'react'
import {
  useCurrentUser,
  useDocumentOperation,
  type DocumentActionComponent,
  type DocumentActionDescription,
  type DocumentActionProps,
} from 'sanity'
import { useToast } from '@sanity/ui'

export type ReviewStatus = 'draft' | 'in-review' | 'approved' | 'live'

export interface ReviewHistoryEntry {
  _key: string
  _type: 'reviewHistoryEntry'
  fromStatus: ReviewStatus
  toStatus: ReviewStatus
  actor: string
  note: string
  timestamp: string
}

interface RevalidateResponse {
  revalidated?: boolean
  now?: number
  message?: string
}

interface TransitionConfig {
  from: ReviewStatus
  to: ReviewStatus
  label: string
  tone: DocumentActionDescription['tone']
  icon: string
  successTitle: string
  revalidate?: boolean
}

/** Reads the current review status, preferring the published version. */
export function readReviewStatus(props: DocumentActionProps): ReviewStatus {
  const source = props.published ?? props.draft
  const value = source?.reviewStatus
  return value === 'in-review' || value === 'approved' || value === 'live' ? value : 'draft'
}

function readReviewNotes(props: DocumentActionProps): string {
  const value = (props.draft ?? props.published)?.reviewNotes
  return typeof value === 'string' ? value : ''
}

async function revalidateFrontEnd(documentId: string): Promise<RevalidateResponse> {
  const response = await fetch('/api/revalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.NEXT_PUBLIC_SANITY_REVALIDATE_SECRET,
      documentId,
    }),
  })

  if (!response.ok) {
    throw new Error(`Revalidate failed with status ${response.status}`)
  }

  return (await response.json()) as RevalidateResponse
}

/**
 * Builds a document action that moves reviewStatus from one stage to the next,
 * appends an audit entry to reviewHistory and publishes the result.
 */
function createTransitionAction(config: TransitionConfig): DocumentActionComponent {
  function TransitionAction(props: DocumentActionProps): DocumentActionDescription | null {
    const { id, type, onComplete } = props
    const { patch, publish } = useDocumentOperation(id, type)
    const currentUser = useCurrentUser()
    const toast = useToast()
    const [isRunning, setIsRunning] = useState(false)

    if (readReviewStatus(props) !== config.from) return null

    return {
      label: isRunning ? `${config.label}…` : config.label,
      tone: config.tone,
      icon: () => config.icon,
      disabled: isRunning,
      onHandle: async () => {
        setIsRunning(true)

        const entry: ReviewHistoryEntry = {
          _key: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
          _type: 'reviewHistoryEntry',
          fromStatus: config.from,
          toStatus: config.to,
          actor: currentUser?.name ?? 'unknown',
          note: readReviewNotes(props),
          timestamp: new Date().toISOString(),
        }

        try {
          patch.execute([
            { set: { reviewStatus: config.to, reviewNotes: '' } },
            { setIfMissing: { reviewHistory: [] } },
            { insert: { after: 'reviewHistory[-1]', items: [entry] } },
          ])
          publish.execute()

          toast.push({
            status: 'success',
            title: config.successTitle,
            description: `Moved from ${config.from} to ${config.to}.`,
          })

          if (config.revalidate) {
            const result = await revalidateFrontEnd(id)
            toast.push({
              status: 'success',
              title: 'Cache purged',
              description: result.message ?? 'Front-end cache revalidated and vibe is live.',
            })
          }
        } catch (error) {
          toast.push({
            status: 'error',
            title: 'Transition incomplete',
            description:
              error instanceof Error ? error.message : 'The review stage could not be updated.',
          })
        } finally {
          setIsRunning(false)
          onComplete()
        }
      },
    }
  }

  return TransitionAction
}

export const submitForReviewAction = createTransitionAction({
  from: 'draft',
  to: 'in-review',
  label: 'Submit for Review',
  tone: 'primary',
  icon: '📝',
  successTitle: 'Submitted for review',
})

export const approveAction = createTransitionAction({
  from: 'in-review',
  to: 'approved',
  label: 'Approve',
  tone: 'positive',
  icon: '✅',
  successTitle: 'Approved',
})

export const sendBackToDraftAction = createTransitionAction({
  from: 'in-review',
  to: 'draft',
  label: 'Send Back to Draft',
  tone: 'caution',
  icon: '↩️',
  successTitle: 'Sent back to draft',
})

export const goLiveAction = createTransitionAction({
  from: 'approved',
  to: 'live',
  label: 'Go Live',
  tone: 'positive',
  icon: '🌐',
  successTitle: 'Live',
  revalidate: true,
})

export const workflowActions: DocumentActionComponent[] = [
  submitForReviewAction,
  approveAction,
  sendBackToDraftAction,
  goLiveAction,
]
