/* GlossnGrace smoke test — production build, real Chromium.
 * Checks: /, /services, /book, /gallery, /about return 200 with no
 * console errors or page errors; booking form shows validation errors
 * on empty submit. Does NOT submit a real booking. */

const BASE = 'http://127.0.0.1:3100'
const CHROME =
  '/home/hatch/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome'

async function main() {
  const { chromium } = await import('playwright-core')
  const browser = await chromium.launch({
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-gpu'],
  })
  const results = []
  let failed = false

  async function checkPage(path, viewport) {
    const context = await browser.newContext({ viewport })
    const page = await context.newPage()
    const consoleErrors = []
    const pageErrors = []
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text())
    })
    page.on('pageerror', (e) => pageErrors.push(String(e)))
    let status = 0
    try {
      const res = await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 })
      status = res ? res.status() : 0
      await page.waitForTimeout(800)
    } catch (e) {
      pageErrors.push('goto failed: ' + e.message)
    }
    const ok = status === 200 && consoleErrors.length === 0 && pageErrors.length === 0
    if (!ok) failed = true
    results.push({ path, viewport: `${viewport.width}x${viewport.height}`, status, consoleErrors, pageErrors, ok })
    await context.close()
  }

  await checkPage('/', { width: 1280, height: 800 })
  await checkPage('/services', { width: 1280, height: 800 })
  await checkPage('/services/classic-manicure', { width: 1280, height: 800 })
  await checkPage('/services/bridal-nails', { width: 1280, height: 800 })
  await checkPage('/book', { width: 1280, height: 800 })
  await checkPage('/gallery', { width: 1280, height: 800 })
  await checkPage('/about', { width: 1280, height: 800 })
  await checkPage('/admin', { width: 1280, height: 800 })
  // mobile home: check for horizontal overflow
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const mpage = await mctx.newPage()
  const mConsole = []
  mpage.on('console', (m) => { if (m.type() === 'error') mConsole.push(m.text()) })
  const mres = await mpage.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 })
  await mpage.waitForTimeout(800)
  const overflow = await mpage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  const mobileOk = mres.status() === 200 && mConsole.length === 0 && overflow <= 0
  if (!mobileOk) failed = true
  results.push({ path: '/ (mobile 390px)', viewport: '390x844', status: mres.status(), consoleErrors: mConsole, pageErrors: [], overflow, ok: mobileOk })
  await mctx.close()

  // Booking form: empty submit must show validation errors
  const bctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const bpage = await bctx.newPage()
  const bErrors = []
  bpage.on('pageerror', (e) => bErrors.push(String(e)))
  await bpage.goto(BASE + '/book', { waitUntil: 'networkidle', timeout: 30000 })
  await bpage.getByRole('button', { name: 'Continue' }).first().click()
  await bpage.waitForTimeout(500)
  const errVisible = await bpage.getByText('Please choose a service.').isVisible().catch(() => false)
  // step 2: pick a service, continue to date step, then continue with no date -> date error
  await bpage.getByRole('button', { name: /Classic Manicure/ }).first().click()
  await bpage.getByRole('button', { name: 'Continue' }).first().click()
  await bpage.waitForTimeout(300)
  await bpage.getByRole('button', { name: 'Continue' }).first().click()
  await bpage.waitForTimeout(500)
  const dateErrVisible = await bpage.getByText('Please pick a date.').isVisible().catch(() => false)
  // step 4 validation: jump through with a date+time, then empty details submit
  const today = new Date()
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  await bpage.locator('#booking-date').fill(iso)
  await bpage.getByRole('button', { name: 'Continue' }).first().click()
  await bpage.waitForTimeout(700)
  // click the first enabled time slot (earlier slots may be in the past)
  await bpage.locator('button:not([disabled])', { hasText: /^\d{2}:00$/ }).first().click()
  await bpage.getByRole('button', { name: 'Continue' }).first().click()
  await bpage.waitForTimeout(500)
  await bpage.getByRole('button', { name: 'Book Appointment' }).click()
  await bpage.waitForTimeout(500)
  const nameErr = await bpage.getByText('Please enter your name.').isVisible().catch(() => false)
  const phoneErr = await bpage.getByText('Please enter a valid phone number.').isVisible().catch(() => false)
  const formOk = errVisible && dateErrVisible && nameErr && phoneErr && bErrors.length === 0
  if (!formOk) failed = true
  results.push({ path: '/book validation', viewport: '1280x800', status: 200, consoleErrors: [], pageErrors: bErrors, checks: { serviceError: errVisible, dateError: dateErrVisible, nameError: nameErr, phoneError: phoneErr }, ok: formOk })
  await bctx.close()

  // Feedback form: empty submit must show a validation error
  const fctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const fpage = await fctx.newPage()
  const fErrors = []
  fpage.on('pageerror', (e) => fErrors.push(String(e)))
  await fpage.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 })
  await fpage.getByRole('button', { name: 'Send feedback' }).click()
  await fpage.waitForTimeout(500)
  const fbNameErr = await fpage.getByText('Please enter your name.').isVisible().catch(() => false)
  const fbFormOk = fbNameErr && fErrors.length === 0
  if (!fbFormOk) failed = true
  results.push({ path: '/ feedback validation', viewport: '1280x800', status: 200, consoleErrors: [], pageErrors: fErrors, checks: { nameError: fbNameErr }, ok: fbFormOk })
  await fctx.close()

  // Admin logged out: must show the sign-in form, not the dashboard
  const actx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const apage = await actx.newPage()
  const aErrors = []
  apage.on('pageerror', (e) => aErrors.push(String(e)))
  const ares = await apage.goto(BASE + '/admin', { waitUntil: 'networkidle', timeout: 30000 })
  await apage.waitForTimeout(500)
  const signInVisible = await apage.getByText('Admin sign in').isVisible().catch(() => false)
  const signInBtn = await apage.getByRole('button', { name: 'Sign in' }).isVisible().catch(() => false)
  const noDashboard = await apage.getByText('No bookings yet.').isVisible().catch(() => false).then((v) => !v)
  const adminOk = ares.status() === 200 && signInVisible && signInBtn && noDashboard && aErrors.length === 0
  if (!adminOk) failed = true
  results.push({ path: '/admin logged-out', viewport: '1280x800', status: ares.status(), consoleErrors: [], pageErrors: aErrors, checks: { signInVisible, signInBtn, noDashboard }, ok: adminOk })
  await actx.close()

  // Service detail page: shows the animated visual, includes list, book button
  const sctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const spage = await sctx.newPage()
  const sErrors = []
  spage.on('pageerror', (e) => sErrors.push(String(e)))
  await spage.goto(BASE + '/services/gel-manicure', { waitUntil: 'networkidle', timeout: 30000 })
  await spage.waitForTimeout(500)
  const includesVisible = await spage.getByText("What's included").isVisible().catch(() => false)
  const bookBtn = await spage.getByRole('link', { name: 'Book Gel Manicure' }).isVisible().catch(() => false)
  const previewNote = await spage.getByText('Animated preview of the look').isVisible().catch(() => false)
  const serviceOk = includesVisible && bookBtn && previewNote && sErrors.length === 0
  if (!serviceOk) failed = true
  results.push({ path: '/services/gel-manicure content', viewport: '1280x800', status: 200, consoleErrors: [], pageErrors: sErrors, checks: { includesVisible, bookBtn, previewNote }, ok: serviceOk })
  await sctx.close()

  await browser.close()
  for (const r of results) {
    console.log(JSON.stringify(r))
  }
  console.log(failed ? 'SMOKE: FAILED' : 'SMOKE: PASSED')
  process.exit(failed ? 1 : 0)
}

main().catch((e) => {
  console.error('SMOKE SCRIPT ERROR', e)
  process.exit(2)
})
