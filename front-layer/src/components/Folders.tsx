import { ArrowUpRight, Plus } from 'lucide-react'
import { SKINS, type FeedItem, type SkinKey } from '../data/feed'
import { tileBg, tileShadow } from '../lib/palette'

export interface FolderData {
  name: string
  skin: SkinKey
  items: FeedItem[]
}

export function Folders({
  folders,
  onOpen,
  onCreate,
}: {
  folders: FolderData[]
  onOpen: (name: string) => void
  onCreate: () => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3.5">
      {folders.map((f) => {
        const hex = SKINS[f.skin]
        return (
          <button
            key={f.name}
            onClick={() => onOpen(f.name)}
            className="relative active:scale-[0.98]"
            style={{ transition: 'transform 0.2s ease' }}
          >
            {/* hint of the cards stacked inside */}
            <span
              className="absolute inset-x-3 -top-1.5 h-3 rounded-t-[12px]"
              style={{ background: tileBg(hex), opacity: 0.5 }}
            />
            <span
              className="absolute inset-x-1.5 -top-[3px] h-3 rounded-t-[13px]"
              style={{ background: tileBg(hex), opacity: 0.75 }}
            />

            <div
              className="relative flex h-[112px] flex-col justify-between overflow-hidden rounded-[20px] p-4 text-left"
              style={{ background: tileBg(hex), boxShadow: tileShadow(hex) }}
            >
              <div className="grain-overlay" aria-hidden />
              <div className="relative text-[15px] font-semibold leading-tight text-white">{f.name}</div>
              <div className="relative flex items-end justify-between">
                <span className="tnum text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.66)' }}>
                  {f.items.length} {f.items.length === 1 ? 'card' : 'cards'}
                </span>
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-white"
                  style={{ background: 'rgba(255,255,255,0.16)' }}
                >
                  <ArrowUpRight size={15} />
                </span>
              </div>
            </div>
          </button>
        )
      })}

      {/* create-folder tile */}
      <button
        key="__create"
        onClick={onCreate}
        aria-label="Create folder"
        className="flex h-[112px] flex-col items-center justify-center gap-2 rounded-[20px] active:scale-[0.98]"
        style={{
          border: '1.5px dashed rgba(10,14,26,0.18)',
          background: 'var(--color-paper-dim)',
          transition: 'transform 0.2s ease',
        }}
      >
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full text-white"
          style={{ background: 'var(--color-navy-700)', boxShadow: '0 6px 14px -6px rgba(18,42,114,0.6)' }}
        >
          <Plus size={18} strokeWidth={2.4} />
        </span>
        <span className="text-[13px] font-semibold text-ink-soft">New folder</span>
      </button>
    </div>
  )
}
