import { useEffect, useState } from 'react'
import { Trash2, FolderInput } from 'lucide-react'
import { ClaraAvatar } from './ClaraAvatar'
import { AgentMark } from './AgentMark'
import { PassHead } from './PassCard'
import { SKINS, type FeedItem } from '../data/feed'
import { tileBg, tileShadow } from '../lib/palette'

interface Props {
  items: FeedItem[]
  freshId?: string | null
  leavingId?: string | null
  onExplain: (i: FeedItem) => void
  onSendRM: (i: FeedItem) => void
  onFile: (i: FeedItem) => void
  onDelete: (i: FeedItem) => void
}

const GLASS = 'rgba(255,255,255,0.16)'

const SIGNAL_HEX: Record<string, string> = {
  red: '#ff6b6e',
  orange: '#ffb84d',
  green: '#5fe3ab',
}

export function ActivityDeck({ items, freshId, leavingId, onExplain, onSendRM, onFile, onDelete }: Props) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null)
  useEffect(() => {
    if (!items.some((i) => i.id === openId)) setOpenId(items[0]?.id ?? null)
  }, [items, openId])
  // a freshly-landed card surfaces to the top of the pile
  useEffect(() => {
    if (freshId && items.some((i) => i.id === freshId)) setOpenId(freshId)
  }, [freshId, items])

  const top = items.find((i) => i.id === openId) ?? items[0]
  if (!top) return null
  const rest = items.filter((i) => i.id !== top.id)
  const hex = SKINS[top.skin]
  const leaving = top.id === leavingId

  return (
    <div className="relative">
      {/* the rest of the pile — real cards tucked behind, only their rounded base shows */}
      {rest.slice(0, 3).map((it, k) => {
        const peek = 9 + k * 7
        const inset = 13 + k * 11
        return (
          <button
            key={it.id}
            onClick={() => setOpenId(it.id)}
            aria-label={`Bring up: ${it.kind === 'reel' ? it.caption : it.body}`}
            className="absolute overflow-hidden rounded-[22px]"
            style={{
              left: inset,
              right: inset,
              top: 18,
              bottom: -peek,
              zIndex: 40 - k,
              background: tileBg(SKINS[it.skin]),
              boxShadow: '0 6px 8px -7px rgba(8,14,32,0.4)',
            }}
          />
        )
      })}

      {/* the active card — the only one whose content you read */}
      <div
        className="relative overflow-hidden rounded-[22px]"
        style={{
          background: tileBg(hex),
          zIndex: 50,
          pointerEvents: leaving ? 'none' : undefined,
          boxShadow: `${tileShadow(hex)}, 0 24px 46px -22px rgba(8,14,32,0.5)`,
          animation: leaving
            ? 'cardLeave 0.34s cubic-bezier(0.5,0,0.75,0) both'
            : top.id === freshId
              ? 'deckDrop 0.6s cubic-bezier(0.22,1,0.36,1) both'
              : undefined,
        }}
      >
        <div className="grain-overlay" aria-hidden />
        <div className="relative px-5 pt-[18px] pb-5">
          <PassHead item={top} />

          {/* Signal AI recommendation — shown once a shared reel is read */}
          {top.kind === 'reel' && top.signal && (
            <div
              className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.12)', border: '0.5px solid rgba(255,255,255,0.16)' }}
            >
              <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: SIGNAL_HEX[top.signal.level] }} />
              <span className="text-[12px] font-semibold" style={{ color: SIGNAL_HEX[top.signal.level] }}>
                {top.signal.label}
              </span>
              {top.signal.note && (
                <span className="min-w-0 flex-1 truncate text-[11.5px]" style={{ color: 'rgba(255,255,255,0.72)' }}>
                  · {top.signal.note}
                </span>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => onExplain(top)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-white py-3 text-[13.5px] font-semibold text-navy-900 active:scale-[0.98]"
            >
              <AgentMark size={15} eyeColor="#ffffff" /> Explain
            </button>
            <button
              onClick={() => onSendRM(top)}
              aria-label="Ask Clara"
              className="flex items-center gap-1.5 rounded-2xl py-3 pl-2.5 pr-3.5 text-[13.5px] font-semibold text-white active:scale-[0.98]"
              style={{ background: GLASS }}
            >
              <ClaraAvatar size={20} /> Ask
            </button>
            <button
              onClick={() => onFile(top)}
              aria-label="File into folder"
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-white active:scale-95"
              style={{ background: GLASS }}
            >
              <FolderInput size={17} />
            </button>
            <button
              onClick={() => onDelete(top)}
              aria-label="Delete"
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl active:scale-95"
              style={{ background: GLASS, color: 'rgba(255,255,255,0.7)' }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
