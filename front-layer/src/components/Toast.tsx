import { Check } from 'lucide-react'

export function Toast({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-28 z-[60] flex justify-center px-6">
      <div
        className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[13.5px] font-medium text-white"
        style={{
          background: 'rgba(10,18,48,0.92)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 10px 30px -8px rgba(8,14,32,0.5)',
          animation: 'popUp 0.3s ease both',
        }}
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-mint)]">
          <Check size={11} strokeWidth={3} className="text-navy-900" />
        </span>
        {message}
      </div>
    </div>
  )
}
