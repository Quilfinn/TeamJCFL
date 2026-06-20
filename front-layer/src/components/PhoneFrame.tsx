import type { ReactNode } from 'react'
import { Wifi, BatteryFull, SignalHigh } from 'lucide-react'

/**
 * A neutral device frame so the webview reads as a phone in the demo.
 * On a real device the inner screen simply fills the viewport.
 */
export function PhoneFrame({
  children,
  nav,
  overlay,
}: {
  children: ReactNode
  nav?: ReactNode
  overlay?: ReactNode
}) {
  return (
    <div className="flex min-h-full w-full items-center justify-center bg-[#1a1a1a] p-0 sm:p-6">
      <div className="relative h-[100svh] w-full max-w-[420px] overflow-hidden bg-paper sm:h-[880px] sm:rounded-[46px] sm:border-[10px] sm:border-black sm:shadow-2xl">
        {/* atmosphere — barely-there warm paper with a cool glow up top */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              'radial-gradient(120% 60% at 50% -8%, rgba(31,84,199,0.10), rgba(31,84,199,0) 58%), linear-gradient(180deg, #f7f7f4 0%, #f3f3ef 100%)',
          }}
        />

        {/* status bar */}
        <div className="pointer-events-none relative z-30 flex h-11 items-center justify-between px-7 pt-2 text-[13px] font-semibold text-ink">
          <span className="tnum">9:41</span>
          <div className="flex items-center gap-1.5">
            <SignalHigh size={16} strokeWidth={2.4} />
            <Wifi size={15} strokeWidth={2.4} />
            <BatteryFull size={20} strokeWidth={2} />
          </div>
        </div>

        <div className="no-scrollbar relative z-10 h-[calc(100%-2.75rem)] overflow-y-auto">
          {children}
        </div>

        {nav && <div className="absolute inset-x-0 bottom-0 z-40">{nav}</div>}

        {overlay && (
          <div className="pointer-events-none absolute inset-0 z-50">{overlay}</div>
        )}
      </div>
    </div>
  )
}
