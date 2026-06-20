function partOfDay(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

const reveal = (delay: number) => ({
  display: 'inline-block',
  animation: 'introUp 0.8s cubic-bezier(0.16,1,0.3,1) both',
  animationDelay: `${delay}s`,
})

export function Greeting({ name, initial }: { name: string; initial: string }) {
  return (
    <div className="flex items-center justify-between px-6 pt-1 pb-3">
      <div className="text-[18px] tracking-tight">
        <span className="font-medium text-ink-faint" style={reveal(0.04)}>
          {partOfDay()},&nbsp;
        </span>
        <span className="font-semibold text-ink" style={reveal(0.13)}>
          {name}.
        </span>
      </div>
      <button
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-paper-dim text-[14px] font-semibold text-ink-soft"
        style={{ animation: 'introPop 0.7s cubic-bezier(0.34,1.56,0.64,1) both', animationDelay: '0.2s' }}
      >
        {initial}
        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-navy-500" />
      </button>
    </div>
  )
}
