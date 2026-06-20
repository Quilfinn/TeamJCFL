export interface AssetNode {
  id: string
  name: string
  /** Market value in CHF */
  value: number
  /** Day change, percent */
  change: number
  children?: AssetNode[]
}

/**
 * Mock portfolio for a "young money" UHNW client.
 * Total ≈ CHF 4.28M. Backend will replace this shape 1:1.
 */
export const portfolio: AssetNode = {
  id: 'root',
  name: 'Total portfolio',
  value: 0, // computed below
  change: 2.41,
  children: [
    {
      id: 'equity',
      name: 'Equity',
      value: 1_924_000,
      change: 3.18,
      children: [
        { id: 'eq-growth', name: 'Tech & growth', value: 712_000, change: 4.62 },
        { id: 'eq-swiss', name: 'Swiss blue chips', value: 388_000, change: 1.04 },
        { id: 'eq-us', name: 'US large cap', value: 451_000, change: 2.71 },
        { id: 'eq-em', name: 'Emerging mkts', value: 196_000, change: -1.12 },
        { id: 'eq-theme', name: 'Thematic ETFs', value: 177_000, change: 5.39 },
      ],
    },
    {
      id: 'alts',
      name: 'Alternatives',
      value: 738_000,
      change: 4.05,
      children: [
        { id: 'alt-pe', name: 'Private equity', value: 286_000, change: 0.0 },
        { id: 'alt-crypto', name: 'Digital assets', value: 214_000, change: 8.74 },
        { id: 'alt-hedge', name: 'Hedge funds', value: 142_000, change: 0.62 },
        { id: 'alt-art', name: 'Art & collectibles', value: 96_000, change: 1.5 },
      ],
    },
    {
      id: 'realestate',
      name: 'Real estate',
      value: 712_000,
      change: 0.34,
      children: [
        { id: 're-ch', name: 'Swiss residential', value: 402_000, change: 0.12 },
        { id: 're-reit', name: 'Global REITs', value: 188_000, change: 0.91 },
        { id: 're-comm', name: 'Direct commercial', value: 122_000, change: 0.28 },
      ],
    },
    {
      id: 'fixed',
      name: 'Fixed income',
      value: 656_000,
      change: -0.21,
      children: [
        { id: 'fi-govt', name: 'Govt bonds', value: 264_000, change: -0.34 },
        { id: 'fi-ig', name: 'IG credit', value: 248_000, change: -0.11 },
        { id: 'fi-mm', name: 'Money market', value: 144_000, change: 0.02 },
      ],
    },
    {
      id: 'cash',
      name: 'Cash',
      value: 252_000,
      change: 0.0,
      children: [
        { id: 'cash-chf', name: 'CHF', value: 142_000, change: 0.0 },
        { id: 'cash-usd', name: 'USD', value: 74_000, change: 0.18 },
        { id: 'cash-eur', name: 'EUR', value: 36_000, change: -0.09 },
      ],
    },
  ],
}

function sumChildren(node: AssetNode): number {
  if (!node.children) return node.value
  return node.children.reduce((acc, c) => acc + c.value, 0)
}

portfolio.value = sumChildren(portfolio)

/** Total CHF gained/lost today across the book, derived from day changes. */
export const dayChangeCHF = (portfolio.children ?? []).reduce(
  (acc, c) => acc + (c.value * c.change) / 100,
  0,
)
