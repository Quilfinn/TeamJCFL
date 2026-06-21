// Records the FULL cross-app loop as two synchronized videos:
//   LEFT  = Anna's RM Orbit dashboard (:5175)
//   RIGHT = Leo's mobile (:5174)
// They interact for real through the live backend (dashboard polls every 1s),
// so the sync is genuine. Composited side-by-side afterwards with ffmpeg.
//
// Beat sheet:
//   1. Both open — dashboard queue + mobile home
//   2. Mobile: a TikTok arrives → reel lands with its AI recommendation
//   3. Dashboard: Leo's signal pops into Anna's queue (the sync moment)
//   4. Mobile: Orbit reads the reel → Leo sends it to Clara
//   5. Dashboard: Anna approves & sends
//   6. Mobile: the note from Anna lands in Leo's feed (loop closed)
const { chromium } = require('playwright')
const path = require('path')

const DASH = 'http://localhost:5175/'
const MOB = 'http://localhost:5174/'

async function scrollDown(page, ratio) {
  await page.evaluate((r) => {
    const el = document.querySelector('.overflow-y-auto')
    if (el) el.scrollTo({ top: (el.scrollHeight - el.clientHeight) * r, behavior: 'smooth' })
  }, ratio)
}
const wait = (p, ms) => p.waitForTimeout(ms)
const shot = (page, n) => page.screenshot({ path: path.join(__dirname, 'shots', n) }).catch(() => {})

;(async () => {
  const browser = await chromium.launch({ headless: true })

  const dashCtx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    recordVideo: { dir: path.join(__dirname, 'raw-dash'), size: { width: 1280, height: 900 } },
  })
  const mobCtx = await browser.newContext({
    viewport: { width: 412, height: 892 },
    deviceScaleFactor: 2,
    reducedMotion: 'no-preference',
    recordVideo: { dir: path.join(__dirname, 'raw-mob'), size: { width: 412, height: 892 } },
  })
  const dash = await dashCtx.newPage()
  const mob = await mobCtx.newPage()

  await Promise.all([
    dash.goto(DASH, { waitUntil: 'networkidle' }),
    mob.goto(MOB, { waitUntil: 'networkidle' }),
  ])

  // 1 — settle on the opening state of both
  await wait(mob, 3000) // mobile intro splash → home
  await shot(dash, 'duo-01-dash-open.png')

  // 2 — mobile: a reel arrives from TikTok
  await scrollDown(mob, 1)
  await wait(mob, 700)
  await mob.locator('button:has-text("Share a reel")').first().click()
  // intake overlay plays, reel lands, fires to backend
  await wait(mob, 3200)
  await shot(mob, 'duo-02-mob-landed.png')

  // 3 — dashboard: Leo's signal appears in Anna's queue (poll-driven)
  try {
    await dash.locator('text=Leo Ackermann').first().waitFor({ state: 'visible', timeout: 8000 })
  } catch (e) { console.log('dash signal wait:', e.message) }
  await wait(dash, 2200)
  await shot(dash, 'duo-03-dash-signal.png')

  // 4 — mobile: Orbit reads the reel, then Leo sends it to Clara
  try {
    await mob.locator('button:has-text("Explain")').first().click()
    await wait(mob, 4200) // Orbit thinks → types → action card
    await shot(mob, 'duo-04-mob-orbit.png')
    // send to Clara (secondary action in Orbit) → ForwardSheet
    const clara = mob.locator('button:has-text("Clara")').first()
    if (await clara.count()) {
      await clara.click()
      await wait(mob, 1400)
      await shot(mob, 'duo-05-mob-sendclara.png')
      const send = mob.locator('button:has-text("Send to Clara")').first()
      if (await send.count()) { await send.click(); await wait(mob, 1800) }
    }
    // sending reopens Orbit with the reply — close it so the feed is visible
    const close = mob.locator('button[aria-label="Close"]').first()
    if (await close.count()) { await close.click(); await wait(mob, 800) }
  } catch (e) { console.log('orbit/clara step:', e.message) }

  // 5 — dashboard: Anna approves & sends
  try {
    await dash.locator('text=Leo Ackermann').first().click()
    await wait(dash, 1200)
    await dash.locator('button:has-text("Approve & send")').first().click()
    await wait(dash, 2200)
    await shot(dash, 'duo-06-dash-approved.png')
  } catch (e) { console.log('approve step:', e.message) }

  // 6 — mobile: the note from Anna lands (poll-driven). Close any open sheet first.
  try {
    const close = mob.locator('button[aria-label="Close"]').first()
    if (await close.count()) { await close.click().catch(() => {}); await wait(mob, 500) }
    await mob.locator('text=From Anna').first().waitFor({ state: 'visible', timeout: 9000 })
    await scrollDown(mob, 0.1)
    await wait(mob, 3000)
    await shot(mob, 'duo-07-mob-fromanna.png')
  } catch (e) { console.log('from-anna wait:', e.message) }

  await wait(mob, 1200)
  await Promise.all([dashCtx.close(), mobCtx.close()])
  await browser.close()
  console.log('done')
})().catch((e) => { console.error(e); process.exit(1) })
