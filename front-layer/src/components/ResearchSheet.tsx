import { Plus, ChevronRight } from 'lucide-react'
import { Sheet } from './Sheet'
import { Sparkline } from './Sparkline'
import { buildChart, fmtUSD } from '../lib/series'
import type { RelatedAsset } from '../data/feed'

interface Props {
  assets: RelatedAsset[] | null
  onClose: () => void
}

export function ResearchSheet({ assets, onClose }: Props) {
  return (
    <Sheet open={!!assets} onClose={onClose} variant="light">
      {assets && (
        <div className="px-5 pt-2 pb-6">
          <div className="text-[16px] font-semibold text-ink">Research</div>
          <div className="text-[12.5px] font-medium text-ink-faint">Names tied to this idea</div>

          <div className="mt-4 flex flex-col gap-2">
            {assets.map((a) => {
              const chart = buildChart(a.ticker, 30)
              const up = a.change >= 0
              return (
                <button
                  key={a.ticker}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-paper p-3 text-left active:scale-[0.99]"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-navy-900 text-[12px] font-semibold text-white">
                    {a.ticker.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-medium text-ink">{a.name}</div>
                    <div className="text-[12px] font-medium text-ink-faint">{a.ticker}</div>
                  </div>
                  <Sparkline data={chart.data} up={up} />
                  <div className="w-[64px] text-right">
                    <div className="tnum text-[13.5px] font-semibold text-ink">
                      {fmtUSD(chart.current)}
                    </div>
                    <div
                      className="tnum text-[11.5px] font-medium"
                      style={{ color: up ? 'var(--color-mint)' : 'var(--color-rose)' }}
                    >
                      {up ? '+' : ''}
                      {a.change.toFixed(2)}%
                    </div>
                  </div>
                  <ChevronRight size={16} className="flex-shrink-0 text-ink-faint" />
                </button>
              )
            })}
          </div>

          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-line bg-surface py-3.5 text-[15px] font-semibold text-ink active:scale-[0.98]">
            <Plus size={17} /> Add to watchlist
          </button>
        </div>
      )}
    </Sheet>
  )
}
