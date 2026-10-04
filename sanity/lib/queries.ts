import { groq } from 'next-sanity'

export type ThemeMode = 'cyberpunk' | 'vaporwave' | 'zen-minimal' | 'aurora-glitch'
export type SpatialLayout = 'floating-grid' | 'circular-orbit' | '3d-card-stack'

export interface InteractiveNode {
  _key: string
  label: string
  description: string
  xPos: number
  yPos: number
  nodeTheme: string
}

export interface VibeCanvasDocument {
  _id: string
  _updatedAt: string
  title: string
  themeMode: ThemeMode
  primaryColor: string
  accentColor: string
  spatialLayout: SpatialLayout
  soundscapeUrl: string | null
  heroHeading: string
  subheading: string
  interactiveNodes: InteractiveNode[]
}

export const VIBE_CANVAS_QUERY = groq`
  *[_type == "vibeCanvas" && reviewStatus == "live"] | order(_updatedAt desc)[0] {
    _id,
    _updatedAt,
    title,
    themeMode,
    primaryColor,
    accentColor,
    spatialLayout,
    soundscapeUrl,
    heroHeading,
    subheading,
    "interactiveNodes": coalesce(interactiveNodes[]{
      _key,
      label,
      description,
      xPos,
      yPos,
      nodeTheme
    }, [])
  }
`

export const VIBE_CANVAS_BY_ID_QUERY = groq`
  *[_type == "vibeCanvas" && _id == $id && reviewStatus == "live"][0] {
    _id,
    _updatedAt,
    title,
    themeMode,
    primaryColor,
    accentColor,
    spatialLayout,
    soundscapeUrl,
    heroHeading,
    subheading,
    "interactiveNodes": coalesce(interactiveNodes[]{
      _key, label, description, xPos, yPos, nodeTheme
    }, [])
  }
`
