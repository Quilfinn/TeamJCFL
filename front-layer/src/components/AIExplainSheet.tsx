import { Sparkles, BellPlus, Send, ArrowUp, TrendingUp, Mic } from 'lucide-react'
import { Sheet } from './Sheet'
import { TikTokIcon, InstagramIcon } from './BrandIcons'
import { formatPct } from '../lib/format'
import type { ExplainPayload } from '../lib/explain'

interface Props {
  payload: ExplainPayload | null
  onClose: () => void
  onAsk: () => void
}

const sectionStyle = (i: number) => ({
  animation: 'riseIn 0.5s cubic-bezier(0.22,1,0.36,1) both',
  animationDelay: `${0.08 + i * 0.08}s`,
})

export function AIExplainSheet({ payload, onClose, onAsk }: Props) {
  return (
    <Sheet open={!!payload} onClose={onClose} variant="glass">
      {payload && (
        <div className="px-5 pt-2 pb-6 text-white">
          {/* header */}
          <div className="flex items-center gap-2.5" style={sectionStyle(0)}>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.14)', border: '0.5px solid rgba(255,255,255,0.2)' }}
            >
              <Sparkles size={17} />
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-semibold">Signal AI</div>
              <div className="text-[11.5px] font-medium text-white/55">
                {payload.source === 'yap' ? 'On your voice memo' : 'Explaining this reel for your book'}
              </div>
            </div>
          </div>

          {/* context */}
          <div
            className="mt-4 flex items-center gap-2 rounded-2xl px-3 py-2.5"
            style={{ background: 'rgba(255,255,255,0.08)', ...sectionStyle(1) }}
          >
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/12">
              {payload.source === 'tiktok' ? (
                <TikTokIcon size={11} />
              ) : payload.source === 'instagram' ? (
                <InstagramIcon size={11} />
              ) : (
                <Mic size={12} />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12.5px] font-medium text-white/90">
                {payload.contextLabel}
              </div>
              {payload.handle && <div className="text-[11px] text-white/50">{payload.handle}</div>}
            </div>
          </div>

          {/* the brief */}
          <p className="mt-4 text-[15px] leading-relaxed text-white/90" style={sectionStyle(2)}>
            {payload.brief}
          </p>

          {/* what it means for you */}
          <div className="mt-4" style={sectionStyle(3)}>
            <div className="mb-2 text-[12.5px] font-semibold text-white/55">What it means for you</div>
            <ul className="flex flex-col gap-2">
              {payload.points.map((t) => (
                <li key={t} className="flex gap-2.5 text-[13.5px] leading-snug text-white/80">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-mint)]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* related assets */}
          {payload.related && (
            <div className="mt-4 flex flex-wrap gap-1.5" style={sectionStyle(4)}>
              {payload.related.map((a) => {
                const up = a.change >= 0
                return (
                  <span
                    key={a.ticker}
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-medium text-white"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                  >
                    {a.ticker}
                    <span className="tnum" style={{ color: up ? '#5fe3ab' : '#ff8b8e' }}>
                      {formatPct(a.change)}
                    </span>
                  </span>
                )
              })}
            </div>
          )}

          {/* action card */}
          <div
            className="mt-5 rounded-3xl p-4"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '0.5px solid rgba(255,255,255,0.18)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
              ...sectionStyle(5),
            }}
          >
            <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white/55">
              <TrendingUp size={14} /> Suggested action
            </div>
            <div className="mt-2 text-[16px] leading-snug font-medium text-white">
              {payload.suggestionTitle}
              {payload.suggestionMeta && (
                <span className="tnum text-white/60"> · {payload.suggestionMeta}</span>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white py-3 text-[14px] font-semibold text-navy-900 active:scale-[0.98]">
                <BellPlus size={16} /> Set alert
              </button>
              <button
                onClick={onAsk}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-3 text-[14px] font-semibold text-white active:scale-[0.98]"
                style={{ background: 'rgba(255,255,255,0.16)', border: '0.5px solid rgba(255,255,255,0.22)' }}
              >
                <Send size={15} /> Ask Clara
              </button>
            </div>
          </div>

          {/* follow-up */}
          <div
            className="mt-4 flex items-center gap-2 rounded-full px-2 py-2"
            style={{ background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.16)', ...sectionStyle(6) }}
          >
            <input
              placeholder="Ask a follow-up…"
              className="flex-1 bg-transparent px-3 text-[14px] text-white placeholder:text-white/45 focus:outline-none"
            />
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-navy-900">
              <ArrowUp size={17} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      )}
    </Sheet>
  )
}
