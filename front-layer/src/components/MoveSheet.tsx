import { Plus, ChevronRight } from 'lucide-react'
import { Sheet } from './Sheet'
import { passBits } from './PassCard'
import { SKINS, type FeedItem, type SkinKey } from '../data/feed'
import { tileBg } from '../lib/palette'

export interface MoveFolder {
  name: string
  skin: SkinKey
  count: number
}

export function MoveSheet({
  item,
  folders,
  onPick,
  onCreate,
  onClose,
}: {
  item: FeedItem | null
  folders: MoveFolder[]
  onPick: (name: string) => void
  onCreate: () => void
  onClose: () => void
}) {
  return (
    <Sheet open={!!item} onClose={onClose} variant="light">
      {item && (
        <div className="px-5 pb-9 pt-2">
          <h3 className="text-[19px] font-semibold tracking-tight text-ink">Move to folder</h3>
          <p className="mt-1 truncate text-[12.5px] font-medium text-ink-faint">{passBits(item).title}</p>

          <div className="mt-5 flex flex-col gap-2">
            {folders.map((f) => (
              <button
                key={f.name}
                onClick={() => onPick(f.name)}
                className="flex items-center gap-3 rounded-[18px] border border-line bg-surface p-2.5 pr-3 text-left active:scale-[0.99]"
              >
                <span
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px]"
                  style={{ background: tileBg(SKINS[f.skin]) }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[14.5px] font-semibold text-ink">{f.name}</div>
                  <div className="tnum text-[12px] font-medium text-ink-faint">
                    {f.count} {f.count === 1 ? 'card' : 'cards'}
                  </div>
                </div>
                <ChevronRight size={18} className="text-ink-faint" />
              </button>
            ))}

            <button
              onClick={onCreate}
              className="mt-1 flex items-center gap-3 rounded-[18px] p-2.5 text-left active:scale-[0.99]"
              style={{ border: '1.5px dashed rgba(10,14,26,0.18)', background: 'var(--color-paper-dim)' }}
            >
              <span
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] text-white"
                style={{ background: 'var(--color-navy-700)' }}
              >
                <Plus size={19} strokeWidth={2.4} />
              </span>
              <span className="text-[14.5px] font-semibold text-ink-soft">New folder</span>
            </button>
          </div>
        </div>
      )}
    </Sheet>
  )
}
