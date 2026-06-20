export function TikTokIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.6 5.82a4.28 4.28 0 0 1-1.06-2.82h-3.2v12.86a2.34 2.34 0 1 1-2.34-2.34c.2 0 .4.03.59.08V8.3a5.66 5.66 0 0 0-.6-.03A5.55 5.55 0 1 0 15.55 13.8V8.5a7.45 7.45 0 0 0 4.45 1.45V6.78a4.28 4.28 0 0 1-3.4-0.96z" />
    </svg>
  )
}

export function InstagramIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}
