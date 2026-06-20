function partOfDay(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function Greeting({ name, initial }: { name: string; initial: string }) {
  return (
    <div className="flex items-center justify-between px-6 pt-1 pb-3">
      <div className="leading-tight">
        <div className="text-[13px] font-medium text-ink-faint">{partOfDay()},</div>
        <div className="text-[19px] font-semibold tracking-tight text-ink">{name}</div>
      </div>
      <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-paper-dim text-[14px] font-semibold text-ink-soft">
        {initial}
        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-navy-500" />
      </button>
    </div>
  )
}
