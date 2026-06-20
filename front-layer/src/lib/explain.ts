import type { FeedItem, RelatedAsset, Source } from '../data/feed'

export type Assessment = 'positive' | 'neutral' | 'negative'

export interface ExplainPayload {
  source: Source | 'yap'
  contextLabel: string
  handle?: string
  brief: string
  /** drives which actions (and whether a chart) are shown */
  assessment: Assessment
  related?: RelatedAsset[]
  suggestionTitle: string
}

const REEL_BRIEFS: Record<
  string,
  Omit<ExplainPayload, 'source' | 'contextLabel' | 'handle' | 'related'>
> = {
  r1: {
    assessment: 'positive',
    brief:
      'Real rates are rolling over while central banks keep buying bullion — historically a strong tailwind for gold. The thesis is sound, and a small hedge fits your book cleanly.',
    suggestionTitle: 'Add 2% to your gold hedge',
  },
  r2: {
    assessment: 'negative',
    brief:
      'The AI-capex names are reasonable, but they’re already priced for perfection and your tech sleeve is heavy at 17%. I wouldn’t add here without a human gut-check.',
    suggestionTitle: 'Talk it through before adding tech',
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
  return {
    source: 'yap',
    contextLabel: item.body,
    assessment: 'neutral',
    brief:
      'I checked your memo against the book. Trimming EM into Swiss quality is well inside your mandate and triggers no tax event — reasonable to stage with an alert.',
    related: [{ ticker: 'EWJ', name: 'EM / Japan', change: -1.32 }],
    suggestionTitle: 'Stage the EM → Swiss rotation',
  }
}
