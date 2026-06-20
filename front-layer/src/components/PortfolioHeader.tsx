import { ArrowUpRight } from 'lucide-react'
import type { AssetNode } from '../data/portfolio'
import { formatPct, formatSignedCHF } from '../lib/format'

const groupCHF = new Intl.NumberFormat('de-CH', { maximumFractionDigits: 0 })

interface Props {
  node: AssetNode
  /** CHF moved today for the current node */
  dayChange: number
}

export function PortfolioHeader({ node, dayChange }: Props) {
  const up = node.change >= 0
  const accent = up ? 'var(--color-mint)' : 'var(--color-rose)'

  return (
    <div className="px-6">
      {/* the number — keyed so it pops on change, scale-only (never invisible) */}
      <h1
        key={node.id}
        className="flex items-baseline gap-1.5"
        style={{ animation: 'numIn 0.32s cubic-bezier(0.22,1,0.36,1) both' }}
      >
        <span className="text-[17px] font-medium tracking-tight text-ink-faint">CHF</span>
        <span className="tnum text-[44px] leading-none font-semibold tracking-[-0.035em] text-ink">
          {groupCHF.format(Math.round(node.value))}
        </span>
      </h1>

      {/* growth indicator */}
      <div className="mt-3 flex items-center gap-2">
        <span
          className="tnum inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-semibold"
          style={{
            background: up ? 'rgba(22,184,122,0.12)' : 'rgba(229,72,77,0.12)',
            color: accent,
          }}
        >
          <ArrowUpRight
            size={14}
            strokeWidth={2.6}
            style={{ transform: up ? 'none' : 'rotate(90deg)' }}
          />
          {formatPct(node.change)}
        </span>
        <span className="tnum text-[13px] font-medium text-ink-soft">
          {formatSignedCHF(dayChange)} today
        </span>
      </div>
    </div>
  )
}
