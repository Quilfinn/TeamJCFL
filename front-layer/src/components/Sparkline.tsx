import { useMemo } from 'react'

export function Sparkline({
  data,
  up,
  width = 72,
  height = 30,
}: {
  data: number[]
  up: boolean
  width?: number
  height?: number
}) {
  const d = useMemo(() => {
    const lo = Math.min(...data)
    const hi = Math.max(...data)
    const span = hi - lo || 1
    return data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * width
        const y = 3 + (1 - (v - lo) / span) * (height - 6)
        return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
      })
      .join(' ')
  }, [data, width, height])

  const color = up ? 'var(--color-mint)' : 'var(--color-rose)'
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
