import { ChevronRight } from 'lucide-react'
import type { AssetNode } from '../data/portfolio'

export function Breadcrumb({
  path,
  onJump,
}: {
  path: AssetNode[]
  onJump: (index: number) => void
}) {
  return (
    <div className="no-scrollbar flex items-center gap-1 overflow-x-auto px-1">
      {path.map((node, i) => {
        const last = i === path.length - 1
        return (
          <div key={node.id} className="flex flex-shrink-0 items-center gap-1">
            {i > 0 && <ChevronRight size={14} className="text-ink-faint" />}
            <button
              onClick={() => !last && onJump(i)}
              disabled={last}
              className={
                'rounded-md px-1.5 py-1 text-[13px] font-medium transition-colors ' +
                (last ? 'text-ink' : 'text-ink-faint active:bg-paper-dim')
              }
            >
              {i === 0 ? 'Portfolio' : node.name}
            </button>
          </div>
        )
      })}
    </div>
  )
}
