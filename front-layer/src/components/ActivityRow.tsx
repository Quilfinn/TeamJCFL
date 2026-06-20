import { Trash2, AudioLines, Play } from 'lucide-react'
import { TikTokIcon, InstagramIcon } from './BrandIcons'
import { ClaraAvatar } from './ClaraAvatar'
import { AgentMark } from './AgentMark'
import type { FeedItem } from '../data/feed'

interface Props {
  item: FeedItem
  onOpen: (i: FeedItem) => void
  onExplain: (i: FeedItem) => void
  onSendRM: (i: FeedItem) => void
  onDelete: (i: FeedItem) => void
}

export function ActivityRow({ item, onOpen, onExplain, onSendRM, onDelete }: Props) {
  const isReel = item.kind === 'reel'
  const time = isReel
    ? item.meta.replace(/^Forwarded from \w+ · /, '')
    : item.meta.replace(/^Voice memo · /, '')

  return (
    <div className="card overflow-hidden p-3">
      {/* content */}
      <button onClick={() => onOpen(item)} className="flex w-full items-start gap-3 text-left">
        {isReel ? (
          <div
            className="relative flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl text-white"
            style={{ background: `linear-gradient(150deg, ${item.poster[0]}, ${item.poster[1]})` }}
          >
            <span
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(90% 80% at 25% 12%, rgba(255,255,255,0.4), transparent 60%)',
              }}
            />
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Play size={12} className="ml-0.5 fill-white text-white" />
            </span>
          </div>
        ) : (
          <div className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(31,84,199,0.09)] text-navy-600">
            <AudioLines size={22} />
          </div>
        )}

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="line-clamp-2 text-[14px] leading-snug font-medium text-ink">
            {isReel ? item.caption : item.body}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11.5px] font-medium text-ink-faint">
            {isReel && (
              <span className="inline-flex items-center gap-1 rounded-full bg-paper px-1.5 py-0.5 text-ink-soft">
                {item.source === 'tiktok' ? <TikTokIcon size={9} /> : <InstagramIcon size={9} />}
                {item.source === 'tiktok' ? 'TikTok' : 'Instagram'}
              </span>
            )}
            {!isReel && <span className="text-ink-soft">Voice memo</span>}
            <span>· {time}</span>
          </div>
        </div>
      </button>

      {/* actions */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => onExplain(item)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-navy-900 py-2.5 text-[13px] font-semibold text-white active:scale-[0.98]"
        >
          <AgentMark size={16} /> Explain
        </button>
        <button
          onClick={() => onSendRM(item)}
          className="flex items-center gap-1.5 rounded-xl border border-line bg-surface py-2.5 pr-3 pl-2 text-[13px] font-medium text-ink-soft active:scale-[0.98]"
        >
          <ClaraAvatar size={20} /> Ask Clara
        </button>
        <button
          onClick={() => onDelete(item)}
          aria-label="Delete"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-ink-faint transition-colors active:bg-[rgba(229,72,77,0.1)] active:text-[var(--color-rose)]"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
