import { useEffect, useRef, useState } from 'react'
import { PhoneFrame } from './components/PhoneFrame'
import { BottomNav } from './components/BottomNav'
import { Greeting } from './components/Greeting'
import { BalanceCard } from './components/BalanceCard'
import { Breadcrumb } from './components/Breadcrumb'
import { Treemap } from './components/Treemap'
import { Timeframes, TIMEFRAMES } from './components/Timeframes'
import { ActivityRow } from './components/ActivityRow'
import { QuickActionsDrawer } from './components/QuickActionsDrawer'
import { RecordingDrawer } from './components/RecordingDrawer'
import { AIExplainSheet } from './components/AIExplainSheet'
import { ForwardSheet } from './components/ForwardSheet'
import { AdvisorPage } from './components/AdvisorPage'
import { Toast } from './components/Toast'
import { portfolio, type AssetNode } from './data/portfolio'
import {
  feed as initialFeed,
  sampleTranscripts,
  type FeedItem,
  type YapItem,
} from './data/feed'
import { buildExplain, type ExplainPayload } from './lib/explain'

const CLIENT = { name: 'Felix', initial: 'F' }

let seq = 0

export default function App() {
  const [path, setPath] = useState<AssetNode[]>([portfolio])
  const current = path[path.length - 1]
  const atRoot = path.length === 1

  const [tf, setTf] = useState('1D')
  const factor = TIMEFRAMES.find((t) => t.key === tf)?.factor ?? 1
  const periodLabel = tf === '1D' ? 'today' : tf === 'MAX' ? 'all time' : `past ${tf.toLowerCase()}`
  const pct = current.change * factor
  const delta = (current.value * pct) / 100

  const [feed, setFeed] = useState<FeedItem[]>(initialFeed)
  const [drawer, setDrawer] = useState<{ item: FeedItem; fresh: boolean } | null>(null)
  const [recording, setRecording] = useState(false)
  const [explain, setExplain] = useState<ExplainPayload | null>(null)
  const [askContext, setAskContext] = useState<string | null>(null)
  const [advisorOpen, setAdvisorOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const drill = (child: AssetNode) => {
    if (child.children?.length) setPath((p) => [...p, child])
  }
  const jumpTo = (index: number) => setPath((p) => p.slice(0, index + 1))

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

  const openItem = (item: FeedItem) => setDrawer({ item, fresh: false })

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

  const askSent = () => {
    setAskContext(null)
    showToast('Sent to Clara')
  }

  return (
    <PhoneFrame
      nav={
        <BottomNav
          active={advisorOpen ? 'advisor' : 'home'}
          onMic={startRecording}
          onChange={(id) => id === 'advisor' && setAdvisorOpen(true)}
        />
      }
      overlay={
        <>
          <AdvisorPage
            open={advisorOpen}
            onClose={() => setAdvisorOpen(false)}
            onMessage={() => {
              setAdvisorOpen(false)
              showToast('Chat with Clara is opening…')
            }}
            onBook={() => {
              setAdvisorOpen(false)
              showToast('Call requested — Clara will confirm')
            }}
          />
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

        <div className="px-5">
          <BalanceCard node={current} atRoot={atRoot} pct={pct} delta={delta} periodLabel={periodLabel} />
        </div>

        <div className="mt-5 px-5">
          <Breadcrumb path={path} onJump={jumpTo} />
        </div>
        <div className="mt-2 px-5">
          <Treemap node={current} depth={path.length - 1} factor={factor} onDrill={drill} />
        </div>

        {/* timeframe — controls the card delta and the bento changes */}
        <div className="mt-4 px-5">
          <Timeframes active={tf} onChange={setTf} />
        </div>

        {/* Activity log */}
        <div className="mt-8 px-4">
          <h2 className="mb-3 px-1 text-[17px] font-semibold tracking-tight text-ink">Activity</h2>

          {feed.length ? (
            <div className="card overflow-hidden p-0">
              {feed.map((item, i) => (
                <ActivityRow
                  key={item.id}
                  item={item}
                  first={i === 0}
                  onOpen={openItem}
                  onExplain={doExplain}
                  onSendRM={doSendRM}
                  onDelete={doDelete}
                />
              ))}
            </div>
          ) : (
            <div className="card flex flex-col items-center gap-1 px-4 py-12 text-center">
              <div className="text-[14px] font-medium text-ink">Nothing here yet</div>
              <div className="text-[12.5px] text-ink-faint">
                Tap the mic to record a memo, or share a reel into Signal
              </div>
            </div>
          )}
        </div>
      </div>
    </PhoneFrame>
  )
}
