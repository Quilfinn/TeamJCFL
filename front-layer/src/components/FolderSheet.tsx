import { FolderOutput } from 'lucide-react'
import { Sheet } from './Sheet'
import { PassHead } from './PassCard'
import { SKINS, type FeedItem, type SkinKey } from '../data/feed'
import { tileBg, tileShadow } from '../lib/palette'

export interface OpenFolder {
  name: string
  skin: SkinKey
  items: FeedItem[]
}

export function FolderSheet({
  folder,
  onClose,
  onOpen,
  onRemove,
}: {
  folder: OpenFolder | null
  onClose: () => void
  onOpen: (i: FeedItem) => void
  onRemove: (i: FeedItem) => void
}) {
  const tone = folder ? SKINS[folder.skin] : null
  return (
    <Sheet open={!!folder} onClose={onClose} variant="light">
      {folder && tone && (
        <div className="px-5 pb-9 pt-2">
          <div className="flex items-center gap-2.5">
            <span className="h-3.5 w-3.5 rounded-[5px]" style={{ background: tone }} />
            <h3 className="text-[19px] font-semibold tracking-tight text-ink">{folder.name}</h3>
            <span className="tnum ml-auto rounded-full bg-paper-dim px-2.5 py-1 text-[12px] font-semibold text-ink-soft">
              {folder.items.length}
            </span>
          </div>
          <p className="mt-1 text-[12.5px] font-medium text-ink-faint">
            Tap a card to revisit it, or move it back to your stack
          </p>

          {folder.items.length === 0 ? (
            <div className="mt-5 rounded-[20px] border border-dashed border-line py-10 text-center">
              <div className="text-[13.5px] font-medium text-ink">This folder is empty</div>
              <div className="mt-0.5 text-[12px] text-ink-faint">File a card here from your stack</div>
            </div>
          ) : (
            <div className="mt-5">
              {folder.items.map((item, i) => {
                const hex = SKINS[item.skin]
                return (
                  <div
                    key={item.id}
                    className="relative overflow-hidden rounded-[22px]"
                    style={{
                      background: tileBg(hex),
                      boxShadow: tileShadow(hex),
                      marginTop: i === 0 ? 0 : -14,
                      transformOrigin: 'top center',
                      animation: `fanUp 0.5s cubic-bezier(0.22,1,0.36,1) both`,
                      animationDelay: `${0.05 + i * 0.07}s`,
                    }}
                  >
                    <div className="grain-overlay" aria-hidden />
                    <div className="relative flex items-center gap-2 px-5 py-5">
                      <button onClick={() => onOpen(item)} className="min-w-0 flex-1 text-left active:opacity-80">
                        <PassHead item={item} />
                      </button>
                      <button
                        onClick={() => onRemove(item)}
                        aria-label="Move back to stack"
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-white active:scale-95"
                        style={{ background: 'rgba(255,255,255,0.16)' }}
                      >
                        <FolderOutput size={17} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </Sheet>
  )
}
