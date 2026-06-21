import { useEffect, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { PhoneFrame } from './components/PhoneFrame'
import { BottomNav } from './components/BottomNav'
import { Greeting } from './components/Greeting'
import { BalanceCard } from './components/BalanceCard'
import { Section } from './components/Section'
import { Treemap } from './components/Treemap'
import { Timeframes, TIMEFRAMES } from './components/Timeframes'
import { ActivityDeck } from './components/ActivityDeck'
import { Folders } from './components/Folders'
import { FolderSheet } from './components/FolderSheet'
import { MoveSheet } from './components/MoveSheet'
import { CreateFolderSheet } from './components/CreateFolderSheet'
import { RecordingDrawer } from './components/RecordingDrawer'
import { AIExplainSheet } from './components/AIExplainSheet'
import { ResearchSheet } from './components/ResearchSheet'
import { ForwardSheet } from './components/ForwardSheet'
import { AdvisorPage } from './components/AdvisorPage'
import { IntroSplash } from './components/IntroSplash'
import { ShareIntake } from './components/ShareIntake'
import { RMMessageCard } from './components/RMMessageCard'
import { Toast } from './components/Toast'
import { TikTokIcon } from './components/BrandIcons'
import { portfolio, type AssetNode } from './data/portfolio'
import {
  feed as initialFeed,
  initialFolders,
  FOLDER_SKINS,
  sampleShares,
  sampleTranscripts,
  watchlist,
  type FeedItem,
  type YapItem,
  type ReelItem,
  type RelatedAsset,
  type SignalRec,
  type SkinKey,
  type Folder,
} from './data/feed'
import { buildExplain, type ExplainPayload } from './lib/explain'

const CLIENT = { name: 'Leo', initial: 'L' }

// Backend connection — proxied to the Flask API (see vite.config.ts).
// Leo is the demo client; his signals surface on Anna's RM Radar dashboard.
const API = '/api/v1'
const CLIENT_UUID = 'nqhw1mq98wkdiznouvgcjx5v420gninp'

/** Skins rotated through for freshly-recorded memos / shared reels. */
const MEMO_SKINS: SkinKey[] = ['ocean', 'petrol', 'indigo', 'steel', 'navy']

// Map the AI brief's urgency to a client-friendly recommendation pill.
const signalFromUrgency = (urgency: string | undefined, note?: string): SignalRec => {
  if (urgency === 'high')   return { level: 'red',    label: 'Act soon', note }
  if (urgency === 'medium') return { level: 'orange', label: 'Worth a look', note }
  return { level: 'green', label: 'Opportunity', note }
}

interface RMMessage { id: string; headline: string; body: string }

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
  const [folders, setFolders] = useState<Folder[]>(initialFolders)
  const [openFolder, setOpenFolder] = useState<string | null>(null)
  const [moveItem, setMoveItem] = useState<FeedItem | null>(null)
  const [creating, setCreating] = useState<{ item: FeedItem | null } | null>(null)
  const [freshId, setFreshId] = useState<string | null>(null)
  const [leavingId, setLeavingId] = useState<string | null>(null)

  // the stack holds anything not yet filed; folders are managed by hand
  const stackItems = feed.filter((i) => i.status === 'new')
  const itemsIn = (name: string) => feed.filter((i) => i.status === 'filed' && i.topic === name)
  const foldersData = folders.map((f) => ({ ...f, items: itemsIn(f.name) }))
  const openFolderData = (() => {
    const f = folders.find((x) => x.name === openFolder)
    return f ? { ...f, items: itemsIn(f.name) } : null
  })()

  const [recording, setRecording] = useState(false)
  const [recPhase, setRecPhase] = useState<'listening' | 'processing'>('listening')
  const [explain, setExplain] = useState<ExplainPayload | null>(null)
  const [stockSheet, setStockSheet] = useState<{
    assets: RelatedAsset[]
    title: string
    subtitle: string
  } | null>(null)
  const [askContext, setAskContext] = useState<string | null>(null)
  const [advisorOpen, setAdvisorOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [intro, setIntro] = useState(true)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Messages Anna delivers after approving an opportunity on the RM dashboard.
  const [rmMessages, setRmMessages] = useState<RMMessage[]>([])
  const [freshMsgId, setFreshMsgId] = useState<string | null>(null)
  const seenSent = useRef<Set<string>>(new Set())
  const primed = useRef(false)
  const shareCount = useRef(0)
  // Reel mid-arrival from TikTok/Instagram (drives the share-intake overlay).
  const [intake, setIntake] = useState<ReelItem | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 2550)
    return () => clearTimeout(t)
  }, [])

  // Demo one-take: open with ?from=tiktok (or ?share) and the reel auto-arrives
  // right after the intro — films the whole "shared into the app" opening hands-free.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (!p.has('from') && !p.has('share')) return
    const t = setTimeout(() => shareReel(), 3000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sign Leo in once so his signals carry the auth cookie to the backend.
  useEffect(() => {
    fetch(`${API}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'leo.ackermann', password: 'demo1234' }),
      credentials: 'include',
    }).catch(() => {})
  }, [])

  // Poll for opportunities Anna has approved → land them as messages from Anna.
  useEffect(() => {
    let active = true
    const poll = async () => {
      try {
        const res = await fetch(`${API}/clients/${CLIENT_UUID}/opportunities`, {
          credentials: 'include',
        })
        if (!res.ok) return
        const data = await res.json()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sent = (data.opportunities ?? []).filter((o: any) => o.STATUS === 'sent')
        // First pass: remember what was already sent so only fresh approvals surface.
        if (!primed.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sent.forEach((o: any) => seenSent.current.add(String(o.ID)))
          primed.current = true
          return
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fresh = sent.filter((o: any) => !seenSent.current.has(String(o.ID)))
        if (fresh.length && active) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fresh.forEach((o: any) => seenSent.current.add(String(o.ID)))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const msgs: RMMessage[] = fresh.map((o: any) => ({
            id: String(o.ID),
            headline: o.CLIENT_CARD_HEADLINE ?? 'A note from Anna',
            body: o.CLIENT_CARD_BODY ?? '',
          }))
          setRmMessages((m) => [...msgs, ...m])
          setFreshMsgId(msgs[0].id)
          setTimeout(() => setFreshMsgId(null), 900)
          showToast('Anna sent you a note')
        }
      } catch { /* ignore poll errors */ }
    }
    poll()
    const iv = setInterval(poll, 2500)
    return () => { active = false; clearInterval(iv) }
  }, [])

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
  // animate a stack card off to the right, then run the state change
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const exitThen = (id: string, fn: () => void) => {
    setLeavingId(id)
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    leaveTimer.current = setTimeout(() => {
      fn()
      setLeavingId(null)
    }, 330)
  }

  const doDelete = (item: FeedItem) => {
    exitThen(item.id, () => {
      setFeed((f) => f.filter((x) => x.id !== item.id))
      showToast('Removed from your activity')
    })
  }
  // filing is now by hand — open the folder picker
  const doFile = (item: FeedItem) => setMoveItem(item)

  const fileInto = (item: FeedItem, name: string) => {
    setMoveItem(null)
    exitThen(item.id, () => {
      setFeed((f) => f.map((x) => (x.id === item.id ? ({ ...x, status: 'filed', topic: name } as FeedItem) : x)))
      showToast(`Moved to ${name}`)
    })
  }
  const unfile = (item: FeedItem) => {
    setFeed((f) => f.map((x) => (x.id === item.id ? ({ ...x, status: 'new', topic: '' } as FeedItem) : x)))
    showToast('Moved back to your stack')
  }
  const createFolder = (name: string) => {
    const forItem = creating?.item ?? null
    setCreating(null)
    setFolders((fs) =>
      fs.some((f) => f.name.toLowerCase() === name.toLowerCase())
        ? fs
        : [...fs, { name, skin: FOLDER_SKINS[fs.length % FOLDER_SKINS.length] }],
    )
    if (forItem) fileInto(forItem, name)
    else showToast(`Folder “${name}” created`)
  }

  // mic released → transcribe (brief), drop the card onto the stack, then let Signal weigh in
  const stopRecording = () => {
    setRecPhase('processing')
    setTimeout(() => {
      const id = `y-${seq++}`
      const body = sampleTranscripts[seq % sampleTranscripts.length]
      const memo: YapItem = {
        kind: 'yap',
        id,
        body,
        meta: 'Voice memo · just now',
        status: 'new',
        topic: '',
        skin: MEMO_SKINS[seq % MEMO_SKINS.length],
      }
      setFeed((f) => [memo, ...f])
      setFreshId(id)
      setRecording(false)
      setRecPhase('listening')
      // let the card settle on the stack before the agent opens
      setTimeout(() => {
        doExplain(memo)
        setFreshId(null)
      }, 760)
    }, 1050)
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

  // Sending to Clara fires the real AI pipeline: it lands on Anna's RM Radar
  // dashboard as a pending opportunity, and her brief comes straight back here.
  const askSent = async () => {
    const ctx = askContext
    setAskContext(null)
    if (!ctx) return

    showToast('Signal AI is briefing Clara…')
    try {
      const res = await fetch(`${API}/signals/reel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: ctx, client_uuid: CLIENT_UUID }),
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        const card = data.client_card ?? {}
        setExplain({
          source: 'yap',
          contextLabel: ctx,
          brief: card.body ?? 'Clara has reviewed your note and will follow up shortly.',
          assessment: 'neutral',
          suggestionTitle: card.headline ?? 'Clara will follow up',
        })
        showToast('Clara has reviewed your note ✓')
      } else {
        showToast('Sent to Clara')
      }
    } catch {
      showToast('Sent to Clara')
    }
  }

  // Leo shares a reel from TikTok/Instagram: it lands on his stack with a
  // recommendation, and fires straight to Anna's RM Radar dashboard.
  // Step 1 — a reel arrives from TikTok: play the intake hand-off overlay.
  const shareReel = () => {
    const sample = sampleShares[shareCount.current % sampleShares.length]
    shareCount.current += 1
    const id = `r-${seq++}`
    const reel: ReelItem = {
      ...sample,
      id,
      meta: `Shared from ${sample.source === 'tiktok' ? 'TikTok' : 'Instagram'} · just now`,
      status: 'new',
      topic: '',
      skin: MEMO_SKINS[seq % MEMO_SKINS.length],
    }
    setIntake(reel)
  }

  // Step 2 — overlay done: drop the reel on the stack and fire the AI pipeline,
  // which surfaces it on Anna's RM Radar dashboard.
  const commitShare = async (reel: ReelItem) => {
    setIntake(null)
    setFeed((f) => [reel, ...f])
    setFreshId(reel.id)
    setTimeout(() => setFreshId(null), 800)
    showToast('Signal AI is reading your reel…')
    try {
      const res = await fetch(`${API}/signals/reel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: reel.caption, client_uuid: CLIENT_UUID }),
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        const sig = signalFromUrgency(data.rm_brief?.urgency, data.client_card?.headline)
        setFeed((f) => f.map((x) => (x.id === reel.id ? ({ ...x, signal: sig } as FeedItem) : x)))
        showToast('Shared with Anna ✓ — she’s on it')
      } else {
        showToast('Shared with Anna')
      }
    } catch {
      showToast('Shared with Anna')
    }
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
            phase={recPhase}
            onStop={stopRecording}
            onCancel={() => setRecording(false)}
          />
          <FolderSheet
            folder={openFolderData}
            onClose={() => setOpenFolder(null)}
            onOpen={(it) => {
              setOpenFolder(null)
              doExplain(it)
            }}
            onRemove={unfile}
          />
          <MoveSheet
            item={moveItem}
            folders={foldersData.map((f) => ({ name: f.name, skin: f.skin, count: f.items.length }))}
            onPick={(name) => moveItem && fileInto(moveItem, name)}
            onCreate={() => {
              const it = moveItem
              setMoveItem(null)
              setCreating({ item: it })
            }}
            onClose={() => setMoveItem(null)}
          />
          <CreateFolderSheet
            open={!!creating}
            onCreate={createFolder}
            onClose={() => setCreating(null)}
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
            onResearch={() =>
              setStockSheet({
                assets: explain?.related ?? [],
                title: 'Research',
                subtitle: 'Names tied to this idea',
              })
            }
          />
          <ResearchSheet
            assets={stockSheet?.assets ?? null}
            title={stockSheet?.title}
            subtitle={stockSheet?.subtitle}
            onClose={() => setStockSheet(null)}
          />
          <ForwardSheet context={askContext} onClose={() => setAskContext(null)} onSent={askSent} />
          <Toast message={toast} />
          {intro && <IntroSplash name={CLIENT.name} />}
          <ShareIntake reel={intake} onDone={commitShare} />
        </>
      }
    >
      <div className="pb-32">
        <Greeting
          name={CLIENT.name}
          initial={CLIENT.initial}
          onWatchlist={() =>
            setStockSheet({ assets: watchlist, title: 'Watchlist', subtitle: 'Names you’re tracking' })
          }
        />

        <div
          className="px-5"
          style={{ animation: 'introUp 0.95s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '1.75s' }}
        >
          <BalanceCard node={current} atRoot={atRoot} pct={pct} delta={delta} periodLabel={periodLabel} />
        </div>

        {/* timeframe — above the portfolio, controls the card + bento */}
        <div
          className="mt-4 px-5"
          style={{ animation: 'introUp 0.95s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '1.95s' }}
        >
          <Timeframes active={tf} onChange={setTf} />
        </div>

        {/* Portfolio */}
        <div
          className="mt-6 px-5"
          style={{ animation: 'introUp 0.95s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '2.15s' }}
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

        {/* From Anna — messages she approved on the RM dashboard land here */}
        {rmMessages.length > 0 && (
          <div className="mt-7 px-5">
            <Section title="From Anna" label="Your relationship manager">
              <div className="space-y-3">
                {rmMessages.map((m) => (
                  <RMMessageCard
                    key={m.id}
                    headline={m.headline}
                    body={m.body}
                    fresh={m.id === freshMsgId}
                    onDiscuss={() => setAdvisorOpen(true)}
                  />
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* Activity */}
        <div
          className="mt-7 px-5"
          style={{ animation: 'introUp 0.95s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '2.35s' }}
        >
          <Section title="Activity" label="Activity">
            {/* Share a reel — simulates sharing from TikTok/Instagram into Signal */}
            <button
              onClick={shareReel}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[13.5px] font-semibold text-ink-soft active:scale-[0.99]"
              style={{ border: '1px dashed var(--color-line)', background: 'var(--color-surface)' }}
            >
              <TikTokIcon size={15} /> Share a reel
            </button>

            {stackItems.length > 0 && (
              <ActivityDeck
                items={stackItems}
                freshId={freshId}
                leavingId={leavingId}
                onExplain={doExplain}
                onSendRM={doSendRM}
                onFile={doFile}
                onDelete={doDelete}
              />
            )}

            <div className={stackItems.length > 0 ? 'mt-8' : ''}>
              <Folders
                folders={foldersData}
                onOpen={setOpenFolder}
                onCreate={() => setCreating({ item: null })}
              />
            </div>
          </Section>
        </div>
      </div>
    </PhoneFrame>
  )
}
