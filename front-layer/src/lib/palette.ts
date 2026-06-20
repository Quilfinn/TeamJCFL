/** Blue ramp from deepest navy (largest holding) to light sky (smallest). */
export const BLUE_RAMP = [
  '#0c1838',
  '#0e2150',
  '#123073',
  '#16409a',
  '#1f54c7',
  '#3b78ec',
  '#6fa1f3',
  '#a8c6f7',
] as const

/** Tiles ranked 0..n by value get progressively lighter shades. */
export function shadeForRank(rank: number, count: number): string {
  if (count <= 1) return BLUE_RAMP[2]
  // Spread the used ramp across available shades, deepest first.
  const span = Math.min(count, BLUE_RAMP.length)
  const idx = Math.round((rank / (count - 1)) * (span - 1))
  return BLUE_RAMP[Math.min(idx, BLUE_RAMP.length - 1)]
}

/** Light text on deep shades, deep navy ink on the two lightest shades. */
export function textOn(hex: string): string {
  const i = BLUE_RAMP.indexOf(hex as (typeof BLUE_RAMP)[number])
  return i >= BLUE_RAMP.length - 2 ? '#0a1230' : '#ffffff'
}

export function subTextOn(hex: string): string {
  const i = BLUE_RAMP.indexOf(hex as (typeof BLUE_RAMP)[number])
  return i >= BLUE_RAMP.length - 2 ? 'rgba(10,18,48,0.62)' : 'rgba(255,255,255,0.66)'
}

/** Frosted-glass fill: a soft light bloom over a dimensional shade. */
export function tileBg(hex: string): string {
  return [
    `radial-gradient(88% 70% at 26% 18%, color-mix(in srgb, ${hex} 52%, #ffffff) 0%, rgba(255,255,255,0) 56%)`,
    `radial-gradient(70% 80% at 88% 96%, color-mix(in srgb, ${hex} 86%, #05060f) 0%, rgba(0,0,0,0) 50%)`,
    `linear-gradient(160deg, color-mix(in srgb, ${hex} 82%, #ffffff) 0%, ${hex} 54%, color-mix(in srgb, ${hex} 92%, #05060f) 100%)`,
  ].join(', ')
}

/** Inset top highlight + soft ambient shadow that reads as glass. */
export function tileShadow(hex: string): string {
  const light = BLUE_RAMP.indexOf(hex as (typeof BLUE_RAMP)[number]) >= BLUE_RAMP.length - 2
  const hi = light ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)'
  return `inset 0 1px 0 ${hi}, inset 0 0 0 0.5px rgba(255,255,255,0.08), 0 1px 2px rgba(8,14,32,0.06), 0 12px 26px -14px rgba(8,14,32,0.22)`
}
