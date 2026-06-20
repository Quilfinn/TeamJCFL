const CHF = new Intl.NumberFormat('de-CH', {
  style: 'currency',
  currency: 'CHF',
  maximumFractionDigits: 0,
})

const CHF_PRECISE = new Intl.NumberFormat('de-CH', {
  style: 'currency',
  currency: 'CHF',
  maximumFractionDigits: 0,
})

/** 4_284_910 -> "CHF 4,284,910" (Swiss apostrophe grouping) */
export function formatCHF(value: number): string {
  return CHF.format(Math.round(value)).replace(/ /g, ' ')
}

export function formatCHFPrecise(value: number): string {
  return CHF_PRECISE.format(Math.round(value)).replace(/ /g, ' ')
}

/** Compact for tiles: 1_920_000 -> "1.92M", 250_000 -> "250K" */
export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (value >= 10_000) return `${Math.round(value / 1_000)}K`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return `${Math.round(value)}`
}

export function formatPct(value: number, withSign = true): string {
  const sign = value > 0 ? '+' : ''
  return `${withSign ? sign : ''}${value.toFixed(2)}%`
}

export function formatSignedCHF(value: number): string {
  const sign = value >= 0 ? '+' : '−'
  return `${sign}${formatCHF(Math.abs(value)).replace('CHF ', 'CHF ')}`
}
