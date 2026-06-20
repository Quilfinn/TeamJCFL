import { ArrowUpRight } from 'lucide-react'
import { RollingNumber } from './RollingNumber'
import baerLogo from '../assets/baer.png'
import type { AssetNode } from '../data/portfolio'

const groupCHF = new Intl.NumberFormat('de-CH', { maximumFractionDigits: 0 })

interface Props {
  node: AssetNode
  atRoot: boolean
  pct: number
  delta: number
  periodLabel: string
}

export function BalanceCard({ node, atRoot, pct, delta, periodLabel }: Props) {
  const up = pct >= 0
  return (
    <div
      className="relative flex min-h-[208px] flex-col overflow-hidden rounded-[28px]"
      style={{
        background: [
          'radial-gradient(125% 95% at 78% -10%, #7db0f5 0%, #2a64e0 26%, #16308a 52%, #0b1838 76%, #070d1f 100%)',
          '#070d1f',
        ].join(', '),
        boxShadow: '0 1px 2px rgba(8,14,32,0.1), 0 26px 50px -22px rgba(11,24,56,0.65)',
      }}
    >
      {/* diagonal metallic sheen */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(118deg, rgba(255,255,255,0) 32%, rgba(255,255,255,0.22) 44%, rgba(255,255,255,0) 56%)',
        }}
      />
      <div className="grain-overlay" style={{ opacity: 0.1 }} aria-hidden />

      <div className="relative flex flex-1 flex-col justify-between p-5">
        {/* top: logo + balance */}
        <div className="flex items-start justify-between">
          <img
            src={baerLogo}
            alt="Julius Baer"
            className="h-8 w-auto"
            style={{ filter: 'brightness(0) invert(1)', opacity: 0.95 }}
          />

          <div className="text-right">
            <div className="flex items-start justify-end gap-1.5">
              <span className="mt-[7px] text-[18px] font-light leading-none tracking-tight text-white/65">
                CHF
              </span>
              <RollingNumber
                value={node.value}
                format={(n) => groupCHF.format(Math.round(n))}
                className="tnum text-[42px] leading-none font-light tracking-[-0.04em] text-white"
              />
            </div>
            <div className="mt-1.5 text-[11.5px] font-medium tracking-wide text-white/55">
              {atRoot ? 'Total balance' : node.name}
            </div>
          </div>
        </div>

        {/* bottom: brand + delta */}
        <div className="flex items-end justify-between">
          <div className="leading-tight">
            <div className="text-[16px] font-medium text-white">Premium banking</div>
            <div className="text-[12.5px] font-medium text-white/50">Julius Baer</div>
          </div>

          <div className="text-right">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[12.5px] font-semibold"
              style={{
                background: up ? 'rgba(95,227,171,0.16)' : 'rgba(255,139,142,0.16)',
                color: up ? '#7defb9' : '#ff9ea0',
              }}
            >
              <ArrowUpRight
                size={13}
                strokeWidth={2.6}
                style={{ transform: up ? 'none' : 'rotate(90deg)' }}
              />
              <RollingNumber
                value={Math.abs(pct)}
                format={(n) => `${up ? '' : '−'}${n.toFixed(2)}%`}
                className="tnum"
                duration={0.6}
              />
            </span>
            <div className="mt-1 flex items-center justify-end gap-1 text-[11.5px] font-medium text-white/45">
              <RollingNumber
                value={Math.abs(delta)}
                format={(n) => `${up ? '+' : '−'}CHF ${groupCHF.format(Math.round(n))}`}
                className="tnum"
                duration={0.6}
              />
              <span>{periodLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* bottom accent line */}
      <div
        className="absolute inset-x-0 bottom-0 h-[3px]"
        style={{ background: 'linear-gradient(90deg, #2a64e0, #7db0f5 55%, #2a64e0)' }}
      />
    </div>
  )
}
