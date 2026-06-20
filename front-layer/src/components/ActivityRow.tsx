import { ChevronRight, Play, AudioLines, Sparkles } from 'lucide-react'
import { TikTokIcon, InstagramIcon } from './BrandIcons'
import type { FeedItem } from '../data/feed'

export function ActivityRow({ item, onOpen }: { item: FeedItem; onOpen: (i: FeedItem) => void }) {
  const isReel = item.kind === 'reel'
  return (
    <button
      onClick={() => onOpen(item)}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-paper"
    >
      {/* leading visual */}
      {isReel ? (
        <div
          className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-[13px]"
          style={{ background: `linear-gradient(150deg, ${item.poster[0]}, ${item.poster[1]})` }}
        >
          <Play size={13} className="fill-white text-white" />
        </div>
      ) : (
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[13px] bg-paper-dim text-navy-600">
          <AudioLines size={18} />
        </div>
      )}

      {/* body */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {isReel ? (
            item.source === 'tiktok' ? (
              <TikTokIcon size={10} />
            ) : (
              <InstagramIcon size={10} />
            )
          ) : null}
          <span className="truncate text-[13.5px] font-medium text-ink">
            {isReel ? item.caption : item.body}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] font-medium text-ink-faint">
          {item.meta}
          {item.kind === 'yap' && item.aiReply && (
            <span className="inline-flex items-center gap-0.5 text-navy-500">
              <Sparkles size={11} /> replied
            </span>
          )}
        </div>
      </div>

      <ChevronRight size={17} className="flex-shrink-0 text-ink-faint" />
    </button>
  )
}
