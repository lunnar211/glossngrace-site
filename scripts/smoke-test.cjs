/* GlossnGrace smoke test — production build, real Chromium.
 * Checks: /, /services, /book, /gallery, /about return 200 with no
 * console errors or page errors; booking form shows validation errors
 * on empty submit. Does NOT submit a real booking. */
const { chromium } = require('playwright-core')

const BASE = 'http://127.0.0.1:3100'
const CHROME =
  '/home/hatch/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome'

async function main() {
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
  await checkPage('/book', { width: 1280, height: 800 })
  await checkPage('/gallery', { width: 1280, height: 800 })
  await checkPage('/about', { width: 1280, height: 800 })
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
