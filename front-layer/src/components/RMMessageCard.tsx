import { useState } from 'react'
import { MessageCircle, ChevronRight } from 'lucide-react'

interface Props {
  headline: string
  body: string
  fresh?: boolean
  onDiscuss: () => void
}

/** A message delivered to the client after the RM approves an opportunity. */
export function RMMessageCard({ headline, body, fresh, onDiscuss }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="overflow-hidden rounded-[20px]"
      style={{
        background: 'var(--color-surface)',
        border: '0.5px solid var(--color-line)',
        boxShadow: '0 1px 2px rgba(8,14,32,0.05), 0 12px 28px -16px rgba(8,14,32,0.28)',
        animation: fresh ? 'deckDrop 0.6s cubic-bezier(0.22,1,0.36,1) both' : undefined,
      }}
    >
      {/* brand accent */}
      <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg,#3b78ec,#6fa1f3 55%,#3b78ec)' }} />
      <div className="p-4">
        <div className="mb-2.5 flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ background: 'linear-gradient(158deg,#3b78ec 0%,#0a1230 100%)' }}
          >
            AK
          </div>
          <div className="leading-tight">
            <div className="text-[12.5px] font-semibold text-ink">Anna Keller</div>
            <div className="text-[10.5px] text-ink-faint">Your relationship manager · just now</div>
          </div>
        </div>

        <p className="text-[14px] font-semibold leading-snug text-ink">{headline}</p>
        <p
          className={`mt-1 text-[13px] leading-relaxed text-ink-soft ${open ? '' : 'line-clamp-2'}`}
        >
          {body}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onDiscuss}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold text-white active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg,#0a1230 0%,#122a72 100%)' }}
          >
            <MessageCircle size={13} /> Discuss with Anna
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-0.5 rounded-xl px-3 py-2 text-[12px] font-medium text-ink-soft"
            style={{ border: '0.5px solid var(--color-line)', background: 'var(--color-paper)' }}
          >
            {open ? 'Show less' : 'Read more'}
            <ChevronRight size={12} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
        </div>
      </div>
    </div>
  )
}
