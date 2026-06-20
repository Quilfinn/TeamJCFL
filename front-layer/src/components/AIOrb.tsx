/**
 * Signal AI's identity — a glossy gradient sphere with two eyes and a soft
 * cyan glow beneath. Pure CSS so it animates smoothly anywhere.
 */
export function AIOrb({ size = 56, float = true }: { size?: number; float?: boolean }) {
  const eyeW = size * 0.09
  const eyeH = size * 0.2
  return (
    <span
      className="relative inline-flex flex-shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* glow */}
      <span
        className="absolute rounded-full blur-lg"
        style={{
          width: size * 1.15,
          height: size * 1.15,
          background:
            'radial-gradient(circle at 50% 65%, rgba(125,210,255,0.9), rgba(95,110,255,0.4) 45%, transparent 70%)',
          animation: 'orbGlow 3.4s ease-in-out infinite',
        }}
      />
      {/* sphere */}
      <span
        className="relative rounded-full"
        style={{
          width: size,
          height: size,
          background: [
            'radial-gradient(circle at 34% 26%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 24%)',
            'radial-gradient(circle at 50% 118%, #b9f3ff 0%, rgba(185,243,255,0) 46%)',
            'linear-gradient(162deg, #6a5cf6 2%, #5f7df8 42%, #76adfb 72%, #a6d8ff 100%)',
          ].join(', '),
          boxShadow:
            'inset -5px -7px 14px rgba(35,30,110,0.4), inset 5px 7px 16px rgba(255,255,255,0.45), 0 6px 18px -4px rgba(95,110,255,0.6)',
          animation: float ? 'orbFloat 4.5s ease-in-out infinite' : undefined,
        }}
      >
        {/* eyes */}
        <span
          className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center"
          style={{ gap: size * 0.11 }}
        >
          <span
            className="rounded-full bg-white"
            style={{ width: eyeW, height: eyeH, boxShadow: '0 0 4px rgba(255,255,255,0.8)' }}
          />
          <span
            className="rounded-full bg-white"
            style={{ width: eyeW, height: eyeH, boxShadow: '0 0 4px rgba(255,255,255,0.8)' }}
          />
        </span>
      </span>
    </span>
  )
}
