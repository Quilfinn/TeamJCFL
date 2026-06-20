/** Flat version of the agent logo — a blob with two eyes. Inherits currentColor. */
export function AgentMark({ size = 16, eyeColor = '#0a1230' }: { size?: number; eyeColor?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10.5" fill="currentColor" />
      <rect x="8" y="8" width="2.4" height="5.4" rx="1.2" fill={eyeColor} />
      <rect x="13.6" y="8" width="2.4" height="5.4" rx="1.2" fill={eyeColor} />
    </svg>
  )
}
