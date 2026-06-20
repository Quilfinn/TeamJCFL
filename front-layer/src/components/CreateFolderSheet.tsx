import { useEffect, useRef, useState } from 'react'
import { Sheet } from './Sheet'

export function CreateFolderSheet({
  open,
  onCreate,
  onClose,
}: {
  open: boolean
  onCreate: (name: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setName('')
      const t = setTimeout(() => inputRef.current?.focus(), 120)
      return () => clearTimeout(t)
    }
  }, [open])

  const submit = () => {
    const trimmed = name.trim()
    if (trimmed) onCreate(trimmed)
  }

  return (
    <Sheet open={open} onClose={onClose} variant="light">
      <div className="px-5 pb-9 pt-2">
        <h3 className="text-[19px] font-semibold tracking-tight text-ink">New folder</h3>
        <p className="mt-1 text-[12.5px] font-medium text-ink-faint">Group reels and memos by a theme</p>

        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="e.g. Long-term ideas"
          className="mt-5 w-full rounded-[16px] border border-line bg-paper px-4 py-3.5 text-[15px] font-medium text-ink outline-none placeholder:text-ink-faint focus:border-navy-500"
        />

        <button
          onClick={submit}
          disabled={!name.trim()}
          className="mt-3 w-full rounded-[16px] bg-navy-900 py-3.5 text-[14.5px] font-semibold text-white transition-opacity active:scale-[0.99] disabled:opacity-40"
        >
          Create folder
        </button>
      </div>
    </Sheet>
  )
}
