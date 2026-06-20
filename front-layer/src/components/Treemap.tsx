import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import type { AssetNode } from '../data/portfolio'
import { squarify } from '../lib/squarify'
import { shadeForRank, textOn, subTextOn, tileBg, tileShadow } from '../lib/palette'
import { formatCompact, formatPct } from '../lib/format'

const GAP = 5 // px between tiles

interface Props {
  node: AssetNode
  depth: number
  onDrill: (child: AssetNode) => void
}

export function Treemap({ node, onDrill }: Props) {
  const children = node.children ?? []
  const total = children.reduce((a, c) => a + c.value, 0)

  const ranked = useMemo(
    () => [...children].sort((a, b) => b.value - a.value).map((c) => c.id),
    [children],
  )

  const tiles = useMemo(
    () => squarify(children.map((c) => c.value), { x: 0, y: 0, w: 100, h: 100 }),
    [children],
  )

  return (
    <div key={node.id} className="treemap relative w-full" style={{ aspectRatio: '1 / 0.82' }}>
      {children.map((child, i) => {
        const t = tiles[i]
        const rank = ranked.indexOf(child.id)
        const shade = shadeForRank(rank, children.length)
        const pct = (child.value / total) * 100
        const tier = pct >= 15 ? 'lg' : pct >= 7 ? 'md' : 'sm'
        const fg = textOn(shade)
        const sub = subTextOn(shade)
        const drillable = !!child.children?.length
        const pad = tier === 'sm' ? 11 : 14
        const radius = tier === 'sm' ? 15 : 19
        return (
          <button
            key={child.id}
            onClick={() => drillable && onDrill(child)}
            className="absolute flex flex-col justify-between overflow-hidden text-left transition-transform duration-150 active:scale-[0.97]"
            style={{
              left: `calc(${t.x}% + ${GAP / 2}px)`,
              top: `calc(${t.y}% + ${GAP / 2}px)`,
              width: `calc(${t.w}% - ${GAP}px)`,
              height: `calc(${t.h}% - ${GAP}px)`,
              padding: pad,
              borderRadius: radius,
              background: tileBg(shade),
              boxShadow: tileShadow(shade),
              color: fg,
              animation: `tileIn 0.4s ease both`,
              animationDelay: `${0.03 * i}s`,
            }}
          >
            <div className="grain-overlay" aria-hidden />

            <div className="relative flex min-w-0 items-start justify-between gap-1">
              <span
                className="line-clamp-2 min-w-0 font-medium leading-tight"
                style={{ fontSize: tier === 'lg' ? 15 : tier === 'md' ? 12.5 : 11.5 }}
              >
                {child.name}
              </span>
              {drillable && tier === 'lg' && (
                <ChevronRight size={15} style={{ color: sub, marginTop: 1, flexShrink: 0 }} />
              )}
            </div>

            <div className="relative min-w-0">
              <div
                key={child.value}
                className="tnum font-light leading-none whitespace-nowrap"
                style={{
                  fontSize: tier === 'lg' ? 21 : tier === 'md' ? 16 : 13.5,
                  letterSpacing: '-0.02em',
                  animation: 'numIn 0.45s cubic-bezier(0.22,1,0.36,1) both',
                }}
              >
                {formatCompact(child.value)}
              </div>
              {tier !== 'sm' && (
                <div
                  className="tnum mt-1 flex items-center gap-1.5 truncate leading-none"
                  style={{ fontSize: tier === 'lg' ? 11.5 : 10.5, color: sub }}
                >
                  {tier === 'lg' && <span>{Math.round(pct)}%</span>}
                  <span>{formatPct(child.change)}</span>
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
