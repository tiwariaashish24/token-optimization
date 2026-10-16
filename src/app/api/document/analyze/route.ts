import { NextRequest, NextResponse } from 'next/server'
import { createOpenAI } from '@/lib/openai'
import { countTokens } from '@/lib/tokenizer'

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const query = formData.get('query') as string

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    // Read file content
    const text = await file.text()
    const openai = createOpenAI(apiKey)

    // Analyze document with AI
    const systemPrompt = `You are a document analysis expert specializing in token optimization. Analyze the provided document and answer the user's query. Provide:
1. Direct answer to the query
2. Token count of the relevant section
3. Any optimization suggestions
4. Cost estimation for processing`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Document:\n${text}\n\nQuery: ${query}`,
        },
      ],
      temperature: 0.3,
    })

    const analysis = completion.choices[0]?.message?.content || 'No analysis available'
    const tokenCount = countTokens(text)
    const analysisTokens = countTokens(analysis)

    return NextResponse.json({
      analysis,
      documentStats: {
        totalTokens: tokenCount,
        characterCount: text.length,
        wordCount: text.split(/\s+/).length,
      },
      analysisStats: {
        tokens: analysisTokens,
      },
    })
  } catch (error) {
    console.error('Document analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze document' },
      { status: 500 }
    )
  }
}
