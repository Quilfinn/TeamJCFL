/** Deterministic price series so charts look real and stay stable per asset. */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedFrom(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const BASE_PRICE: Record<string, number> = {
  GLD: 218.4,
  NEM: 46.12,
  NVDA: 1024.6,
  TSM: 184.3,
  VRT: 92.18,
  EWJ: 68.4,
  UUP: 28.9,
  ARCC: 21.6,
  BX: 142.5,
}

export interface ChartData {
  data: number[]
  current: number
  /** trigger / target price */
  target: number
  basePrice: number
}

/** Build a believable walk for a ticker, ending at "now", with a dip target. */
export function buildChart(ticker: string, n = 44, seedSuffix = ''): ChartData {
  const base = BASE_PRICE[ticker] ?? 100
  const rnd = mulberry32(seedFrom(ticker + seedSuffix))
  let v = base * (0.9 + rnd() * 0.08)
  const data: number[] = [v]
  for (let i = 1; i < n; i++) {
    const shock = (rnd() - 0.47) * 0.05
    v = Math.max(base * 0.6, v * (1 + shock))
    data.push(v)
  }
  const current = data[data.length - 1]
  // target = a local dip a few % under current (buy-the-dip trigger)
  const target = current * (0.93 + rnd() * 0.03)
  return { data, current, target, basePrice: base }
}

export function fmtUSD(n: number): string {
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: n >= 1000 ? 0 : 2, minimumFractionDigits: n >= 1000 ? 0 : 2 })}`
}
