import { useEffect, useRef } from 'react'
import { TikTokIcon, InstagramIcon } from './BrandIcons'
import { AIOrb } from './AIOrb'
import type { ReelItem } from '../data/feed'

interface Props {
  reel: ReelItem | null
  onDone: (reel: ReelItem) => void
}

/**
 * The "a reel just arrived from TikTok" hand-off. Plays for ~1.8s when the
 * client shares something into Signal, then deposits the reel via onDone.
 * Sells the opening beat of the demo: scrolling TikTok → shared into the app.
 */
export function ShareIntake({ reel, onDone }: Props) {
  // Keep onDone in a ref so background re-renders (polling) can't reset the timer.
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (!reel) return
    const r = reel
    const t = setTimeout(() => onDoneRef.current(r), 1850)
    return () => clearTimeout(t)
    // run exactly once per reel arrival
  }, [reel?.id])

  if (!reel) return null
  const Source = reel.source === 'tiktok' ? TikTokIcon : InstagramIcon
  const sourceName = reel.source === 'tiktok' ? 'TikTok' : 'Instagram'

  return (
    <div
      className="absolute inset-0 z-[80] flex flex-col items-center justify-center px-8"
      style={{
        background: 'radial-gradient(120% 90% at 50% 35%, #0a1230 0%, #070b1c 60%, #05070f 100%)',
        animation: 'shareFade 0.45s ease both',
      }}
    >
      {/* hand-off: source → Signal */}
      <div className="flex items-center gap-5">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-white"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '0.5px solid rgba(255,255,255,0.16)',
            animation: 'shareLeave 1.8s cubic-bezier(0.5,0,0.2,1) both',
          }}
        >
          <Source size={26} />
        </span>

        {/* travelling spark */}
        <span className="relative flex h-[2px] w-16 items-center overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }}>
          <span
            className="absolute h-full w-6 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, #6fa1f3, transparent)',
              animation: 'shareSpark 1.1s cubic-bezier(0.5,0,0.2,1) 0.25s both',
            }}
          />
        </span>

        <span style={{ animation: 'shareArrive 1.8s cubic-bezier(0.22,1,0.36,1) both' }}>
          <AIOrb size={56} float={false} />
        </span>
      </div>

      <div className="mt-9 text-center" style={{ animation: 'introUp 0.6s ease 0.5s both' }}>
        <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-white/45">
          Received from {sourceName}
        </div>
        <p className="mx-auto mt-2 max-w-[16rem] text-[15.5px] font-semibold leading-snug text-white">
          {reel.caption}
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-white/55">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-mint)', animation: 'glowPulse 1.4s ease-in-out infinite' }} />
          Adding to Signal
        </div>
      </div>
    </div>
  )
}
