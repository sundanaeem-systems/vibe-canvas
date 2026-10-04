'use client'

import { useCallback, useMemo } from 'react'
import { Badge, Button, Card, Flex, Grid, Stack, Text, TextInput } from '@sanity/ui'
import { set, unset, type StringInputProps } from 'sanity'

interface ColorPreset {
  name: string
  hex: string
}

const PRESETS: ColorPreset[] = [
  { name: 'Neon Cyan', hex: '#00F0FF' },
  { name: 'Vapor Magenta', hex: '#FF007F' },
  { name: 'Zen Charcoal', hex: '#121212' },
  { name: 'Aurora Lime', hex: '#39FF14' },
  { name: 'Vapor Pink', hex: '#FF71CE' },
  { name: 'Electric Violet', hex: '#7B5CFF' },
  { name: 'Solar Amber', hex: '#FFB800' },
  { name: 'Ghost White', hex: '#F5F5F5' },
]

type ContrastGrade = 'AAA' | 'AA' | 'Fail'

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim()
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0').slice(0, 6)
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ]
}

/** WCAG 2.1 relative luminance: L = 0.2126 R + 0.7152 G + 0.0722 B (linearised). */
export function relativeLuminance(hex: string): number {
  const channel = (value: number): number => {
    const s = value / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const [r, g, b] = hexToRgb(hex)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrastRatio(foreground: string, background: string): number {
  const lf = relativeLuminance(foreground)
  const lb = relativeLuminance(background)
  const [hi, lo] = lf > lb ? [lf, lb] : [lb, lf]
  return (hi + 0.05) / (lo + 0.05)
}

export function contrastGrade(ratio: number): ContrastGrade {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  return 'Fail'
}

const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export function ColorPalettePicker(props: StringInputProps) {
  const { value = '', onChange, elementProps } = props
  const isValid = HEX_PATTERN.test(value)

  const handleChange = useCallback(
    (next: string) => {
      onChange(next ? set(next) : unset())
    },
    [onChange],
  )

  const analysis = useMemo(() => {
    if (!isValid) return null
    const onBlack = contrastRatio(value, '#000000')
    const onWhite = contrastRatio(value, '#FFFFFF')
    const best = onBlack >= onWhite ? onBlack : onWhite
    return {
      onBlack,
      onWhite,
      best,
      bestBackground: onBlack >= onWhite ? '#000000' : '#FFFFFF',
      grade: contrastGrade(best),
    }
  }, [isValid, value])

  const gradeTone = (grade: ContrastGrade) =>
    grade === 'AAA' ? 'positive' : grade === 'AA' ? 'caution' : 'critical'

  const gradeLabel = (grade: ContrastGrade) =>
    grade === 'Fail' ? 'Fail - Low Contrast' : `${grade} - Passed`

  return (
    <Stack space={4}>
      <Stack space={3}>
        <Text size={1} weight="medium">
          Presets
        </Text>
        <Grid columns={[2, 4]} gap={2}>
          {PRESETS.map((preset) => {
            const selected = value.toLowerCase() === preset.hex.toLowerCase()
            return (
              <Button
                key={preset.hex}
                mode={selected ? 'default' : 'ghost'}
                tone={selected ? 'primary' : 'default'}
                padding={2}
                onClick={() => handleChange(preset.hex)}
                title={`${preset.name} ${preset.hex}`}
              >
                <Flex align="center" gap={2}>
                  <Card
                    radius={2}
                    style={{
                      backgroundColor: preset.hex,
                      width: 16,
                      height: 16,
                      border: '1px solid rgba(0,0,0,0.2)',
                    }}
                  />
                  <Text size={1}>{preset.name}</Text>
                </Flex>
              </Button>
            )
          })}
        </Grid>
      </Stack>

      <Stack space={3}>
        <Text size={1} weight="medium">
          Custom hex
        </Text>
        <Flex gap={2} align="center">
          <input
            type="color"
            aria-label="Colour picker"
            value={isValid ? value : '#000000'}
            onChange={(event) => handleChange(event.currentTarget.value.toUpperCase())}
            style={{
              width: 40,
              height: 36,
              padding: 2,
              border: '1px solid var(--card-border-color)',
              borderRadius: 6,
              background: 'transparent',
              cursor: 'pointer',
            }}
          />
          <TextInput
            {...elementProps}
            value={value}
            placeholder="#00F0FF"
            onChange={(event) => handleChange(event.currentTarget.value)}
            customValidity={
              value && !isValid ? 'Enter a valid hex colour, e.g. #00F0FF' : undefined
            }
          />
        </Flex>
      </Stack>

      <Card padding={3} radius={2} shadow={1} tone="transparent" border>
        <Stack space={3}>
          <Flex align="center" justify="space-between" gap={2}>
            <Text size={1} weight="medium">
              WCAG 2.1 contrast
            </Text>
            {analysis ? (
              <Badge tone={gradeTone(analysis.grade)} mode="outline">
                {gradeLabel(analysis.grade)}
              </Badge>
            ) : (
              <Badge tone="default" mode="outline">
                Awaiting valid hex
              </Badge>
            )}
          </Flex>

          {analysis && (
            <Stack space={2}>
              <Flex gap={2}>
                <Card
                  flex={1}
                  padding={3}
                  radius={2}
                  style={{ backgroundColor: '#000000', color: value }}
                >
                  <Text size={1} style={{ color: value }}>
                    On black — {analysis.onBlack.toFixed(2)}:1
                  </Text>
                </Card>
                <Card
                  flex={1}
                  padding={3}
                  radius={2}
                  style={{ backgroundColor: '#FFFFFF', color: value }}
                >
                  <Text size={1} style={{ color: value }}>
                    On white — {analysis.onWhite.toFixed(2)}:1
                  </Text>
                </Card>
              </Flex>
              <Text size={1} muted>
                Best pairing: {analysis.bestBackground} at {analysis.best.toFixed(2)}:1. AA needs
                4.5:1, AAA needs 7:1.
              </Text>
            </Stack>
          )}
        </Stack>
      </Card>
    </Stack>
  )
}

export default ColorPalettePicker
