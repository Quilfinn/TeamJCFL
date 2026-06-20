import type { FeedItem, RelatedAsset, Source } from '../data/feed'

export interface ExplainPayload {
  source: Source | 'yap'
  contextLabel: string
  handle?: string
  brief: string
  points: string[]
  related?: RelatedAsset[]
  suggestionTitle: string
  suggestionMeta?: string
}

const REEL_BRIEFS: Record<string, Omit<ExplainPayload, 'source' | 'contextLabel' | 'handle' | 'related'>> = {
  r1: {
    brief:
      'The clip argues that real interest rates are rolling over while central banks keep buying bullion — historically a strong tailwind for gold. The thesis is directionally sound, but it skips the risk: a hot inflation print could snap the trade.',
    points: [
      'You already hold CHF 96K in gold-linked names — roughly 2.2% of the book.',
      'A move to a 4–5% hedge is defensible given your risk profile.',
      'Concentration risk is low; this fits as a diversifier, not a core bet.',
    ],
    suggestionTitle: 'Add 2% to your gold hedge',
    suggestionMeta: '~CHF 86\'000',
  },
  r2: {
    brief:
      'The reel maps the 2026 AI capex cycle to the names that capture the spend — compute, foundry and power/cooling. The picks are reasonable, but most are already priced for perfection. Signal is mixed — don\'t act without a clearer thesis.',
    points: [
      'Your tech & growth sleeve is CHF 712K — already 17% of the book.',
      'Adding here raises concentration without a clear edge; wait for a better entry.',
      'Vertiv is the most interesting contrarian angle if you want exposure.',
    ],
    suggestionTitle: 'Hold — check with Clara before any moves',
    suggestionMeta: 'AI capex signal is mixed',
  },
}

export function buildExplain(item: FeedItem): ExplainPayload {
  if (item.kind === 'reel') {
    const b = REEL_BRIEFS[item.id] ?? REEL_BRIEFS.r1
    return {
      source: item.source,
      contextLabel: item.caption,
      handle: item.handle,
      related: item.related,
      ...b,
    }
  }
  if (item.kind === 'yap') {
    return {
      source: 'yap',
      contextLabel: item.body,
      brief:
        'Signal AI read your memo and checked it against your current allocation. The instinct holds up — here is the context before you raise it with Clara.',
      points: [
        'Emerging markets are 4.6% of the book; trimming to ~3% is well inside your mandate.',
        'Swiss quality lowers volatility without giving up much expected return.',
        'No tax event triggered at this size — clean to execute.',
      ],
      suggestionTitle: 'Draft the rotation for Clara to review',
      suggestionMeta: 'EM → Swiss quality',
    }
  }
  return {
    source: 'yap',
    contextLabel: item.headline,
    brief: item.body,
    points: [],
    suggestionTitle: 'Discuss with Clara',
  }
}
