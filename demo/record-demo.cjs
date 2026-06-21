// Records the "smartest" mobile flow as a video, for dropping into Canva.
// Beat sheet:
//   1. App opens (intro)
//   2. A TikTok arrives — "Received from TikTok" hand-off
//   3. The reel lands in Activity with its AI recommendation pill (scroll to it)
//   4. Tap it → Orbit reads it, types its take, surfaces a suggested action
const { chromium } = require('playwright')
const path = require('path')

const URL = process.env.DEMO_URL || 'http://localhost:5174/?from=tiktok'
const OUT = path.join(__dirname, 'raw')

// smooth-scroll the phone's inner scroll container to a target ratio (0..1)
async function scrollTo(page, ratio) {
  await page.evaluate((r) => {
    const el = document.querySelector('.overflow-y-auto')
    if (!el) return
    const top = (el.scrollHeight - el.clientHeight) * r
    el.scrollTo({ top, behavior: 'smooth' })
  }, ratio)
}

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 412, height: 892 },
    deviceScaleFactor: 2,
    reducedMotion: 'no-preference',
    recordVideo: { dir: OUT, size: { width: 412, height: 892 } },
  })
  const page = await context.newPage()
  const shot = (n) => page.screenshot({ path: path.join(__dirname, 'shots', n) })

  await page.goto(URL, { waitUntil: 'networkidle' })

  // 2 — catch the "Received from TikTok" intake overlay
  try {
    await page.getByText('Received from TikTok').waitFor({ state: 'visible', timeout: 8000 })
    await page.waitForTimeout(500); await shot('01-intake.png')
  } catch (e) { console.log('intake not caught:', e.message) }

  // 3 — reel lands; let it settle, then scroll down to reveal it + the pill
  await page.waitForTimeout(2600)
  await scrollTo(page, 1)
  await page.waitForTimeout(1800); await shot('02-landed.png')

  // 4 — open Orbit on the reel
  try {
    const explain = page.locator('button:has-text("Explain")').first()
    await explain.waitFor({ state: 'visible', timeout: 6000 })
    await explain.click()
    await page.waitForTimeout(1300); await shot('03-orbit-typing.png')
    await page.waitForTimeout(5200); await shot('04-orbit-done.png')
    await page.waitForTimeout(1200)
  } catch (e) {
    console.log('Explain step skipped:', e.message)
    await page.waitForTimeout(2000)
  }

  // 5 — send it to Clara: Orbit "Clara" → ForwardSheet → Send
  try {
    const clara = page.locator('button:has-text("Clara")').first()
    await clara.waitFor({ state: 'visible', timeout: 4000 })
    await clara.click()
    await page.waitForTimeout(1400); await shot('05-send-clara.png') // ForwardSheet
    const send = page.locator('button:has-text("Send to Clara")').first()
    await send.waitFor({ state: 'visible', timeout: 4000 })
    await send.click()
    await page.waitForTimeout(3000); await shot('06-clara-reply.png') // Clara/Orbit reply
    await page.waitForTimeout(1800) // hold on the final frame
  } catch (e) {
    console.log('Clara step skipped:', e.message)
    await page.waitForTimeout(1500)
  }

  await context.close() // flushes the video to disk
  await browser.close()
  console.log('done')
})().catch((e) => { console.error(e); process.exit(1) })
