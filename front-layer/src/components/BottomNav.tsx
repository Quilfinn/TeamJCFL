import { House, ChartPie, Mic } from 'lucide-react'

interface Props {
  active?: string
  onChange?: (id: string) => void
  onMic?: () => void
  advisorName?: string
  advisorInitial?: string
}

export function BottomNav({
  active = 'home',
  onChange,
  onMic,
  advisorName = 'Clara',
  advisorInitial = 'C',
}: Props) {
  return (
    <div className="px-5 pb-6 pt-2">
      <div
        className="relative flex items-center rounded-[28px] border border-white/70 px-6 py-2.5"
        style={{
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(22px) saturate(180%)',
          WebkitBackdropFilter: 'blur(22px) saturate(180%)',
          boxShadow: '0 10px 34px -10px rgba(8,14,32,0.26), inset 0 1px 0 rgba(255,255,255,0.85)',
        }}
      >
        <div className="flex flex-1 items-center justify-start gap-9">
          <Tab label="Home" active={active === 'home'} onClick={() => onChange?.('home')}>
            <House size={22} strokeWidth={active === 'home' ? 2.4 : 1.9} />
          </Tab>
          <Tab label="Wealth" active={active === 'wealth'} onClick={() => onChange?.('wealth')}>
            <ChartPie size={22} strokeWidth={active === 'wealth' ? 2.4 : 1.9} />
          </Tab>
        </div>

        <div className="flex flex-1 items-center justify-end">
          <button
            onClick={() => onChange?.('advisor')}
            className="flex flex-col items-center gap-1.5 transition-transform active:scale-95"
            style={{ color: active === 'advisor' ? 'var(--color-navy-900)' : 'var(--color-ink-faint)' }}
          >
            <span
              className="flex h-[27px] w-[27px] items-center justify-center rounded-full text-[11px] font-semibold text-white"
              style={{
                background: 'linear-gradient(155deg, #6fa1f3, #16409a)',
                boxShadow:
                  active === 'advisor'
                    ? '0 0 0 2px var(--color-paper), 0 0 0 4px var(--color-navy-700)'
                    : 'inset 0 1px 0 rgba(255,255,255,0.4)',
              }}
            >
              {advisorInitial}
            </span>
            <span className="text-[10px] font-medium tracking-tight">{advisorName}</span>
          </button>
        </div>

        {/* center mic — the hero action */}
        <button
          onClick={onMic}
          aria-label="Record a memo"
          className="absolute left-1/2 -top-4 flex h-[58px] w-[58px] -translate-x-1/2 items-center justify-center rounded-full text-white transition-transform active:scale-95"
          style={{
            background: 'linear-gradient(158deg, #2a64e0 0%, #11215a 100%)',
            boxShadow:
              '0 12px 26px -6px rgba(17,33,90,0.7), 0 0 0 6px var(--color-paper), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}
        >
          <Mic size={24} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  )
}

function Tab({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 transition-transform active:scale-95"
      style={{ color: active ? 'var(--color-navy-900)' : 'var(--color-ink-faint)' }}
    >
      {children}
      <span className="text-[10px] font-medium tracking-tight">{label}</span>
    </button>
  )
}
