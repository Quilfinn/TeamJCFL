import { Sparkles, Send, Trash2, AudioLines } from 'lucide-react'
import { TikTokIcon, InstagramIcon } from './BrandIcons'
import type { FeedItem } from '../data/feed'

const SIGNAL_COLOR: Record<string, string> = {
  red:    '#e5484d',
  orange: '#f59a23',
  green:  '#16b87a',
}

interface Props {
  item: FeedItem
  first?: boolean
  onOpen: (i: FeedItem) => void
  onExplain: (i: FeedItem) => void
  onSendRM: (i: FeedItem) => void
  onDelete: (i: FeedItem) => void
}

export function ActivityRow({ item, first, onOpen, onExplain, onSendRM, onDelete }: Props) {
  const divider = !first && (
    <span className="absolute top-0 right-0 left-[64px] h-px bg-[var(--color-line)]" />
  )

  /* ── RM Nudge (Anna's response) ─────────────────────────── */
  if (item.kind === 'rm_nudge') {
    return (
      <div className="relative flex items-start gap-3 px-3.5 py-3">
        {divider}
        <button
          onClick={() => onOpen(item)}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <div
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] text-[11px] font-bold text-white"
            style={{ background: 'linear-gradient(158deg, #3b78ec 0%, #0a1230 100%)' }}
          >
            AK
          </div>
          <div className="min-w-0 flex-1 pr-1">
            <div className="truncate text-[13.5px] font-medium text-ink">{item.headline}</div>
            <div className="mt-0.5 truncate text-[11.5px] font-medium text-ink-faint">
              {item.meta}
            </div>
            {item.body && (
              <div className="mt-0.5 truncate text-[11px]" style={{ color: 'var(--color-mint)' }}>
                {item.body.slice(0, 60)}…
              </div>
            )}
          </div>
        </button>
        <div className="flex flex-shrink-0 items-center">
          <ActBtn label="Delete" tone="danger" onClick={() => onDelete(item)}>
            <Trash2 size={15} strokeWidth={2} />
          </ActBtn>
        </div>
      </div>
    )
  }

  /* ── Reel & Yap ─────────────────────────────────────────── */
  const isReel = item.kind === 'reel'

  return (
    <div className="relative flex items-center gap-3 px-3.5 py-3">
      {divider}

      <button
        onClick={() => onOpen(item)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        {isReel ? (
          <div
            className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-[14px] text-white"
            style={{ background: `linear-gradient(150deg, ${item.poster[0]}, ${item.poster[1]})` }}
          >
            <span
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(90% 80% at 25% 15%, rgba(255,255,255,0.4), transparent 60%)',
              }}
            />
            {item.source === 'tiktok' ? <TikTokIcon size={18} /> : <InstagramIcon size={18} />}
          </div>
        ) : (
          <div
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px]"
            style={
              item.kind === 'yap' && item.aiReply
                ? { background: 'rgba(22,184,122,0.12)', color: 'var(--color-mint)' }
                : { background: 'rgba(31,84,199,0.09)', color: 'var(--color-navy-600)' }
            }
          >
            {item.kind === 'yap' && item.aiReply ? <Sparkles size={18} /> : <AudioLines size={18} />}
          </div>
        )}

        <div className="min-w-0 flex-1 pr-1">
          <div className="truncate text-[13.5px] font-medium text-ink">
            {isReel ? item.caption : item.body}
          </div>
          <div className="mt-0.5 truncate text-[11.5px] font-medium text-ink-faint">
            {isReel
              ? item.handle
              : item.kind === 'yap' && item.aiReply
                ? 'Signal AI'
                : 'Voice memo'}
            {' · '}
            {item.kind === 'reel'
              ? item.meta.replace(/^Forwarded from \w+ · /, '')
              : item.meta.replace(/^Voice memo · /, '').replace(/^RM Radar · /, '')}
          </div>

          {/* Signal flag chip — reels only */}
          {isReel && item.kind === 'reel' && (
            <div className="mt-0.5 flex items-center gap-1">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: SIGNAL_COLOR[item.signal] }}
              />
              <span
                className="text-[10.5px] font-semibold"
                style={{ color: SIGNAL_COLOR[item.signal] }}
              >
                {item.signalLabel}
              </span>
            </div>
          )}

          {/* AI reply preview — yap items */}
          {item.kind === 'yap' && item.aiReply && (
            <div className="mt-0.5 truncate text-[11px]" style={{ color: 'var(--color-mint)' }}>
              {item.aiReply.slice(0, 58)}…
            </div>
          )}
        </div>
      </button>

      <div className="flex flex-shrink-0 items-center gap-1.5">
        <ActBtn label="Explain with AI" tone="primary" onClick={() => onExplain(item)}>
          <Sparkles size={16} strokeWidth={2} />
        </ActBtn>
        <ActBtn label="Send to Clara" onClick={() => onSendRM(item)}>
          <Send size={15} strokeWidth={2} />
        </ActBtn>
        <ActBtn label="Delete" tone="danger" onClick={() => onDelete(item)}>
          <Trash2 size={15} strokeWidth={2} />
        </ActBtn>
      </div>
    </div>
  )
}

function ActBtn({
  children,
  label,
  onClick,
  tone = 'default',
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  tone?: 'default' | 'primary' | 'danger'
}) {
  const base =
    'flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-90 '
  const styles =
    tone === 'primary'
      ? 'bg-[rgba(31,84,199,0.1)] text-navy-600 active:bg-[rgba(31,84,199,0.18)]'
      : tone === 'danger'
        ? 'bg-paper text-ink-faint active:bg-[rgba(229,72,77,0.1)] active:text-[var(--color-rose)]'
        : 'bg-paper text-ink-soft active:bg-paper-dim'
  return (
    <button onClick={onClick} aria-label={label} className={base + styles}>
      {children}
    </button>
  )
}
