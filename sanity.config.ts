'use client'

import { defineConfig, type DocumentActionComponent } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { presentationTool } from '@sanity/presentation'
import { schema } from './sanity/schemas'
import { deployVibeAction } from './sanity/actions/deployVibeAction'
import { workflowActions } from './sanity/actions/workflowActions'
import { structure } from './sanity/structure'
import { apiVersion, dataset, projectId, studioUrl } from './sanity/lib/token'

export default defineConfig({
  name: 'vibe-canvas-studio',
  title: 'Vibe Canvas Studio',
  basePath: studioUrl,
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({ structure }),
    presentationTool({
      previewUrl: {
        origin: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
        preview: '/',
        previewMode: {
          enable: '/api/draft',
          disable: '/api/disable-draft',
        },
      },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  document: {
    actions: (prev, context) => {
      if (context.schemaType !== 'vibeCanvas') return prev
      const withoutPublish = prev.filter((action) => action.action !== 'publish')
      return [...workflowActions, deployVibeAction as DocumentActionComponent, ...withoutPublish]
    },
  },
})
