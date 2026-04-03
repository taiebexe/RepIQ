import puppeteer, { Browser } from 'puppeteer-core'

const RECAPTCHA_SITE_KEY = '6LfkQG0jAAAAANTrIkVXKPfSPHyJnt4hYPWqxh0R'

let cachedToken: { token: string; expiresAt: number } | null = null

async function getBrowser(): Promise<Browser> {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    // Vercel / serverless: use @sparticuz/chromium
    const chromium = (await import('@sparticuz/chromium')).default
    chromium.setHeadlessMode = true
    chromium.setGraphicsMode = false
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    })
  }

  // Local dev: use system Chrome or Puppeteer's installed Chrome
  const localPaths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
  ]

  // Try puppeteer's bundled Chrome first
  try {
    const fullPuppeteer = await import('puppeteer')
    return fullPuppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    })
  } catch {
    // Fall back to system Chrome
  }

  for (const p of localPaths) {
    try {
      return await puppeteer.launch({
        executablePath: p,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      })
    } catch {
      continue
    }
  }

  throw new Error('No Chrome installation found')
}

/**
 * Uses a headless browser to visit Hevy's login page and extract
 * a valid reCAPTCHA Enterprise token for the login action.
 */
export async function getRecaptchaToken(): Promise<string> {
  // Return cached token if still valid (single use, cleared after return)
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    const token = cachedToken.token
    cachedToken = null
    return token
  }

  let browser: Browser | undefined
  try {
    browser = await getBrowser()
    const page = await browser.newPage()

    await page.goto('https://www.hevy.com/login', {
      waitUntil: 'networkidle2',
      timeout: 20000,
    })

    // Wait for reCAPTCHA to load and execute it
    const token = await page.evaluate(async (siteKey: string) => {
      for (let i = 0; i < 50; i++) {
        if ((window as any).grecaptcha?.enterprise?.execute) break
        await new Promise((r) => setTimeout(r, 200))
      }

      const grecaptcha = (window as any).grecaptcha?.enterprise
      if (!grecaptcha?.execute) {
        throw new Error('reCAPTCHA not loaded')
      }

      return grecaptcha.execute(siteKey, { action: 'login' })
    }, RECAPTCHA_SITE_KEY)

    if (!token) throw new Error('Failed to get reCAPTCHA token')

    // Cache for 15 seconds (tokens are single-use and expire quickly)
    cachedToken = { token, expiresAt: Date.now() + 15000 }

    return token
  } finally {
    if (browser) await browser.close()
  }
}
