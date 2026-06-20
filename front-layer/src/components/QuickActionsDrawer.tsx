import { motion } from 'framer-motion'
import { Sparkles, Send, RotateCcw, Trash2, AudioLines, Play } from 'lucide-react'
import { Sheet } from './Sheet'
import { TikTokIcon, InstagramIcon } from './BrandIcons'
import type { FeedItem } from '../data/feed'

const SIGNAL_COLOR: Record<string, string> = {
  red:    '#e5484d',
  orange: '#f59a23',
  green:  '#16b87a',
}
const SIGNAL_BG: Record<string, string> = {
  red:    'rgba(229,72,77,0.08)',
  orange: 'rgba(245,154,35,0.08)',
  green:  'rgba(22,184,122,0.08)',
}
const SIGNAL_BORDER: Record<string, string> = {
  red:    'rgba(229,72,77,0.22)',
  orange: 'rgba(245,154,35,0.22)',
  green:  'rgba(22,184,122,0.22)',
}

interface Props {
  item: FeedItem | null
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
  const isReel     = item?.kind === 'reel'
  const isRMNudge  = item?.kind === 'rm_nudge'

  return (
    <Sheet open={!!item} onClose={onClose} variant={isRMNudge ? 'light' : 'light'}>
      {item && (
        <div className="px-5 pt-1 pb-6">

          {/* ── RM Nudge: Anna's reply ───────────────────── */}
          {isRMNudge && item.kind === 'rm_nudge' && (
            <>
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[rgba(22,184,122,0.12)] px-2.5 py-1 text-[12px] font-semibold text-[var(--color-mint)]">
                <Sparkles size={12} />
                Anna has reviewed your signal
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                  style={{ background: 'linear-gradient(158deg, #3b78ec 0%, #0a1230 100%)', boxShadow: '0 0 0 3px rgba(59,120,236,0.2)' }}
                >
                  AK
                </div>
                <div>
                  <div className="text-[15px] font-semibold text-ink">Anna Keller</div>
                  <div className="text-[12px] text-ink-faint">Your relationship manager · Signal AI</div>
                </div>
              </div>
              <div
                className="rounded-2xl p-4"
                style={{ background: 'var(--color-paper)', border: '0.5px solid var(--color-line)' }}
              >
                <p className="text-[15px] font-semibold text-ink leading-snug mb-2">
                  {item.headline}
                </p>
                {item.body && (
                  <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--color-mint)' }}>
                    {item.body}
                  </p>
                )}
              </div>
              <p className="text-[10.5px] mt-3 text-center text-ink-faint">
                Anna has been notified · Julius Baer Private Banking
              </p>
            </>
          )}

          {/* ── Reel ────────────────────────────────────── */}
          {isReel && item.kind === 'reel' && (
            <>
              {fresh && (
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[rgba(22,184,122,0.12)] px-2.5 py-1 text-[12px] font-semibold text-[var(--color-mint)]">
                  <Sparkles size={12} />
                  Reel added
                </div>
              )}

              <div
                className="relative flex aspect-[16/10] items-end overflow-hidden rounded-2xl p-3.5 text-white"
                style={{ background: `linear-gradient(150deg, ${item.poster[0]}, ${item.poster[1]})` }}
              >
                <span
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(80% 70% at 22% 12%, rgba(255,255,255,0.32), transparent 55%), linear-gradient(180deg, transparent 45%, rgba(7,13,31,0.55))',
                  }}
                />
                <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 text-[11.5px] font-medium backdrop-blur-sm">
                  {item.source === 'tiktok' ? <TikTokIcon size={12} /> : <InstagramIcon size={12} />}
                  {item.source === 'tiktok' ? 'TikTok' : 'Instagram'}
                </span>
                <span className="absolute top-3 right-3.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                  <Play size={14} className="ml-0.5 fill-white text-white" />
                </span>
                <div className="relative">
                  <div className="text-[11.5px] font-medium text-white/75">{item.handle}</div>
                  <p className="text-[14px] leading-snug font-medium">{item.caption}</p>
                </div>
              </div>

              {/* Signal flag banner */}
              <div
                className="mt-3 flex items-start gap-3 rounded-2xl px-4 py-3"
                style={{
                  background: SIGNAL_BG[item.signal],
                  border: `0.5px solid ${SIGNAL_BORDER[item.signal]}`,
                }}
              >
                <span
                  className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ background: SIGNAL_COLOR[item.signal] }}
                />
                <span
                  className="text-[13px] font-semibold leading-snug"
                  style={{ color: SIGNAL_COLOR[item.signal] }}
                >
                  {item.signalText}
                </span>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => onExplain(item)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-navy-900 py-3.5 text-[15px] font-semibold text-white"
              >
                <Sparkles size={17} /> Explain with AI
              </motion.button>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <Secondary icon={<Send size={16} />} label="Send to Clara" onClick={() => onSendRM(item)} />
                <Secondary
                  icon={<Trash2 size={16} />}
                  label="Delete"
                  destructive
                  onClick={() => onDelete(item)}
                />
              </div>
            </>
          )}

          {/* ── Yap (voice memo) ────────────────────────── */}
          {!isReel && !isRMNudge && item.kind === 'yap' && (
            <>
              {fresh && (
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[rgba(22,184,122,0.12)] px-2.5 py-1 text-[12px] font-semibold text-[var(--color-mint)]">
                  <Sparkles size={12} />
                  Memo captured
                </div>
              )}

              <div className="rounded-2xl border border-line bg-paper p-4">
                <div className="flex items-center gap-2 text-[12px] font-medium text-ink-faint">
                  <AudioLines size={15} className="text-navy-600" /> {item.meta}
                </div>
                <p className="mt-2 text-[15px] leading-snug text-ink">"{item.body}"</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => onExplain(item)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-navy-900 py-3.5 text-[15px] font-semibold text-white"
              >
                <Sparkles size={17} /> Explain with AI
              </motion.button>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <Secondary icon={<Send size={16} />} label="Send to Clara" onClick={() => onSendRM(item)} />
                <Secondary icon={<RotateCcw size={16} />} label="Record again" onClick={onRecordAgain} />
              </div>

              <Secondary
                icon={<Trash2 size={16} />}
                label="Delete memo"
                destructive
                full
                onClick={() => onDelete(item)}
              />
            </>
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
