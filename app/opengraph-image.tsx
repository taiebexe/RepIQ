import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'RepIQ — AI-powered workout analytics'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #111128 50%, #0a0a0f 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: '#4f6ef7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            R
          </div>
          <span
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#4f6ef7',
            }}
          >
            RepIQ
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: '32px',
            color: '#888',
            marginBottom: '40px',
          }}
        >
          AI-powered workout analytics for Hevy
        </p>

        {/* Feature pills */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          {['Training Analytics', 'AI Coach', 'Goal Setting', 'Nutrition Hints'].map(
            (label) => (
              <div
                key={label}
                style={{
                  padding: '12px 24px',
                  borderRadius: '999px',
                  background: 'rgba(79, 110, 247, 0.1)',
                  border: '1px solid rgba(79, 110, 247, 0.3)',
                  color: '#4f6ef7',
                  fontSize: '20px',
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  )
}
