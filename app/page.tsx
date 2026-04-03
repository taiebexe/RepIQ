'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type LoginTab = 'credentials' | 'api_key'

export default function Home() {
  const router = useRouter()
  const [tab, setTab] = useState<LoginTab>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')

  useEffect(() => {
    const auth = sessionStorage.getItem('hevy_auth')
    if (auth) router.push('/dashboard')
  }, [router])

  async function handleCredentialsLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email/username and password')
      return
    }

    setLoading(true)
    setError('')
    setLoadingMsg('Logging in to Hevy...')

    try {
      const res = await fetch('/api/hevy/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrUsername: email.trim(),
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      sessionStorage.setItem(
        'hevy_auth',
        JSON.stringify({
          type: 'credentials',
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          username: data.username,
        })
      )

      router.push('/dashboard')
    } catch {
      setError('Connection failed. Please try again.')
      setLoading(false)
    }
  }

  async function handleApiKeyLogin() {
    if (!apiKey.trim()) {
      setError('Please enter your API key')
      return
    }

    setLoading(true)
    setError('')
    setLoadingMsg('Validating API key...')

    try {
      const res = await fetch('/api/hevy/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      })

      const data = await res.json()

      if (data.valid) {
        sessionStorage.setItem(
          'hevy_auth',
          JSON.stringify({
            type: 'api_key',
            apiKey: apiKey.trim(),
          })
        )
        router.push('/dashboard')
      } else {
        setError(data.error || 'Invalid API key')
        setLoading(false)
      }
    } catch {
      setError('Connection failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4">
      <div className="w-full max-w-md">
        {/* Logo + tagline */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[#4f6ef7]">RepIQ</h1>
          <p className="mt-2 text-[#888]">
            AI-powered analytics for your Hevy data
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[#1e1e2e]">
            <button
              onClick={() => { setTab('credentials'); setError('') }}
              className={`flex-1 px-4 py-3.5 text-sm font-medium transition-colors ${
                tab === 'credentials'
                  ? 'bg-[#0a0a0f] text-white border-b-2 border-[#4f6ef7]'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              Hevy Login
            </button>
            <button
              onClick={() => { setTab('api_key'); setError('') }}
              className={`flex-1 px-4 py-3.5 text-sm font-medium transition-colors ${
                tab === 'api_key'
                  ? 'bg-[#0a0a0f] text-white border-b-2 border-[#4f6ef7]'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              API Key
            </button>
          </div>

          <div className="p-6">
            {tab === 'credentials' ? (
              <div className="space-y-4">
                <div>
                  <p className="mb-4 text-sm text-[#888]">
                    Log in with your Hevy account for full access — no PRO
                    membership required.
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#888]">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCredentialsLogin()}
                    className="w-full rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] px-4 py-3 text-sm text-white placeholder-[#555] outline-none focus:border-[#4f6ef7]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#888]">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCredentialsLogin()}
                    className="w-full rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] px-4 py-3 text-sm text-white placeholder-[#555] outline-none focus:border-[#4f6ef7]"
                  />
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  onClick={handleCredentialsLogin}
                  disabled={loading}
                  className="w-full rounded-lg bg-[#4f6ef7] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#3d5bd9] disabled:opacity-50"
                >
                  {loading ? loadingMsg : 'Log in & Analyze'}
                </button>

                <div className="flex items-center gap-2 rounded-lg bg-[#0a0a0f] p-3">
                  <svg className="h-4 w-4 shrink-0 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="text-xs text-[#888]">
                    Your credentials are sent directly to Hevy&apos;s servers. We never store them.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="mb-4 text-sm text-[#888]">
                  Use your Hevy PRO API key. Some features may be limited.
                </p>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#888]">
                    API Key
                  </label>
                  <input
                    type="password"
                    placeholder="sk_live_..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApiKeyLogin()}
                    className="w-full rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] px-4 py-3 text-sm text-white placeholder-[#555] outline-none focus:border-[#4f6ef7]"
                  />
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  onClick={handleApiKeyLogin}
                  disabled={loading}
                  className="w-full rounded-lg bg-[#4f6ef7] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#3d5bd9] disabled:opacity-50"
                >
                  {loading ? loadingMsg : 'Connect & Analyze'}
                </button>

                <p className="text-center text-xs text-[#555]">
                  Get your key at{' '}
                  <span className="text-[#4f6ef7]">hevy.com/settings?developer</span>
                  {' '}(requires Hevy Pro)
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-[#555]">
          Your data stays in your browser. Nothing is stored on our servers.
        </p>

        <div className="mt-4 flex justify-center">
          <a
            href="https://paypal.me/TaiebBourbia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-[#f59e0b30] bg-[#f59e0b08] px-4 py-2 text-xs font-medium text-[#f59e0b] transition-all hover:border-[#f59e0b50] hover:bg-[#f59e0b15]"
          >
            <span>☕</span>
            <span>Buy me a coffee</span>
          </a>
        </div>
      </div>
    </div>
  )
}
