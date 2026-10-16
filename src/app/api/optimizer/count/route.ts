import { NextRequest, NextResponse } from 'next/server'
import { tokenService } from '@/services/token.service'
import { z } from 'zod'

const countRequestSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  model: z.string().optional().default('gpt-4'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validatedBody = countRequestSchema.parse(body)
    
    const result = await tokenService.countTokens(validatedBody)
    
    await tokenService.saveTokenHistory(validatedBody.text, result.tokenCount)
    
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Token count error:', error)
    return NextResponse.json(
      { error: 'Failed to count tokens' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const history = await tokenService.getTokenHistory(20)
    const stats = await tokenService.getTokenStats()
    
    return NextResponse.json({
      history,
      stats,
    })
  } catch (error) {
    console.error('Get token history error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve token history' },
      { status: 500 }
    )
  }
}
