import { partOfDay } from '../lib/greeting'

/** Full-screen white intro: the greeting, then it lifts away to reveal the app. */
export function IntroSplash({ name }: { name: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[80] flex items-center justify-center bg-paper"
      style={{ animation: 'splashOut 2.5s cubic-bezier(0.5,0,0.2,1) both' }}
    >
      <div
        className="text-[24px] tracking-tight"
        style={{ animation: 'splashText 1.1s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        <span className="font-medium text-ink-faint">{partOfDay()},&nbsp;</span>
        <span className="font-semibold text-ink">{name}.</span>
      </div>
    </div>
  )
}
