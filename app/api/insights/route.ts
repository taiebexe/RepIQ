import { NextResponse } from 'next/server'
import { generateInsights } from '@/lib/insights'
import { PlateauSignal } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const { aiContext, plateaus } = (await req.json()) as {
      aiContext: string
      plateaus: PlateauSignal[]
    }

    if (!aiContext) {
      return NextResponse.json(
        { error: 'aiContext is required' },
        { status: 400 }
      )
    }

    const insights = await generateInsights(aiContext, plateaus || [])
    return NextResponse.json({ insights })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
