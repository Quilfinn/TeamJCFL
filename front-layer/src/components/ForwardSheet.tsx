import { useState, useEffect } from 'react'
import { Send } from 'lucide-react'
import { Sheet } from './Sheet'
import { ClaraAvatar } from './ClaraAvatar'

interface Props {
  context: string | null
  onClose: () => void
  onSent: () => void
}

export function ForwardSheet({ context, onClose, onSent }: Props) {
  const [note, setNote] = useState('')
  useEffect(() => {
    if (context) setNote(`Quick one on this — ${context}`)
  }, [context])

  return (
    <Sheet open={!!context} onClose={onClose} variant="light">
      <div className="px-5 pt-2 pb-6">
        <div className="flex items-center gap-3">
          <ClaraAvatar size={44} />
          <div className="leading-tight">
            <div className="text-[15px] font-semibold text-ink">Send to Clara</div>
            <div className="text-[12px] font-medium text-ink-faint">
              Clara Bensimon · your relationship manager
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-line bg-paper p-3.5">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full resize-none bg-transparent text-[14.5px] leading-snug text-ink placeholder:text-ink-faint focus:outline-none"
            placeholder="Add a note for Clara…"
          />
        </div>

        <button
          onClick={onSent}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-navy-900 py-3.5 text-[15px] font-semibold text-white active:scale-[0.98]"
        >
          <Send size={17} /> Send to Clara
        </button>
        <button
          onClick={onClose}
          className="mt-2 w-full py-2 text-[14px] font-medium text-ink-faint"
        >
          Cancel
        </button>
      </div>
    </Sheet>
  )
}
