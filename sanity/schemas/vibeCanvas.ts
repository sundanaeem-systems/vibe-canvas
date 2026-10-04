import { defineArrayMember, defineField, defineType } from 'sanity'
import { ColorPalettePicker } from '../components/ColorPalettePicker'

export const vibeCanvas = defineType({
  name: 'vibeCanvas',
  title: 'Vibe Canvas',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(2).max(120),
    }),
    defineField({
      name: 'themeMode',
      title: 'Theme Mode',
      type: 'string',
      initialValue: 'cyberpunk',
      options: {
        list: [
          { title: 'Cyberpunk', value: 'cyberpunk' },
          { title: 'Vaporwave', value: 'vaporwave' },
          { title: 'Zen Minimal', value: 'zen-minimal' },
          { title: 'Aurora Glitch', value: 'aurora-glitch' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'primaryColor',
      title: 'Primary Color',
      type: 'string',
      initialValue: '#00F0FF',
      components: { input: ColorPalettePicker },
      validation: (Rule) =>
        Rule.required().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
          name: 'hex color',
          invert: false,
        }),
    }),
    defineField({
      name: 'accentColor',
      title: 'Accent Color',
      type: 'string',
      initialValue: '#FF007F',
      components: { input: ColorPalettePicker },
      validation: (Rule) =>
        Rule.required().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
          name: 'hex color',
          invert: false,
        }),
    }),
    defineField({
      name: 'spatialLayout',
      title: 'Spatial Layout',
      type: 'string',
      initialValue: 'floating-grid',
      options: {
        list: [
          { title: 'Floating Grid', value: 'floating-grid' },
          { title: 'Circular Orbit', value: 'circular-orbit' },
          { title: '3D Card Stack', value: '3d-card-stack' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'soundscapeUrl',
      title: 'Ambient Soundscape URL',
      type: 'url',
      description: 'Direct link to an MP3/OGG/WAV audio stream.',
      validation: (Rule) =>
        Rule.uri({ scheme: ['http', 'https'] }).custom((value) => {
          if (!value) return true
          return /\.(mp3|ogg|wav|m4a)(\?.*)?$/i.test(value)
            ? true
            : 'Must point at an .mp3, .ogg, .wav or .m4a stream'
        }),
    }),
    defineField({
      name: 'heroHeading',
      title: 'Hero Heading',
      type: 'string',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(400),
    }),
    defineField({
      name: 'interactiveNodes',
      title: 'Interactive Nodes',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'interactiveNode',
          fields: [
            defineField({
              name: 'label',
              type: 'string',
              validation: (Rule) => Rule.required().max(60),
            }),
            defineField({ name: 'description', type: 'text', rows: 3 }),
            defineField({
              name: 'xPos',
              title: 'X Position',
              type: 'number',
              initialValue: 0,
              validation: (Rule) => Rule.required().min(-50).max(50),
            }),
            defineField({
              name: 'yPos',
              title: 'Y Position',
              type: 'number',
              initialValue: 0,
              validation: (Rule) => Rule.required().min(-50).max(50),
            }),
            defineField({
              name: 'nodeTheme',
              type: 'string',
              initialValue: 'primary',
              options: {
                list: [
                  { title: 'Primary', value: 'primary' },
                  { title: 'Accent', value: 'accent' },
                ],
                layout: 'radio',
              },
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'description' },
          },
        }),
      ],
    }),
    defineField({
      name: 'reviewStatus',
      title: 'Review Status',
      type: 'string',
      initialValue: 'draft',
      description: 'Moved forward with the workflow actions in the document menu.',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'In Review', value: 'in-review' },
          { title: 'Approved', value: 'approved' },
          { title: 'Live', value: 'live' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'reviewNotes',
      title: 'Review Notes',
      type: 'text',
      rows: 3,
      description: 'Saved into the review history with the next stage change.',
    }),
    defineField({
      name: 'reviewHistory',
      title: 'Review History',
      type: 'array',
      readOnly: true,
      description: 'Append-only audit trail written by the workflow actions.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'reviewHistoryEntry',
          fields: [
            defineField({ name: 'fromStatus', type: 'string' }),
            defineField({ name: 'toStatus', type: 'string' }),
            defineField({ name: 'actor', type: 'string' }),
            defineField({ name: 'note', type: 'string' }),
            defineField({ name: 'timestamp', type: 'datetime' }),
          ],
          preview: {
            select: { from: 'fromStatus', to: 'toStatus', actor: 'actor', timestamp: 'timestamp' },
            prepare: ({ from, to, actor, timestamp }) => ({
              title: `${String(from)} → ${String(to)}`,
              subtitle: `${String(actor ?? 'unknown')} · ${timestamp ? new Date(String(timestamp)).toLocaleString() : ''}`,
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'reviewStatus' },
  },
})
