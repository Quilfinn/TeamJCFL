import { ChevronLeft, MessageCircle, CalendarClock, Phone, Sparkles } from 'lucide-react'
import { CLARA_PHOTO } from './ClaraAvatar'

interface Props {
  open: boolean
  onClose: () => void
  onMessage: () => void
  onBook: () => void
}

export function AdvisorPage({ open, onClose, onMessage, onBook }: Props) {
  if (!open) return null
  return (
    <div
      className="pointer-events-auto absolute inset-0 z-[70] bg-paper"
      style={{ animation: 'pageIn 0.4s cubic-bezier(0.22,1,0.36,1) both' }}
    >
      <div className="no-scrollbar h-full overflow-y-auto pb-10">
        {/* top bar */}
        <div className="flex items-center gap-1 px-4 pt-3 pb-2">
          <button
            onClick={onClose}
            aria-label="Back"
            className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full text-ink active:bg-paper-dim"
          >
            <ChevronLeft size={24} strokeWidth={2.2} />
          </button>
          <span className="text-[15px] font-semibold tracking-tight text-ink">Your advisor</span>
        </div>

        {/* hero */}
        <div className="px-6 pt-3">
          <div
            className="relative overflow-hidden rounded-[28px] p-5"
            style={{
              background:
                'radial-gradient(120% 90% at 80% -10%, #2a64e0 0%, #16308a 40%, #0b1838 72%, #070d1f 100%), #070d1f',
              boxShadow: '0 24px 48px -22px rgba(11,24,56,0.6)',
            }}
          >
            <div className="grain-overlay" style={{ opacity: 0.1 }} aria-hidden />
            <div className="relative flex items-center gap-4">
              <img
                src={CLARA_PHOTO}
                alt="Clara Bensimon"
                className="h-[72px] w-[72px] flex-shrink-0 rounded-2xl object-cover"
                style={{ boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.3)' }}
              />
              <div>
                <div className="text-[20px] font-semibold tracking-tight text-white">
                  Clara Bensimon
                </div>
                <div className="text-[13px] font-medium text-white/55">
                  Relationship manager · Julius Baer
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-[11.5px] font-medium text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-mint)]" />
                  Available now
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 px-6">
          <button
            onClick={onMessage}
            className="flex items-center justify-center gap-2 rounded-2xl bg-navy-900 py-3.5 text-[14.5px] font-semibold text-white active:scale-[0.98]"
          >
            <MessageCircle size={17} /> Message
          </button>
          <button
            onClick={onBook}
            className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface py-3.5 text-[14.5px] font-semibold text-ink active:scale-[0.98]"
          >
            <CalendarClock size={17} /> Book a call
          </button>
        </div>

        {/* latest note */}
        <div className="mt-5 px-6">
          <div className="mb-2 px-1 text-[13px] font-semibold text-ink-soft">Latest from Clara</div>
          <div className="card p-4">
            <p className="text-[14px] leading-snug text-ink">
              “Saw your gold reel — I’d frame it as a 3–5% hedge, not a pivot. Free at 4pm to walk
              through it?”
            </p>
            <div className="mt-2 text-[11.5px] font-medium text-ink-faint">1h ago</div>
          </div>
        </div>

        {/* about */}
        <div className="mt-5 px-6">
          <div className="mb-2 px-1 text-[13px] font-semibold text-ink-soft">About</div>
          <div className="card p-4 text-[13.5px] leading-relaxed text-ink-soft">
            <div className="flex items-start gap-2.5">
              <Sparkles size={16} className="mt-0.5 flex-shrink-0 text-navy-500" />
              <span>
                15 years advising founders and creators. Specialises in concentrated-stock planning,
                alternatives and tax-aware rebalancing.
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2.5 border-t border-line pt-3 text-ink-soft">
              <Phone size={15} className="flex-shrink-0 text-navy-500" />
              <span className="font-medium">+41 58 888 11 11 · Zurich</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
