import { useState, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface Props {
  title: ReactNode
  /** plain-text label for the a11y toggle */
  label: string
  children: ReactNode
  /** optional element shown to the left of the eye (e.g. a count) */
  aside?: ReactNode
  defaultOpen?: boolean
}

export function Section({ title, label, children, aside, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-2 px-1">
        <h2 className="min-w-0 truncate text-[17px] font-semibold tracking-tight text-ink">
          {title}
        </h2>
        <div className="flex flex-shrink-0 items-center gap-2">
          {aside}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? `Hide ${label}` : `Show ${label}`}
            aria-expanded={open}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-faint transition-colors active:bg-paper-dim"
          >
            {open ? <Eye size={18} strokeWidth={1.9} /> : <EyeOff size={18} strokeWidth={1.9} />}
          </button>
        </div>
      </div>

      <div className="collapsible" data-open={open}>
        <div className="collapsible-inner">
          <div style={{ opacity: open ? 1 : 0, transition: 'opacity 0.28s ease' }}>{children}</div>
        </div>
      </div>
    </section>
  )
}
