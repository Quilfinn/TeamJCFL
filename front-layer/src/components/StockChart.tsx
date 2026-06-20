import { useMemo } from 'react'
import { fmtUSD } from '../lib/series'

interface Props {
  data: number[]
  current: number
  target: number
  /** chart height in px */
  height?: number
}

/** White line chart on a gradient card, matching the assistant action card. */
export function StockChart({ data, current, target, height = 130 }: Props) {
  const W = 320
  const H = height
  const padY = 22

  const { linePath, areaPath, dotX, dotY, targetY } = useMemo(() => {
    const lo = Math.min(...data, target)
    const hi = Math.max(...data, target)
    const span = hi - lo || 1
    const x = (i: number) => (i / (data.length - 1)) * W
    const y = (v: number) => padY + (1 - (v - lo) / span) * (H - padY * 2)
    const pts = data.map((v, i) => [x(i), y(v)] as const)
    const line = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join(' ')
    const area = `${line} L${W} ${H} L0 ${H} Z`
    return {
      linePath: line,
      areaPath: area,
      dotX: pts[pts.length - 1][0],
      dotY: pts[pts.length - 1][1],
      targetY: y(target),
    }
  }, [data, target, H])

  return (
    <div className="relative" style={{ height: H }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        {/* target line */}
        <line
          x1="0"
          x2={W}
          y1={targetY}
          y2={targetY}
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1.5"
          strokeDasharray="1 6"
          strokeLinecap="round"
        />
        <path d={areaPath} fill="url(#chartArea)" />
        <path
          d={linePath}
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: 'drawLine 1.1s ease forwards' }}
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={dotX} cy={dotY} r="4.5" fill="#fff" />
      </svg>

      {/* current price pill at the dot */}
      <span
        className="tnum absolute -translate-y-1/2 rounded-full bg-white px-2 py-0.5 text-[12px] font-semibold text-navy-800"
        style={{ left: `calc(${(dotX / W) * 100}% - 8px)`, top: dotY, transform: 'translate(-100%, -150%)' }}
      >
        {fmtUSD(current)}
      </span>
      {/* target pill */}
      <span
        className="tnum absolute right-0 -translate-y-1/2 rounded-full bg-white/25 px-2 py-0.5 text-[11.5px] font-semibold text-white"
        style={{ top: targetY }}
      >
        {fmtUSD(target)}
      </span>
    </div>
  )
}
