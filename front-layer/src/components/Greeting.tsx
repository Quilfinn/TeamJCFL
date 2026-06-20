import { Star } from 'lucide-react'
import { partOfDay } from '../lib/greeting'

const reveal = (delay: number) => ({
  display: 'inline-block',
  animation: 'introUp 0.95s cubic-bezier(0.16,1,0.3,1) both',
  animationDelay: `${delay}s`,
})

export function Greeting({
  name,
  initial,
  onWatchlist,
}: {
  name: string
  initial: string
  onWatchlist?: () => void
}) {
  return (
    <div className="flex items-center justify-between px-6 pt-1 pb-3">
      <div className="text-[18px] tracking-tight">
        <span className="font-medium text-ink-faint" style={reveal(1.55)}>
          {partOfDay()},&nbsp;
        </span>
        <span className="font-semibold text-ink" style={reveal(1.66)}>
          {name}.
        </span>
      </div>
      <div
        className="flex items-center gap-1.5"
        style={{ animation: 'introUp 0.85s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '1.78s' }}
      >
        <button
          onClick={onWatchlist}
          aria-label="Watchlist"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-dim text-ink-soft active:scale-95"
        >
          <Star size={18} strokeWidth={2} />
        </button>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-paper-dim text-[14px] font-semibold text-ink-soft">
          {initial}
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-navy-500" />
        </button>
      </div>
    </div>
  )
}
