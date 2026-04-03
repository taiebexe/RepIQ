import { NextResponse } from 'next/server'
import { validateHevyKey } from '@/lib/hevy'

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json()

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'API key is required' },
        { status: 400 }
      )
    }

    const valid = await validateHevyKey(apiKey)

    if (valid) {
      return NextResponse.json({ valid: true })
    } else {
      return NextResponse.json({
        valid: false,
        error: 'Invalid API key. Check your key at hevy.com/settings',
      })
    }
  } catch {
    return NextResponse.json(
      { valid: false, error: 'Failed to validate API key' },
      { status: 500 }
    )
  }
}
