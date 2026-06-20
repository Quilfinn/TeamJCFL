/**
 * Odometer-style number. Each digit is a vertical 0–9 strip translated to the
 * target digit; the transform transitions smoothly and ALWAYS settles on the
 * right value even if the tab throttles rAF (CSS transitions, not JS).
 */
interface Props {
  value: number
  format: (n: number) => string
  className?: string
  /** seconds; right-most digits lead for an odometer cascade */
  duration?: number
}

export function RollingNumber({ value, format, className, duration = 0.85 }: Props) {
  const str = format(value)
  const chars = str.split('')
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'flex-start' }}
      aria-label={str}
    >
      {chars.map((ch, i) => {
        const isDigit = /\d/.test(ch)
        const delay = ((chars.length - i) * 0.03).toFixed(3)
        return (
          <span
            key={i}
            aria-hidden
            style={{
              display: 'inline-block',
              height: '1em',
              lineHeight: '1em',
              overflow: 'hidden',
              verticalAlign: 'top',
            }}
          >
            {isDigit ? (
              <span
                style={{
                  display: 'block',
                  transform: `translateY(-${parseInt(ch, 10) * 10}%)`,
                  transition: `transform ${duration}s cubic-bezier(0.16,1,0.3,1)`,
                  transitionDelay: `${delay}s`,
                  willChange: 'transform',
                }}
              >
                {Array.from({ length: 10 }).map((_, n) => (
                  <span key={n} style={{ display: 'block', height: '1em', lineHeight: '1em' }}>
                    {n}
                  </span>
                ))}
              </span>
            ) : (
              <span
                style={{ display: 'block', height: '1em', lineHeight: '1em', whiteSpace: 'pre' }}
              >
                {ch}
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}
