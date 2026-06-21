export type Source = 'tiktok' | 'instagram'

/** Signal AI's read on a shared reel — drives the recommendation pill. */
export type SignalLevel = 'red' | 'orange' | 'green'
export interface SignalRec {
  level: SignalLevel
  label: string
  note?: string
}

/** A folder name. Folders are user-managed, so this is a free string. */
export type Topic = string

export type SkinKey = 'navy' | 'ocean' | 'petrol' | 'indigo' | 'steel' | 'sand'

/**
 * Each pass is dressed in the same glossy blue ramp as the portfolio bento.
 * The value is the base shade; components run it through tileBg/tileShadow.
 */
export const SKINS: Record<SkinKey, string> = {
  navy: '#0e2150',
  ocean: '#16409a',
  petrol: '#123073',
  indigo: '#1f54c7',
  steel: '#0c1838',
  sand: '#173a9c',
}

/** Skins rotated through as new folders are created. */
export const FOLDER_SKINS: SkinKey[] = ['ocean', 'navy', 'indigo', 'petrol', 'steel', 'sand']

export interface Folder {
  name: string
  skin: SkinKey
}

/** Seed folders the client starts with. */
export const initialFolders: Folder[] = [
  { name: 'AI & Semis', skin: 'ocean' },
  { name: 'Portfolio moves', skin: 'navy' },
  { name: 'Planning', skin: 'indigo' },
  { name: 'Safe havens', skin: 'petrol' },
]

export interface RelatedAsset {
  ticker: string
  name: string
  change: number
}

interface Common {
  topic: Topic
  status: 'new' | 'filed'
  skin: SkinKey
}

export interface ReelItem extends Common {
  kind: 'reel'
  id: string
  source: Source
  handle: string
  caption: string
  meta: string
  /** two-stop gradient for the poster */
  poster: [string, string]
  related: RelatedAsset[]
  /** Signal AI's recommendation, attached once the reel is shared. */
  signal?: SignalRec
}

export interface YapItem extends Common {
  kind: 'yap'
  id: string
  body: string
  meta: string
  /** present once Signal AI has weighed in */
  aiReply?: string
}

export type FeedItem = ReelItem | YapItem

export const feed: FeedItem[] = [
  // —— on the stack (not yet addressed) ——
  {
    kind: 'reel',
    id: 'r1',
    source: 'tiktok',
    handle: '@lessons.in.money',
    caption: 'Why everyone in tech is quietly buying physical gold right now',
    meta: 'TikTok · 2h ago',
    status: 'new',
    topic: '',
    skin: 'navy',
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
    status: 'new',
    topic: '',
    skin: 'sand',
  },

  // —— already filed into folders ——
  {
    kind: 'reel',
    id: 'r2',
    source: 'tiktok',
    handle: '@buildwealth',
    caption: 'The 2026 AI capex cycle in 60 seconds — who actually profits',
    meta: 'TikTok · 5h ago',
    status: 'filed',
    topic: 'AI & Semis',
    skin: 'ocean',
    poster: ['#3b78ec', '#122a72'],
    related: [
      { ticker: 'NVDA', name: 'Nvidia', change: 3.42 },
      { ticker: 'TSM', name: 'TSMC', change: 1.88 },
      { ticker: 'VRT', name: 'Vertiv', change: -0.74 },
    ],
  },
  {
    kind: 'reel',
    id: 'r3',
    source: 'tiktok',
    handle: '@chip.signal',
    caption: 'Custom silicon is coming for Nvidia — the names quietly building it',
    meta: 'TikTok · yesterday',
    status: 'filed',
    topic: 'AI & Semis',
    skin: 'indigo',
    poster: ['#3b78ec', '#0e2150'],
    related: [
      { ticker: 'AVGO', name: 'Broadcom', change: 2.12 },
      { ticker: 'MRVL', name: 'Marvell', change: 1.45 },
    ],
  },
  {
    kind: 'reel',
    id: 'r4',
    source: 'tiktok',
    handle: '@macro.daily',
    caption: 'The yen carry trade is unwinding — what it means for risk assets',
    meta: 'TikTok · 2d ago',
    status: 'filed',
    topic: 'Portfolio moves',
    skin: 'steel',
    poster: ['#3b78ec', '#0e2150'],
    related: [
      { ticker: 'EWJ', name: 'Japan ETF', change: -1.32 },
      { ticker: 'UUP', name: 'US Dollar', change: 0.41 },
    ],
  },
  {
    kind: 'reel',
    id: 'r5',
    source: 'tiktok',
    handle: '@founderfin',
    caption: 'Private credit is eating the banks’ lunch — should you allocate?',
    meta: 'TikTok · 3d ago',
    status: 'filed',
    topic: 'Portfolio moves',
    skin: 'petrol',
    poster: ['#1f54c7', '#122a72'],
    related: [
      { ticker: 'ARCC', name: 'Ares Capital', change: 0.92 },
      { ticker: 'BX', name: 'Blackstone', change: 1.74 },
    ],
  },
  {
    kind: 'yap',
    id: 'y2',
    body: 'Remind me to ask about tax-loss harvesting before year end.',
    meta: 'Voice memo · yesterday',
    status: 'filed',
    topic: 'Planning',
    skin: 'navy',
  },
  {
    kind: 'yap',
    id: 'y3',
    body: 'Want to top up the gold position before the Fed meeting — flag it for Clara.',
    meta: 'Voice memo · 2d ago',
    status: 'filed',
    topic: 'Safe havens',
    skin: 'petrol',
  },
]

/** Reels we can "receive" when the user shares one from TikTok/Instagram. */
export const sampleShares: Omit<ReelItem, 'id' | 'meta' | 'status' | 'topic' | 'skin'>[] = [
  {
    kind: 'reel',
    source: 'tiktok',
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

/** Names the client is tracking (the star / watchlist). */
export const watchlist: RelatedAsset[] = [
  { ticker: 'GLD', name: 'Gold ETF', change: 1.24 },
  { ticker: 'NVDA', name: 'Nvidia', change: 3.42 },
  { ticker: 'BX', name: 'Blackstone', change: 1.74 },
  { ticker: 'EWJ', name: 'Japan ETF', change: -1.32 },
]

/** Canned transcripts so the mic demo feels alive. */
export const sampleTranscripts = [
  'Pull up my tech exposure — feels a bit heavy after this week’s run.',
  'Can we look at adding some gold before the Fed meeting?',
  'What would it take to get my cash position down to 3%?',
]
