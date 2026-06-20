export type Source = 'tiktok' | 'instagram'

export interface RelatedAsset {
  ticker: string
  name: string
  change: number
}

export interface ReelItem {
  kind: 'reel'
  id: string
  source: Source
  handle: string
  caption: string
  meta: string
  /** two-stop gradient for the poster */
  poster: [string, string]
  related: RelatedAsset[]
}

export interface YapItem {
  kind: 'yap'
  id: string
  body: string
  meta: string
  /** present once Signal AI has weighed in */
  aiReply?: string
}

export type FeedItem = ReelItem | YapItem

export const feed: FeedItem[] = [
  {
    kind: 'reel',
    id: 'r1',
    source: 'tiktok',
    handle: '@lessons.in.money',
    caption: 'Why everyone in tech is quietly buying physical gold right now',
    meta: 'Forwarded from TikTok · 2h ago',
    poster: ['#1f54c7', '#0c1838'],
    related: [
      { ticker: 'GLD', name: 'Gold ETF', change: 1.24 },
      { ticker: 'NEM', name: 'Newmont', change: 2.01 },
    ],
  },
  {
    kind: 'yap',
    id: 'y1',
    body: 'Thinking about trimming emerging markets and rotating into Swiss quality. Gut feeling, want a second opinion.',
    meta: 'Voice memo · 1h ago',
    aiReply:
      'Reasonable instinct. Trimming EM and adding Swiss quality lowers your drawdown risk with little give-up on expected return. Clara has it flagged to pressure-test with you.',
  },
  {
    kind: 'reel',
    id: 'r2',
    source: 'instagram',
    handle: '@buildwealth',
    caption: 'The 2026 AI capex cycle in 60 seconds — who actually profits',
    meta: 'Forwarded from Instagram · 5h ago',
    poster: ['#3b78ec', '#122a72'],
    related: [
      { ticker: 'NVDA', name: 'Nvidia', change: 3.42 },
      { ticker: 'TSM', name: 'TSMC', change: 1.88 },
      { ticker: 'VRT', name: 'Vertiv', change: -0.74 },
    ],
  },
  {
    kind: 'yap',
    id: 'y2',
    body: 'Remind me to ask about tax-loss harvesting before year end.',
    meta: 'Voice memo · yesterday',
  },
]

/** Reels we can "receive" when the user shares one from TikTok/Instagram. */
export const sampleShares: Omit<ReelItem, 'id' | 'meta'>[] = [
  {
    kind: 'reel',
    source: 'instagram',
    handle: '@macro.daily',
    caption: 'The yen carry trade is unwinding — what it means for risk assets',
    poster: ['#3b78ec', '#0e2150'],
    related: [
      { ticker: 'EWJ', name: 'Japan ETF', change: -1.32 },
      { ticker: 'UUP', name: 'US Dollar', change: 0.41 },
    ],
  },
  {
    kind: 'reel',
    source: 'tiktok',
    handle: '@founderfin',
    caption: 'Private credit is eating the banks’ lunch — should you allocate?',
    poster: ['#1f54c7', '#122a72'],
    related: [
      { ticker: 'ARCC', name: 'Ares Capital', change: 0.92 },
      { ticker: 'BX', name: 'Blackstone', change: 1.74 },
    ],
  },
]

/** Canned transcripts so the mic demo feels alive. */
export const sampleTranscripts = [
  'Pull up my tech exposure — feels a bit heavy after this week’s run.',
  'Can we look at adding some gold before the Fed meeting?',
  'What would it take to get my cash position down to 3%?',
]
