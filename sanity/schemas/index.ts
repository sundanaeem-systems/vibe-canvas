import type { SchemaTypeDefinition } from 'sanity'
import { vibeCanvas } from './vibeCanvas'

export const schemaTypes: SchemaTypeDefinition[] = [vibeCanvas]

export const schema: { types: SchemaTypeDefinition[] } = {
  types: schemaTypes,
}
