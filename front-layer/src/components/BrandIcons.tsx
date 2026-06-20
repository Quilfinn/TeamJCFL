export function TikTokIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.7 2h-3.04v12.36a2.2 2.2 0 1 1-1.86-2.17V9.1a5.27 5.27 0 1 0 4.62 5.22V8.2a6.7 6.7 0 0 0 3.9 1.25V6.4a3.86 3.86 0 0 1-2.62-1.05A3.86 3.86 0 0 1 16.7 2.5z" />
    </svg>
  )
}

export function InstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="6" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.6" cy="6.4" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  )
}
