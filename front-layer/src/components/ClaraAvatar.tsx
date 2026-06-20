import { useState } from 'react'

export const CLARA_PHOTO = 'https://randomuser.me/api/portraits/women/90.jpg'

export function ClaraAvatar({
  size = 28,
  className = '',
  ring = false,
}: {
  size?: number
  className?: string
  ring?: boolean
}) {
  const [err, setErr] = useState(false)
  return (
    <span
      className={'relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full ' + className}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(155deg,#6fa1f3,#16409a)',
        boxShadow: ring
          ? '0 0 0 2px var(--color-surface), 0 0 0 3.5px var(--color-navy-700)'
          : 'inset 0 0 0 0.5px rgba(255,255,255,0.4)',
      }}
    >
      {err ? (
        <span className="font-semibold text-white" style={{ fontSize: size * 0.42 }}>
          C
        </span>
      ) : (
        <img
          src={CLARA_PHOTO}
          alt="Clara"
          onError={() => setErr(true)}
          className="h-full w-full object-cover"
        />
      )}
    </span>
  )
}
