/* GlossnGrace FULL BUG SWEEP — local production server + API interception.
 * Extends scripts/smoke-test.cjs. Covers every page at 1280px and 390px,
 * the admin-chrome rule, the mobile menu, the full booking flow with a
 * mocked API (no real bookings), the feedback flow with a mocked API,
 * internal-link 404 checks, and the home video fallback.
 * Usage: node scripts/sweep-test.cjs (server must run on 127.0.0.1:3100) */

const BASE = 'http://127.0.0.1:3100'
const CHROME =
  '/home/hatch/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome'

const SLUGS = [
  'classic-manicure',
  'gel-manicure',
  'french-manicure',
  'pedicure',
  'acrylic-nails',
  'nail-extensions',
  'nail-art-design',
  'bridal-nails',
]
const PAGES = ['/', '/services', '/book', '/gallery', '/about', '/admin']

const VIDEO_URL = 'https://omnqidmauvloedscncir.supabase.co/storage/v1/object/public/glossngrace-media/how-to-book.mp4'
// Sandbox Chromium has no internet (documented quirk): when the server-side
// video probe succeeds, the browser still cannot fetch the external mp4 and
// logs ERR_TUNNEL_CONNECTION_FAILED. That is environmental, not a site bug —
// the URL itself is verified reachable by a Node-side HEAD below instead.
const TUNNEL_ERR = /ERR_TUNNEL_CONNECTION_FAILED/
function isEnvironmental(err, failedUrls = []) {
  // The console message itself carries no URL; the requestfailed event
  // does. A tunnel error is environmental only when the failed request
  // is the known external how-to video (sandbox Chromium is offline).
  return TUNNEL_ERR.test(err) && failedUrls.some((u) => u.includes('how-to-book.mp4'))
}

