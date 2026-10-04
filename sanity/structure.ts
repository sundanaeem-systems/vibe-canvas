import { createElement } from 'react'
import type { StructureResolver } from 'sanity/structure'
import { CheckCircle2, ClipboardCheck, FilePen, Globe, Layers } from 'lucide-react'

interface StageList {
  id: string
  title: string
  status: 'draft' | 'in-review' | 'approved' | 'live'
  icon: typeof Layers
}

const STAGES: StageList[] = [
  { id: 'needs-review', title: 'Needs Review', status: 'in-review', icon: ClipboardCheck },
  { id: 'approved', title: 'Approved, not live', status: 'approved', icon: CheckCircle2 },
  { id: 'live', title: 'Live', status: 'live', icon: Globe },
  { id: 'drafts', title: 'All Drafts', status: 'draft', icon: FilePen },
]

/** Desk structure that splits vibeCanvas documents by editorial review stage. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Vibe Canvas')
    .items([
      ...STAGES.map((stage) =>
        S.listItem()
          .id(stage.id)
          .title(stage.title)
          .icon(() => createElement(stage.icon, { size: 18 }))
          .child(
            S.documentTypeList('vibeCanvas')
              .title(stage.title)
              .filter('_type == "vibeCanvas" && coalesce(reviewStatus, "draft") == $status')
              .params({ status: stage.status }),
          ),
      ),
      S.divider(),
      S.listItem()
        .id('all-vibe-canvases')
        .title('All Vibe Canvases')
        .icon(() => createElement(Layers, { size: 18 }))
        .child(S.documentTypeList('vibeCanvas').title('All Vibe Canvases')),
    ])
