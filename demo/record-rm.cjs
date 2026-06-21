// Records Anna's RM Orbit dashboard (web) — the RM side of the loop:
//   1. Anna's morning queue
//   2. A new signal ARRIVES (toast + card pops to the top, auto-selected)
//   3. She reviews it — opens "Why this?", sees the brief + portfolio
//   4. She approves & sends  →  "Sent to Leo ✓"
//   5. She triages another — dismiss
// A hidden mobile context fires the real signal so the dashboard reacts live.
const { chromium } = require('playwright')
const path = require('path')

const DASH = 'http://localhost:5175/'
const MOB = 'http://localhost:5174/'
const wait = (p, ms) => p.waitForTimeout(ms)

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const dashCtx = await browser.newContext({
    viewport: { width: 1366, height: 854 },
    deviceScaleFactor: 2,
    recordVideo: { dir: path.join(__dirname, 'raw-rm'), size: { width: 1366, height: 854 } },
  })
  const mobCtx = await browser.newContext({ viewport: { width: 412, height: 892 } }) // not recorded
  const dash = await dashCtx.newPage()
  const mob = await mobCtx.newPage()
  const shot = (n) => dash.screenshot({ path: path.join(__dirname, 'shots', n) }).catch(() => {})

  await Promise.all([
    dash.goto(DASH, { waitUntil: 'networkidle' }),
    mob.goto(MOB, { waitUntil: 'networkidle' }),
  ])

  // 1 — Anna's morning queue
  await wait(dash, 2600); await shot('rm-01-queue.png')

  // 2 — fire a real signal from the (hidden) phone
  try {
    await mob.evaluate(() => {
      const el = document.querySelector('.overflow-y-auto')
      if (el) el.scrollTo({ top: el.scrollHeight })
    })
    await wait(mob, 600)
    await mob.locator('button:has-text("Share a reel")').first().click()
  } catch (e) { console.log('mobile trigger:', e.message) }

  // 3 — dashboard receives it: the LIVE card pops to top + toast, auto-selected
  const liveCard = dash.locator('text=Anna noticed what you shared').first()
  try {
    await liveCard.waitFor({ state: 'visible', timeout: 12000 })
    await shot('rm-02-notification.png') // toast still up
    await wait(dash, 2000); await shot('rm-03-selected.png')
  } catch (e) { console.log('receive wait:', e.message) }

  // 4 — review: open "Why this?"
  try {
    await liveCard.click()
    await wait(dash, 800)
    const why = dash.locator('text=Why this?').first()
    if (await why.count()) { await why.click(); await wait(dash, 1600); await shot('rm-04-review.png') }
  } catch (e) { console.log('review step:', e.message) }

  // 5 — approve & send
  try {
    await dash.locator('button:has-text("Approve & send")').first().click()
    await wait(dash, 600); await shot('rm-05-sending.png')
    await wait(dash, 2400); await shot('rm-06-sent.png')
  } catch (e) { console.log('approve step:', e.message) }

  // 6 — triage another: dismiss
  try {
    await dash.locator('text=Sophie Brenner').first().click()
    await wait(dash, 1000)
    await dash.locator('button:has-text("Dismiss")').first().click()
    await wait(dash, 2200); await shot('rm-07-dismiss.png')
  } catch (e) { console.log('dismiss step:', e.message) }

  await wait(dash, 1200)
  await dashCtx.close()
  await mobCtx.close()
  await browser.close()
  console.log('done')
})().catch((e) => { console.error(e); process.exit(1) })
