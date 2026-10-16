import { NextRequest, NextResponse } from 'next/server'
import { optimizerService } from '@/services/optimizer.service'
import { costService } from '@/services/cost.service'
import { z } from 'zod'

const optimizeRequestSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  model: z.string().optional().default('gpt-4'),
  technique: z.enum(['compression', 'summarization', 'code-optimization', 'general']).optional().default('general'),
})

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key') || process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    const validatedBody = optimizeRequestSchema.parse(body)
    
    const result = await optimizerService.optimize(validatedBody, apiKey)
    
    const costCalculation = costService.calculateCost(
      result.originalTokens,
      result.optimizedTokens,
      result.model
    )
    
    await costService.saveTokenUsage(
      result.model,
      result.originalTokens + result.optimizedTokens,
      costCalculation.totalCost,
      `Optimization using ${result.technique} technique`
    )
    
    return NextResponse.json({
      ...result,
      cost: costCalculation,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Optimization error:', error)
    return NextResponse.json(
      { error: 'Failed to optimize text' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const optimizations = await optimizerService.getOptimizations(20)
    const stats = await optimizerService.getOptimizationStats()
    
    return NextResponse.json({
      optimizations,
      stats,
    })
  } catch (error) {
    console.error('Get optimizations error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve optimizations' },
      { status: 500 }
    )
  }
}
