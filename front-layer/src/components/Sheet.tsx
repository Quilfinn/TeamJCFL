import type { ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** glass = bold navy gradient; light = clean surface */
  variant?: 'glass' | 'light'
}

export function Sheet({ open, onClose, children, variant = 'light' }: Props) {
  if (!open) return null
  const glass = variant === 'glass'
  return (
    <div className="pointer-events-auto absolute inset-0">
      {/* backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-[#05060f]/45"
        style={{ animation: 'fadeIn 0.25s ease both', backdropFilter: 'blur(2px)' }}
      />
      {/* panel */}
      <div
        className="absolute inset-x-0 bottom-0 max-h-[92%] overflow-hidden rounded-t-[32px]"
        style={{
          animation: 'sheetIn 0.42s cubic-bezier(0.22,1,0.36,1) both',
          background: glass
            ? 'linear-gradient(168deg, #1b3fa6 0%, #122a72 44%, #0a1538 100%)'
            : 'var(--color-surface)',
          boxShadow: glass
            ? 'inset 0 1px 0 rgba(255,255,255,0.18), 0 -20px 60px -20px rgba(8,14,32,0.5)'
            : '0 -20px 60px -24px rgba(8,14,32,0.3)',
          border: glass ? '0.5px solid rgba(255,255,255,0.14)' : '0.5px solid var(--color-line)',
        }}
      >
        {/* grabber */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="h-1 w-10 rounded-full"
            style={{ background: glass ? 'rgba(255,255,255,0.3)' : 'var(--color-line)' }}
          />
        </div>
        <div className="no-scrollbar max-h-[calc(92svh-1.5rem)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
