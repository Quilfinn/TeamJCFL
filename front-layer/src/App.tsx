import { useEffect, useRef, useState } from 'react'
import { Link2 } from 'lucide-react'
import { PhoneFrame } from './components/PhoneFrame'
import { BottomNav } from './components/BottomNav'
import { Greeting } from './components/Greeting'
import { PortfolioHeader } from './components/PortfolioHeader'
import { Breadcrumb } from './components/Breadcrumb'
import { Treemap } from './components/Treemap'
import { ActivityRow } from './components/ActivityRow'
import { QuickActionsDrawer } from './components/QuickActionsDrawer'
import { RecordingDrawer } from './components/RecordingDrawer'
import { AIExplainSheet } from './components/AIExplainSheet'
import { ForwardSheet } from './components/ForwardSheet'
import { Toast } from './components/Toast'
import { portfolio, type AssetNode } from './data/portfolio'
import {
  feed as initialFeed,
  sampleShares,
  sampleTranscripts,
  type FeedItem,
  type ReelItem,
  type YapItem,
} from './data/feed'
import { buildExplain, type ExplainPayload } from './lib/explain'

const CLIENT = { name: 'Felix', initial: 'F' }
const ADVISOR = { name: 'Clara', initial: 'C' }

let seq = 0

export default function App() {
  const [path, setPath] = useState<AssetNode[]>([portfolio])
  const current = path[path.length - 1]

  const [feed, setFeed] = useState<FeedItem[]>(initialFeed)
  const [drawer, setDrawer] = useState<{ item: FeedItem; fresh: boolean } | null>(null)
  const [recording, setRecording] = useState(false)
  const [explain, setExplain] = useState<ExplainPayload | null>(null)
  const [askContext, setAskContext] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const drill = (child: AssetNode) => {
    if (child.children?.length) setPath((p) => [...p, child])
  }
  const jumpTo = (index: number) => setPath((p) => p.slice(0, index + 1))

  const dayChange = (current.children ?? []).reduce(
    (acc, c) => acc + (c.value * c.change) / 100,
    0,
  )

  const showToast = (msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2400)
  }
  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  // open the quick-actions drawer for an existing item
  const openItem = (item: FeedItem) => setDrawer({ item, fresh: false })

  // drawer actions
  const doExplain = (item: FeedItem) => {
    setDrawer(null)
    setExplain(buildExplain(item))
  }
  const doSendRM = (item: FeedItem) => {
    setDrawer(null)
    setAskContext(item.kind === 'reel' ? item.caption : item.body)
  }
  const doDelete = (item: FeedItem) => {
    setFeed((f) => f.filter((x) => x.id !== item.id))
    setDrawer(null)
    showToast('Removed from your activity')
  }

  // recording flow
  const startRecording = () => {
    setDrawer(null)
    setRecording(true)
  }
  const stopRecording = () => {
    setRecording(false)
    const id = `y-${seq++}`
    const body = sampleTranscripts[seq % sampleTranscripts.length]
    const memo: YapItem = { kind: 'yap', id, body, meta: 'Voice memo · just now' }
    setFeed((f) => [memo, ...f])
    setDrawer({ item: memo, fresh: true })
  }

  // simulate a reel being shared into the app
  const simulateShare = () => {
    const tpl = sampleShares[seq % sampleShares.length]
    seq++
    const reel: ReelItem = { ...tpl, id: `r-${seq}`, meta: `Forwarded from ${tpl.source === 'tiktok' ? 'TikTok' : 'Instagram'} · just now` }
    setFeed((f) => [reel, ...f])
    setDrawer({ item: reel, fresh: true })
  }

  const askSent = () => {
    setAskContext(null)
    showToast('Sent to Clara')
  }

  return (
    <PhoneFrame
      nav={
        <BottomNav
          active="home"
          advisorName={ADVISOR.name}
          advisorInitial={ADVISOR.initial}
          onMic={startRecording}
        />
      }
      overlay={
        <>
          <QuickActionsDrawer
            item={drawer?.item ?? null}
            fresh={drawer?.fresh}
            onClose={() => setDrawer(null)}
            onExplain={doExplain}
            onSendRM={doSendRM}
            onRecordAgain={startRecording}
            onDelete={doDelete}
          />
          <RecordingDrawer
            open={recording}
            onStop={stopRecording}
            onCancel={() => setRecording(false)}
          />
          <AIExplainSheet
            payload={explain}
            onClose={() => setExplain(null)}
            onAsk={() => {
              const ctx = explain?.contextLabel ?? null
              setExplain(null)
              setAskContext(ctx)
            }}
          />
          <ForwardSheet context={askContext} onClose={() => setAskContext(null)} onSent={askSent} />
          <Toast message={toast} />
        </>
      }
    >
      <div className="pb-32">
        <Greeting name={CLIENT.name} initial={CLIENT.initial} />
        <PortfolioHeader node={current} dayChange={dayChange} />

        <div className="mt-4 px-5">
          <Breadcrumb path={path} onJump={jumpTo} />
        </div>
        <div className="mt-2 px-5">
          <Treemap node={current} depth={path.length - 1} onDrill={drill} />
        </div>

        {/* Activity log */}
        <div className="mt-7 px-4">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Activity</h2>
            <button
              onClick={simulateShare}
              className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] font-medium text-ink-soft active:scale-95"
            >
              <Link2 size={14} /> Share a reel
            </button>
          </div>

          {feed.length ? (
            <div className="card divide-y divide-[var(--color-line)] overflow-hidden p-0">
              {feed.map((item) => (
                <ActivityRow key={item.id} item={item} onOpen={openItem} />
              ))}
            </div>
          ) : (
            <div className="card flex flex-col items-center gap-1 px-4 py-10 text-center">
              <div className="text-[14px] font-medium text-ink">Nothing here yet</div>
              <div className="text-[12.5px] text-ink-faint">
                Share a reel or tap the mic to record a memo
              </div>
            </div>
          )}
        </div>
      </div>
    </PhoneFrame>
  )
}
