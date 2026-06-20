import { Play, AudioLines } from 'lucide-react'
import type { FeedItem } from '../data/feed'

/** Title + sentence-case provenance line for any feed item. */
export function passBits(item: FeedItem) {
  const title = item.kind === 'reel' ? item.caption : item.body
  return { title, label: item.meta }
}

export function PassGlyph({ item }: { item: FeedItem }) {
  return (
    <span
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-white"
      style={{ background: 'rgba(255,255,255,0.16)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)' }}
    >
      {item.kind === 'reel' ? (
        <Play size={15} className="ml-0.5 fill-current" />
      ) : (
        <AudioLines size={18} />
      )}
    </span>
  )
}

/** The visible header of a glossy pass: glyph left, quiet meta, white title. */
export function PassHead({ item, clampTitle = false }: { item: FeedItem; clampTitle?: boolean }) {
  const { title, label } = passBits(item)
  return (
    <div className="flex items-center gap-3">
      <PassGlyph item={item} />
      <div className="min-w-0 flex-1">
        <div className="text-[11.5px] font-medium" style={{ color: 'rgba(255,255,255,0.62)' }}>
          {label}
        </div>
        <div
          className={`mt-0.5 text-[15.5px] font-semibold leading-[1.25] tracking-[-0.01em] text-white ${
            clampTitle ? 'line-clamp-1' : ''
          }`}
        >
          {title}
        </div>
      </div>
    </div>
  )
}
