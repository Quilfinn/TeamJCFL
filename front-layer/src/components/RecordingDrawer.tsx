import { Square } from 'lucide-react'
import { Sheet } from './Sheet'

const BARS = Array.from({ length: 32 })

export function RecordingDrawer({
  open,
  onStop,
  onCancel,
}: {
  open: boolean
  onStop: () => void
  onCancel: () => void
}) {
  return (
    <Sheet open={open} onClose={onCancel} variant="light">
      <div className="relative px-5 pt-3 pb-9">
        {/* soft blue wash at the top of the sheet */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{
            background:
              'radial-gradient(90% 100% at 50% 0%, rgba(31,84,199,0.14), rgba(31,84,199,0) 70%)',
          }}
        />

        <div className="relative text-center">
          <div className="inline-flex items-center gap-2 text-[16px] font-semibold text-ink">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-rose)]" />
            Listening…
          </div>
          <div className="mt-1 text-[12.5px] font-medium text-ink-faint">
            Speak your memo — Signal AI is transcribing
          </div>
        </div>

        {/* equalizer */}
        <div className="relative mt-7 flex h-16 items-center justify-center gap-[3px]">
          {BARS.map((_, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full"
              style={{
                height: '100%',
                transformOrigin: 'center',
                background: 'linear-gradient(180deg, #6fa1f3, #1f54c7)',
                animation: `eq ${0.7 + (i % 5) * 0.12}s ease-in-out infinite`,
                animationDelay: `${(i % 7) * 0.06}s`,
                opacity: 0.45 + (i % 4) * 0.14,
              }}
            />
          ))}
        </div>

        {/* stop button with glowing blue halo */}
        <div className="relative mt-8 flex flex-col items-center gap-4">
          <div className="relative flex h-[76px] w-[76px] items-center justify-center">
            <span
              className="absolute inset-0 rounded-full blur-md"
              style={{
                background: 'radial-gradient(circle, #2a64e0, rgba(42,100,224,0))',
                animation: 'glowPulse 2.4s ease-in-out infinite',
              }}
            />
            {/* gradient ring */}
            <span
              className="absolute inset-0 rounded-full"
              style={{ background: 'conic-gradient(from 140deg, #7db0f5, #1f54c7, #7db0f5)' }}
            />
            <button
              onClick={onStop}
              aria-label="Stop recording"
              className="relative flex h-[68px] w-[68px] items-center justify-center rounded-full bg-surface transition-transform active:scale-95"
              style={{ boxShadow: 'inset 0 1px 2px rgba(8,14,32,0.1)' }}
            >
              <Square size={22} className="fill-navy-700 text-navy-700" />
            </button>
          </div>
          <button onClick={onCancel} className="text-[13.5px] font-medium text-ink-faint">
            Cancel
          </button>
        </div>
      </div>
    </Sheet>
  )
}
