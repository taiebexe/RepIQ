import { NextResponse } from 'next/server'
import { loginWithCredentials, fetchUserAccount } from '@/lib/hevy-internal'

export async function POST(req: Request) {
  try {
    const { emailOrUsername, password, recaptchaToken } = await req.json()

    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { error: 'Email/username and password are required' },
        { status: 400 }
      )
    }

    if (!recaptchaToken) {
      return NextResponse.json(
        { error: 'reCAPTCHA token is required' },
        { status: 400 }
      )
    }

    const loginData = await loginWithCredentials(
      emailOrUsername,
      password,
      recaptchaToken
    )

    // Fetch username if not returned by login
    let username = loginData.username
    if (!username) {
      try {
        const account = await fetchUserAccount(loginData.access_token)
        username = account.username
      } catch {
        // Username is optional, continue without it
      }
    }

    return NextResponse.json({
      accessToken: loginData.access_token,
      refreshToken: loginData.refresh_token,
      expiresAt: loginData.expires_at,
      username: username || emailOrUsername,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed'
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
