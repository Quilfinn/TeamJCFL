import { Square } from 'lucide-react'
import { Sheet } from './Sheet'

const BARS = Array.from({ length: 28 })

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
    <Sheet open={open} onClose={onCancel} variant="glass">
      <div className="px-5 pt-2 pb-8 text-white">
        <div className="text-center text-[15px] font-semibold">Listening…</div>
        <div className="mt-1 text-center text-[12.5px] font-medium text-white/55">
          Speak your memo — Signal AI is transcribing
        </div>

        {/* equalizer */}
        <div className="mt-7 flex h-16 items-center justify-center gap-[3px]">
          {BARS.map((_, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-white/80"
              style={{
                height: '100%',
                transformOrigin: 'center',
                animation: `eq ${0.7 + (i % 5) * 0.12}s ease-in-out infinite`,
                animationDelay: `${(i % 7) * 0.06}s`,
                opacity: 0.5 + ((i % 4) * 0.12),
              }}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={onStop}
            aria-label="Stop recording"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white active:scale-95"
            style={{ boxShadow: '0 8px 24px -6px rgba(0,0,0,0.4)' }}
          >
            <Square size={22} className="fill-navy-900 text-navy-900" />
          </button>
          <button onClick={onCancel} className="text-[13.5px] font-medium text-white/60">
            Cancel
          </button>
        </div>
      </div>
    </Sheet>
  )
}
