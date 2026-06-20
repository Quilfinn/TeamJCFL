import { Square } from 'lucide-react'
import { Sheet } from './Sheet'

const BARS = Array.from({ length: 32 })

export function RecordingDrawer({
  open,
  phase = 'listening',
  onStop,
  onCancel,
}: {
  open: boolean
  phase?: 'listening' | 'processing'
  onStop: () => void
  onCancel: () => void
}) {
  const processing = phase === 'processing'
  return (
    <Sheet open={open} onClose={processing ? () => {} : onCancel} variant="light">
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
            {!processing && <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-rose)]" />}
            {processing ? 'Got it' : 'Listening…'}
          </div>
          <div className="mt-1 text-[12.5px] font-medium text-ink-faint">
            {processing ? 'Orbit is transcribing your note' : 'Speak your memo — Orbit is transcribing'}
          </div>
        </div>

        {/* equalizer — settles into a flat line as we transcribe */}
        <div className="relative mt-7 flex h-16 items-center justify-center gap-[3px]">
          {BARS.map((_, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full"
              style={{
                height: '100%',
                transformOrigin: 'center',
                background: 'linear-gradient(180deg, #6fa1f3, #1f54c7)',
                animation: processing ? undefined : `eq ${0.7 + (i % 5) * 0.12}s ease-in-out infinite`,
                transform: processing ? 'scaleY(0.12)' : undefined,
                opacity: processing ? 0.4 : 0.45 + (i % 4) * 0.14,
                transition: 'transform 0.4s ease, opacity 0.4s ease',
              }}
            />
          ))}
        </div>

        {/* control — stop button, or a spinner while transcribing */}
        <div className="relative mt-8 flex flex-col items-center gap-4">
          <div className="relative flex h-[76px] w-[76px] items-center justify-center">
            {processing ? (
              <>
                <span
                  className="absolute h-[68px] w-[68px] rounded-full"
                  style={{ border: '3px solid rgba(31,84,199,0.16)' }}
                />
                <span
                  className="absolute h-[68px] w-[68px] rounded-full"
                  style={{
                    border: '3px solid transparent',
                    borderTopColor: '#1f54c7',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
          {!processing && (
            <button onClick={onCancel} className="text-[13.5px] font-medium text-ink-faint">
              Cancel
            </button>
          )}
        </div>
      </div>
    </Sheet>
  )
}
