import { useMemo, useState, type ReactNode } from 'react'
import { X, ArrowUp, Bell, LineChart } from 'lucide-react'
import { Sheet } from './Sheet'
import { AIOrb } from './AIOrb'
import { StockChart } from './StockChart'
import { ClaraAvatar } from './ClaraAvatar'
import { buildChart, fmtUSD } from '../lib/series'
import type { ExplainPayload, Assessment } from '../lib/explain'

interface Props {
  payload: ExplainPayload | null
  onClose: () => void
  onAsk: () => void
  onConfirm: () => void
  onResearch: () => void
}

const TFS = ['24H', '1W', '1M'] as const

const suggestedFor = (a: Assessment) =>
  a === 'positive' ? 'alert' : a === 'negative' ? 'clara' : 'research'

export function AIExplainSheet({ payload, onClose, onAsk, onConfirm, onResearch }: Props) {
  const [tf, setTf] = useState<string>('24H')
  const ticker = payload?.related?.[0]?.ticker ?? 'GLD'
  const chart = useMemo(() => buildChart(ticker, 44, tf), [ticker, tf])

  const suggested = suggestedFor(payload?.assessment ?? 'neutral')

  const actions: Record<string, { primary: string; label: string; icon: ReactNode; onClick: () => void }> = {
    alert: { primary: 'Set the alert', label: 'Set alert', icon: <Bell size={16} />, onClick: onConfirm },
    clara: {
      primary: 'Talk to Clara',
      label: 'Clara',
      icon: <ClaraAvatar size={20} />,
      onClick: onAsk,
    },
    research: { primary: 'Research stocks', label: 'Research', icon: <LineChart size={16} />, onClick: onResearch },
  }
  const order = ['alert', 'clara', 'research']
  const primaryKey = suggested
  const secondaryKeys = order.filter((k) => k !== primaryKey)
  const primary = actions[primaryKey]

  return (
    <Sheet open={!!payload} onClose={onClose} variant="light">
      {payload && (
        <div className="px-4 pt-3 pb-5">
          {/* header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <AIOrb size={36} float={false} />
              <div className="leading-tight">
                <div className="text-[15px] font-semibold text-ink">Signal AI</div>
                <div className="text-[11.5px] font-medium text-ink-faint">
                  {payload.source === 'yap' ? 'On your memo' : 'On this reel'}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-faint active:bg-paper-dim"
            >
              <X size={18} />
            </button>
          </div>

          {/* conversation */}
          <div className="mt-4 flex flex-col gap-2.5">
            <div className="flex justify-end">
              <div className="max-w-[82%] rounded-[20px] rounded-br-md bg-paper-dim px-3.5 py-2.5 text-[13.5px] leading-snug font-medium text-ink">
                {payload.contextLabel}
              </div>
            </div>
            <div className="flex justify-start">
              <div
                className="max-w-[86%] rounded-[20px] rounded-bl-md px-3.5 py-2.5 text-[13.5px] leading-snug text-white"
                style={{ background: 'linear-gradient(155deg, #5f7df8, #4661e8)' }}
              >
                {payload.brief}
              </div>
            </div>
          </div>

          {/* action card */}
          <div
            className="relative mt-3 overflow-hidden rounded-[26px] p-4 text-white"
            style={{
              background: 'linear-gradient(160deg, #6e7cff 0%, #4f63ed 52%, #3f54df 100%)',
              boxShadow: '0 20px 40px -18px rgba(63,84,223,0.6)',
            }}
          >
            <div className="grain-overlay" style={{ opacity: 0.07 }} aria-hidden />
            <div className="relative text-center">
              <div className="text-[16px] leading-snug font-semibold">{payload.suggestionTitle}</div>
              <div className="mt-0.5 text-[12.5px] font-medium text-white/65">
                {ticker} · alert at {fmtUSD(chart.target)}
              </div>
            </div>

            <div className="relative mt-3">
              <StockChart data={chart.data} current={chart.current} target={chart.target} />
            </div>

            <div className="relative mt-1 flex justify-center gap-2">
              {TFS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTf(t)}
                  className="rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-colors"
                  style={{
                    background: t === tf ? 'rgba(255,255,255,0.22)' : 'transparent',
                    color: t === tf ? '#fff' : 'rgba(255,255,255,0.55)',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* actions — all three present, suggested one promoted */}
            <div className="relative mt-3 flex flex-col gap-2">
              <button
                onClick={primary.onClick}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 text-[15px] font-semibold text-navy-800 active:scale-[0.98]"
              >
                {primary.icon} {primary.primary}
              </button>
              <div className="grid grid-cols-2 gap-2">
                {secondaryKeys.map((k) => {
                  const a = actions[k]
                  return (
                    <button
                      key={k}
                      onClick={a.onClick}
                      className="flex items-center justify-center gap-2 rounded-full py-3 text-[14px] font-semibold text-white active:scale-[0.98]"
                      style={{ background: 'rgba(255,255,255,0.16)', border: '0.5px solid rgba(255,255,255,0.24)' }}
                    >
                      {a.icon} {a.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* follow-up */}
          <div className="mt-3 flex items-center gap-2 rounded-full border border-line bg-paper px-2 py-1.5">
            <input
              placeholder="Follow up…"
              className="flex-1 bg-transparent px-3 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
            />
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-white">
              <ArrowUp size={17} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      )}
    </Sheet>
  )
}