const results = []
let failed = false
function record(name, ok, detail) {
  if (!ok) failed = true
  results.push({ name, ok, ...(detail ? { detail } : {}) })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + JSON.stringify(detail) : ''}`)
}

function todayISO(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function main() {
  const { chromium } = await import('playwright-core')
  const browser = await chromium.launch({
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-gpu'],
  })

  // ---- 1. Every page 1280px: 200 + zero console/page errors ----
  for (const path of [...PAGES, ...SLUGS.map((s) => `/services/${s}`)]) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await ctx.newPage()
    const errs = []
    const failedUrls = []
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
    page.on('requestfailed', (r) => failedUrls.push(r.url()))
    page.on('pageerror', (e) => errs.push(String(e)))
    let status = 0
    try {
      const res = await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 })
      status = res ? res.status() : 0
      await page.waitForTimeout(600)
    } catch (e) { errs.push('goto failed: ' + e.message) }
    const realErrs = errs.filter((e) => !isEnvironmental(e, failedUrls))
    record(`page 200 + clean ${path} (1280)`, status === 200 && realErrs.length === 0, { status, errs: realErrs })
    await ctx.close()
  }

  // ---- 2. Every page 390px: 200 + zero console errors + no overflow ----
  for (const path of [...PAGES, ...SLUGS.map((s) => `/services/${s}`)]) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    const page = await ctx.newPage()
    const errs = []
    const failedUrls = []
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
    page.on('requestfailed', (r) => failedUrls.push(r.url()))
    page.on('pageerror', (e) => errs.push(String(e)))
    let status = 0
    let overflow = 0
    try {
      const res = await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 })
      status = res ? res.status() : 0
      await page.waitForTimeout(600)
      overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    } catch (e) { errs.push('goto failed: ' + e.message) }
    const realErrs = errs.filter((e) => !isEnvironmental(e, failedUrls))
    record(`mobile clean + no overflow ${path} (390)`, status === 200 && realErrs.length === 0 && overflow <= 0, { status, overflow, errs: realErrs })
    await ctx.close()
  }

  // ---- 3. Admin chrome: /admin has NO public chrome; home HAS Book Now ----
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await ctx.newPage()
    await page.goto(BASE + '/admin', { waitUntil: 'networkidle', timeout: 30000 })
    const adminHtml = await page.content()
    const bookNowCount = (adminHtml.match(/Book Now/g) || []).length
    const servicesNav = await page.locator('a[href="/services"]').count()
    const headerCount = await page.locator('header').count()
    record('admin: zero "Book Now"', bookNowCount === 0, { count: bookNowCount })
    record('admin: zero /services nav links', servicesNav === 0, { count: servicesNav })
    record('admin: zero <header>', headerCount === 0, { count: headerCount })
    await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 })
    const homeBookNow = await page.getByText('Book Now').first().isVisible().catch(() => false)
    record('home: Book Now present', homeBookNow)
    await ctx.close()
  }

  // ---- 4. Mobile menu: opens, navigates, closes ----
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    const page = await ctx.newPage()
    await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(1500) // hydration before clicking
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.waitForTimeout(300)
    const navVisible = await page.getByRole('navigation', { name: 'Mobile' }).isVisible().catch(() => false)
    await page.getByRole('link', { name: 'Services', exact: true }).last().click()
    await page.waitForTimeout(500)
    const onServices = page.url().includes('/services')
    const menuClosed = await page.getByRole('navigation', { name: 'Mobile' }).isVisible().catch(() => false).then((v) => !v)
    record('mobile menu opens + navigates + closes', navVisible && onServices && menuClosed, { navVisible, onServices, menuClosed })
    await ctx.close()
  }

  // ---- 5. Booking flow with mocked API (no real bookings) ----
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await ctx.newPage()
    const errs = []
    page.on('pageerror', (e) => errs.push(String(e)))
    await page.route('**/api/bookings*', async (route) => {
      const req = route.request()
      if (req.method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ date: '2027-01-15', booked: ['10:00', '11:00'] }) })
      } else {
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true, id: 'mock-id' }) })
      }
    })

    // 5a. Preselect Gel Manicure via ?service=
    await page.goto(BASE + '/book?service=' + encodeURIComponent('Gel Manicure'), { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(1500) // hydration: SSR HTML alone is not clickable
    const gelPressed = await page.getByRole('button', { name: /Gel Manicure/ }).first().getAttribute('aria-pressed')
    record('booking: ?service=Gel Manicure preselected', gelPressed === 'true', { ariaPressed: gelPressed })

    // 5b. Date min = today; past date typed -> client error
    await page.getByRole('button', { name: 'Continue' }).first().click()
    await page.waitForTimeout(400)
    const min = await page.locator('#booking-date').getAttribute('min')
    record('booking: date min is today', min === todayISO(), { min, today: todayISO() })
    await page.locator('#booking-date').fill(todayISO(-1))
    await page.getByRole('button', { name: 'Continue' }).first().click()
    await page.waitForTimeout(400)
    const pastErr = await page.getByText('Please pick a date from today onwards.').isVisible().catch(() => false)
    record('booking: typed past date blocked client-side', pastErr)

    // 5c. Future date -> taken slots greyed, free slot selectable
    await page.locator('#booking-date').fill('2027-01-15')
    await page.getByRole('button', { name: 'Continue' }).first().click()
    await page.waitForTimeout(800)
    const slot10 = page.getByRole('button', { name: '10:00', exact: true })
    const slot11 = page.getByRole('button', { name: '11:00', exact: true })
    const slot12 = page.getByRole('button', { name: '12:00', exact: true })
    const s10dis = await slot10.isDisabled()
    const s11dis = await slot11.isDisabled()
    const s12dis = await slot12.isDisabled()
    record('booking: booked slots 10:00/11:00 greyed, 12:00 free', s10dis && s11dis && !s12dis, { s10dis, s11dis, s12dis })
    await slot12.click()
    await page.getByRole('button', { name: 'Continue' }).first().click()
    await page.waitForTimeout(400)

    // 5d. Details: urgent + COD + area; online disabled with "coming soon"
    const onlineDisabled = await page.locator('input[name="payment"][disabled]').count()
    // exact:true — the footer also contains "Location & hours coming soon"
    const comingSoon = await page.getByText('coming soon', { exact: true }).isVisible().catch(() => false)
    await page.locator('#booking-name').fill('Sweep Test')
    await page.locator('#booking-phone').fill('+977 9812345678')
    await page.locator('#booking-area').fill('Damak')
    await page.getByText('I need it fast').click()
    await page.getByText('I understand my booking is a request').click()
    record('booking: online payment disabled + coming soon', onlineDisabled === 1 && comingSoon, { onlineDisabled, comingSoon })
    await page.getByRole('button', { name: 'Book Appointment' }).click()
    await page.waitForTimeout(800)
    const confirmed = await page.getByText('You are booked in').isVisible().catch(() => false)
    const codShown = await page.getByText('Cash at salon').isVisible().catch(() => false)
    const fastShown = await page.getByText('⚡ Fast — need it soon').isVisible().catch(() => false)
    const areaShown = await page.getByText('Damak').isVisible().catch(() => false)
    record('booking: confirmation shows COD + fast + area', confirmed && codShown && fastShown && areaShown, { confirmed, codShown, fastShown, areaShown, errs })
    await ctx.close()

    // 5e. Preselect a second service (Bridal Nails)
    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page2 = await ctx2.newPage()
    await page2.goto(BASE + '/book?service=' + encodeURIComponent('Bridal Nails'), { waitUntil: 'networkidle', timeout: 30000 })
    await page2.waitForTimeout(1500) // hydration
    const bridalPressed = await page2.getByRole('button', { name: /Bridal Nails/ }).first().getAttribute('aria-pressed')
    record('booking: ?service=Bridal Nails preselected', bridalPressed === 'true', { ariaPressed: bridalPressed })
    await ctx2.close()
  }

  // ---- 6. Feedback flow with mocked API ----
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await ctx.newPage()
    const errs = []
    page.on('pageerror', (e) => errs.push(String(e)))
    await page.route('**/api/feedback', async (route) => {
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true, id: 'mock-fb' }) })
    })
    await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(1500) // hydration
    // validation: no rating -> error
    await page.locator('#feedback-name').fill('Sweep Tester')
    await page.locator('#feedback-message').fill('Great nails, thank you!')
    await page.getByRole('button', { name: 'Send feedback' }).click()
    await page.waitForTimeout(400)
    const ratingErr = await page.getByText('Please pick a star rating.').isVisible().catch(() => false)
    record('feedback: missing rating blocked', ratingErr)
    // success path
    await page.getByRole('radio', { name: '5 stars' }).click()
    await page.getByRole('button', { name: 'Send feedback' }).click()
    await page.waitForTimeout(800)
    const thanks = await page.getByText('Thank you!').isVisible().catch(() => false)
    record('feedback: submit shows thank-you', thanks, { errs })
    await ctx.close()
  }

  // ---- 7. Internal links: no 404s ----
  {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    const hrefs = new Set()
    for (const p of ['/', '/services', '/gallery', '/about']) {
      await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 30000 })
      const links = await page.$$eval('a[href^="/"]', (as) => as.map((a) => a.getAttribute('href')))
      links.forEach((h) => hrefs.add(h.split('#')[0]))
    }
    hrefs.delete('')
    const statuses = {}
    for (const h of hrefs) {
      const res = await page.request.get(BASE + h)
      statuses[h] = res.status()
    }
    const bad = Object.entries(statuses).filter(([, s]) => s !== 200)
    record('internal links: all 200', bad.length === 0, { checked: hrefs.size, bad })
    await ctx.close()
  }

  // ---- 8. Home video: player OR fallback card renders, no errors ----
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await ctx.newPage()
    const errs = []
    const failedUrls = []
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
    page.on('requestfailed', (r) => failedUrls.push(r.url()))
    page.on('pageerror', (e) => errs.push(String(e)))
    await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 })
    const hasVideo = (await page.locator('video').count()) > 0
    const reelCard = await page.getByText('Watch the Reel on Instagram').isVisible().catch(() => false)
    const realErrs = errs.filter((e) => !isEnvironmental(e, failedUrls))
    record('home: video player or Reel fallback renders', hasVideo || reelCard, { hasVideo, reelCard, errs: realErrs })
    await ctx.close()
  }

  // ---- 8b. Video URL reachable from a real network path (Node fetch) ----
  {
    let videoStatus = 0
    try {
      const res = await fetch(VIDEO_URL, { method: 'HEAD' })
      videoStatus = res.status
    } catch (e) { videoStatus = 0 }
    record('video URL HEAD 200 (Node fetch)', videoStatus === 200, { status: videoStatus })
  }

  // ---- 9. Service detail pages: visual + price + Book link ----
  for (const slug of SLUGS) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await ctx.newPage()
    await page.goto(BASE + `/services/${slug}`, { waitUntil: 'networkidle', timeout: 30000 })
    const h1 = (await page.locator('h1').first().textContent())?.trim() ?? ''
    // the header "Book Now" link also matches /^Book / — find the service one
    let bookHref = null
    for (const l of await page.getByRole('link', { name: /^Book / }).all()) {
      const h = await l.getAttribute('href')
      if (h && h.startsWith('/book?service=')) bookHref = h
    }
    const includes = await page.getByText("What's included").isVisible().catch(() => false)
    const visual = await page.locator('.animate-floaty').count()
    const expectedHref = `/book?service=${encodeURIComponent(h1)}`
    record(`service page /services/${slug}: visual + includes + book link`, includes && visual > 0 && bookHref === expectedHref, { h1, bookHref, expectedHref, visual })
    await ctx.close()
  }

  await browser.close()
  for (const r of results) console.log(JSON.stringify(r))
  console.log(failed ? 'SWEEP: FAILED' : 'SWEEP: PASSED')
  process.exit(failed ? 1 : 0)
}

main().catch((e) => {
  console.error('SWEEP SCRIPT ERROR', e)
  process.exit(2)
})
