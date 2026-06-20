import { Sparkles, Send, Trash2, AudioLines } from 'lucide-react'
import { TikTokIcon, InstagramIcon } from './BrandIcons'
import type { FeedItem } from '../data/feed'

interface Props {
  item: FeedItem
  first?: boolean
  onOpen: (i: FeedItem) => void
  onExplain: (i: FeedItem) => void
  onSendRM: (i: FeedItem) => void
  onDelete: (i: FeedItem) => void
}

export function ActivityRow({ item, first, onOpen, onExplain, onSendRM, onDelete }: Props) {
  const isReel = item.kind === 'reel'
  return (
    <div className="relative flex items-center gap-3 px-3.5 py-3">
      {!first && (
        <span className="absolute top-0 right-0 left-[64px] h-px bg-[var(--color-line)]" />
      )}

      {/* tappable body → opens detail */}
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
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] bg-[rgba(31,84,199,0.09)] text-navy-600">
            <AudioLines size={18} />
          </div>
        )}

        <div className="min-w-0 flex-1 pr-1">
          <div className="truncate text-[13.5px] font-medium text-ink">
            {isReel ? item.caption : item.body}
          </div>
          <div className="mt-0.5 truncate text-[11.5px] font-medium text-ink-faint">
            {isReel ? item.handle : 'Voice memo'}
            {' · '}
            {item.kind === 'reel'
              ? item.meta.replace(/^Forwarded from \w+ · /, '')
              : item.meta.replace(/^Voice memo · /, '')}
          </div>
        </div>
      </button>

      {/* quick actions */}
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
