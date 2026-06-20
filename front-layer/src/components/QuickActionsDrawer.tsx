import { motion } from 'framer-motion'
import { Sparkles, Send, RotateCcw, Trash2, AudioLines } from 'lucide-react'
import { Sheet } from './Sheet'
import { TikTokIcon, InstagramIcon } from './BrandIcons'
import type { FeedItem } from '../data/feed'
import { formatPct } from '../lib/format'

interface Props {
  item: FeedItem | null
  /** show a "just captured" banner for fresh shares/yaps */
  fresh?: boolean
  onClose: () => void
  onExplain: (i: FeedItem) => void
  onSendRM: (i: FeedItem) => void
  onRecordAgain: () => void
  onDelete: (i: FeedItem) => void
}

export function QuickActionsDrawer({
  item,
  fresh,
  onClose,
  onExplain,
  onSendRM,
  onRecordAgain,
  onDelete,
}: Props) {
  const isReel = item?.kind === 'reel'
  return (
    <Sheet open={!!item} onClose={onClose} variant="light">
      {item && (
        <div className="px-5 pt-1 pb-6">
          {fresh && (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[rgba(22,184,122,0.12)] px-2.5 py-1 text-[12px] font-semibold text-[var(--color-mint)]">
              <Sparkles size={12} />
              {isReel ? 'Reel added' : 'Memo captured'}
            </div>
          )}

          {/* preview */}
          {isReel ? (
            <div className="overflow-hidden rounded-2xl border border-line">
              <div
                className="relative flex aspect-[16/9] items-end p-3"
                style={{ background: `linear-gradient(150deg, ${item.poster[0]}, ${item.poster[1]})` }}
              >
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-1 text-[11px] font-medium text-white">
                  {item.source === 'tiktok' ? <TikTokIcon size={11} /> : <InstagramIcon size={11} />}
                  {item.source === 'tiktok' ? 'TikTok' : 'Instagram'}
                </span>
                <div className="relative">
                  <div className="text-[11px] font-medium text-white/70">{item.handle}</div>
                  <p className="text-[13.5px] leading-snug font-medium text-white">{item.caption}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 bg-surface px-3 py-2.5">
                {item.related.map((a) => {
                  const up = a.change >= 0
                  return (
                    <span
                      key={a.ticker}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2 py-1 text-[11.5px] font-medium text-ink"
                    >
                      {a.ticker}
                      <span className="tnum" style={{ color: up ? 'var(--color-mint)' : 'var(--color-rose)' }}>
                        {formatPct(a.change)}
                      </span>
                    </span>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-paper p-3.5">
              <div className="flex items-center gap-2 text-[12px] font-medium text-ink-faint">
                <AudioLines size={15} className="text-navy-600" /> {item.meta}
              </div>
              <p className="mt-2 text-[14.5px] leading-snug text-ink">{item.body}</p>
            </div>
          )}

          {/* quick actions */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onExplain(item)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-navy-900 py-3.5 text-[15px] font-semibold text-white"
          >
            <Sparkles size={17} /> Explain with AI
          </motion.button>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <Secondary icon={<Send size={16} />} label="Send to RM" onClick={() => onSendRM(item)} />
            {item.kind === 'yap' ? (
              <Secondary icon={<RotateCcw size={16} />} label="Record again" onClick={onRecordAgain} />
            ) : (
              <Secondary
                icon={<Trash2 size={16} />}
                label="Delete"
                destructive
                onClick={() => onDelete(item)}
              />
            )}
          </div>

          {item.kind === 'yap' && (
            <Secondary
              icon={<Trash2 size={16} />}
              label="Delete memo"
              destructive
              full
              onClick={() => onDelete(item)}
            />
          )}
        </div>
      )}
    </Sheet>
  )
}

function Secondary({
  icon,
  label,
  onClick,
  destructive,
  full,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  destructive?: boolean
  full?: boolean
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={
        'flex items-center justify-center gap-2 rounded-2xl border py-3 text-[14px] font-medium ' +
        (full ? 'mt-2 w-full ' : '') +
        (destructive
          ? 'border-transparent bg-[rgba(229,72,77,0.08)] text-[var(--color-rose)]'
          : 'border-line bg-surface text-ink-soft')
      }
    >
      {icon}
      {label}
    </motion.button>
  )
}
