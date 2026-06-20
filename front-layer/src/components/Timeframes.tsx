export interface Timeframe {
  key: string
  label: string
  /** multiplier applied to the node's 1-day change */
  factor: number
}

export const TIMEFRAMES: Timeframe[] = [
  { key: '1D', label: '1D', factor: 1 },
  { key: '1W', label: '1W', factor: 2.6 },
  { key: '1M', label: '1M', factor: 4.3 },
  { key: '1Y', label: '1Y', factor: 12.4 },
  { key: 'MAX', label: 'Max', factor: 38 },
]

export function Timeframes({
  active,
  onChange,
}: {
  active: string
  onChange: (key: string) => void
}) {
  const idx = Math.max(0, TIMEFRAMES.findIndex((t) => t.key === active))
  const n = TIMEFRAMES.length
  return (
    <div
      className="relative flex rounded-full p-1"
      style={{ background: 'rgba(10,14,26,0.05)' }}
    >
      {/* sliding indicator */}
      <span
        className="absolute top-1 bottom-1 rounded-full bg-surface"
        style={{
          left: 4,
          width: `calc((100% - 8px) / ${n})`,
          transform: `translateX(${idx * 100}%)`,
          transition: 'transform 0.42s cubic-bezier(0.22,1,0.36,1)',
          boxShadow: '0 1px 2px rgba(8,14,32,0.12), 0 2px 8px -2px rgba(8,14,32,0.16)',
        }}
      />
      {TIMEFRAMES.map((t) => {
        const on = t.key === active
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className="relative z-10 flex-1 py-1.5 text-[12.5px] font-semibold transition-colors"
            style={{ color: on ? 'var(--color-ink)' : 'var(--color-ink-faint)' }}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
