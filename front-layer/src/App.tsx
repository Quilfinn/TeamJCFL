import { useEffect, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { PhoneFrame } from './components/PhoneFrame'
import { BottomNav } from './components/BottomNav'
import { Greeting } from './components/Greeting'
import { BalanceCard } from './components/BalanceCard'
import { Section } from './components/Section'
import { Treemap } from './components/Treemap'
import { Timeframes, TIMEFRAMES } from './components/Timeframes'
import { ActivityRow } from './components/ActivityRow'
import { RecordingDrawer } from './components/RecordingDrawer'
import { AIExplainSheet } from './components/AIExplainSheet'
import { ResearchSheet } from './components/ResearchSheet'
import { ForwardSheet } from './components/ForwardSheet'
import { AdvisorPage } from './components/AdvisorPage'
import { Toast } from './components/Toast'
import { portfolio, type AssetNode } from './data/portfolio'
import {
  feed as initialFeed,
  sampleTranscripts,
  type FeedItem,
  type YapItem,
  type RelatedAsset,
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
  const [recording, setRecording] = useState(false)
  const [explain, setExplain] = useState<ExplainPayload | null>(null)
  const [research, setResearch] = useState<RelatedAsset[] | null>(null)
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

  // open the AI explainer for an item
  const doExplain = (item: FeedItem) => {
    setExplain(buildExplain(item))
  }
  const doSendRM = (item: FeedItem) => {
    setExplain(null)
    setAskContext(item.kind === 'reel' ? item.caption : item.body)
  }
  const doDelete = (item: FeedItem) => {
    setFeed((f) => f.filter((x) => x.id !== item.id))
    showToast('Removed from your activity')
  }

  const stopRecording = () => {
    setRecording(false)
    const id = `y-${seq++}`
    const body = sampleTranscripts[seq % sampleTranscripts.length]
    const memo: YapItem = { kind: 'yap', id, body, meta: 'Voice memo · just now' }
    setFeed((f) => [memo, ...f])
    // new event → open the AI explainer directly
    doExplain(memo)
  }

  // tap opens the recorder; press-and-hold records while held, release to capture
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const heldRef = useRef(false)
  const micDown = () => {
    heldRef.current = false
    const onUp = () => {
      window.removeEventListener('pointerup', onUp)
      if (holdTimer.current) {
        clearTimeout(holdTimer.current)
        holdTimer.current = null
        setRecording(true) // quick tap → manual recorder
      } else if (heldRef.current) {
        stopRecording() // was holding → capture on release
      }
    }
    window.addEventListener('pointerup', onUp)
    holdTimer.current = setTimeout(() => {
      holdTimer.current = null
      heldRef.current = true
      setRecording(true)
    }, 220)
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
          onMicDown={micDown}
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
            onConfirm={() => {
              setExplain(null)
              showToast('Price alert set — Clara is in the loop')
            }}
            onResearch={() => setResearch(explain?.related ?? [])}
          />
          <ResearchSheet assets={research} onClose={() => setResearch(null)} />
          <ForwardSheet context={askContext} onClose={() => setAskContext(null)} onSent={askSent} />
          <Toast message={toast} />
        </>
      }
    >
      <div className="pb-32">
        <Greeting name={CLIENT.name} initial={CLIENT.initial} />

        <div
          className="px-5"
          style={{ animation: 'introUp 0.8s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.1s' }}
        >
          <BalanceCard node={current} atRoot={atRoot} pct={pct} delta={delta} periodLabel={periodLabel} />
        </div>

        {/* timeframe — above the portfolio, controls the card + bento */}
        <div
          className="mt-4 px-5"
          style={{ animation: 'introUp 0.8s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.15s' }}
        >
          <Timeframes active={tf} onChange={setTf} />
        </div>

        {/* Portfolio */}
        <div
          className="mt-6 px-5"
          style={{ animation: 'introUp 0.8s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.2s' }}
        >
          <Section
            label="Portfolio"
            title={
              <span className="flex min-w-0 items-center gap-1.5">
                {path.map((node, i) => {
                  const last = i === path.length - 1
                  return (
                    <span key={node.id} className="flex flex-shrink-0 items-center gap-1.5">
                      {i > 0 && <ChevronRight size={16} className="text-ink-faint" />}
                      <button
                        onClick={() => !last && jumpTo(i)}
                        disabled={last}
                        className={last ? 'text-ink' : 'text-ink-faint active:opacity-60'}
                      >
                        {i === 0 ? 'Portfolio' : node.name}
                      </button>
                    </span>
                  )
                })}
              </span>
            }
          >
            <Treemap node={current} depth={path.length - 1} onDrill={drill} />
          </Section>
        </div>

        {/* Activity */}
        <div
          className="mt-7 px-5"
          style={{ animation: 'introUp 0.8s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.26s' }}
        >
          <Section title="Activity" label="Activity">
            {feed.length ? (
              <div className="flex flex-col gap-2.5">
                {feed.map((item) => (
                  <ActivityRow
                    key={item.id}
                    item={item}
                    onOpen={(it) => doExplain(it)}
                    onExplain={(it) => doExplain(it)}
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
          </Section>
        </div>
      </div>
    </PhoneFrame>
  )
}
