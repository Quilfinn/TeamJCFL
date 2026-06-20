import { House, Mic } from 'lucide-react'
import { ClaraAvatar } from './ClaraAvatar'

interface Props {
  active?: string
  onChange?: (id: string) => void
  onMicDown?: () => void
}

export function BottomNav({ active = 'home', onChange, onMicDown }: Props) {
  return (
    <div
      className="flex justify-center px-5 pb-7 pt-2"
      style={{ animation: 'introUp 0.85s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '1.95s' }}
    >
      <div
        className="flex items-center gap-7 rounded-full px-6 py-2.5"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.32))',
          backdropFilter: 'blur(22px) saturate(200%)',
          WebkitBackdropFilter: 'blur(22px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.55)',
          boxShadow:
            '0 12px 36px -10px rgba(8,14,32,0.28), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 1px rgba(255,255,255,0.25)',
        }}
      >
        <button
          onClick={() => onChange?.('home')}
          aria-label="Home"
          className="flex h-11 w-11 items-center justify-center transition-transform active:scale-90"
          style={{ color: active === 'home' ? 'var(--color-navy-900)' : 'var(--color-ink-faint)' }}
        >
          <House size={24} strokeWidth={active === 'home' ? 2.4 : 1.9} />
        </button>

        {/* big record — the hero action */}
        <button
          onPointerDown={onMicDown}
          aria-label="Hold to record a memo"
          className="flex h-[54px] w-[54px] touch-none items-center justify-center rounded-full text-white transition-transform active:scale-[0.92]"
          style={{
            background: 'linear-gradient(158deg, #2a64e0 0%, #11215a 100%)',
            boxShadow:
              '0 8px 20px -4px rgba(17,33,90,0.6), 0 0 0 5px rgba(255,255,255,0.55), inset 0 1px 0 rgba(255,255,255,0.32)',
          }}
        >
          <Mic size={24} strokeWidth={2.2} />
        </button>

        <button
          onClick={() => onChange?.('advisor')}
          aria-label="Clara, your advisor"
          className="flex h-11 w-11 items-center justify-center transition-transform active:scale-90"
        >
          <ClaraAvatar size={34} ring={active === 'advisor'} />
        </button>
      </div>
    </div>
  )
}
