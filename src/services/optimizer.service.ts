import { createOpenAI } from '@/lib/openai'
import { countTokens } from '@/lib/tokenizer'
import { prisma } from '@/lib/prisma'
import { OptimizationRequest, OptimizationResponse } from '@/types/optimizer'

export class OptimizerService {
  private getPrompt(technique: string): string {
    const prompts: Record<string, string> = {
      compression: 'Optimize this text to reduce token count while maintaining the core meaning and important details. Make it more concise.',
      summarization: 'Summarize this text to reduce token count while keeping the main points and key information.',
      'code-optimization': 'Optimize this code to be more concise and efficient while maintaining functionality.',
      general: 'Rewrite this text to be more concise and reduce token count while preserving the essential meaning.',
    }
    
    return prompts[technique] || prompts.general
  }

  async optimize(request: OptimizationRequest, apiKey?: string): Promise<OptimizationResponse> {
    const { text, model = 'gpt-4', technique = 'general' } = request
    
    const originalTokens = countTokens(text, model)
    
    const prompt = this.getPrompt(technique)
    
    const openai = createOpenAI(apiKey || process.env.OPENAI_API_KEY || '')
    
    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: prompt,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.7,
        max_tokens: originalTokens,
      })

      const optimizedText = completion.choices[0]?.message?.content || text
      const optimizedTokens = countTokens(optimizedText, model)
      const tokenReduction = originalTokens - optimizedTokens
      const reductionPercentage = originalTokens > 0 
        ? (tokenReduction / originalTokens) * 100 
        : 0

      const optimization = await prisma.optimization.create({
        data: {
          originalText: text,
          optimizedText,
          originalTokens,
          optimizedTokens,
          tokenReduction,
          reductionPercentage,
          model,
          technique,
        },
      })

      return {
        originalText: optimization.originalText,
        optimizedText: optimization.optimizedText,
        originalTokens: optimization.originalTokens,
        optimizedTokens: optimization.optimizedTokens,
        tokenReduction: optimization.tokenReduction,
        reductionPercentage: optimization.reductionPercentage,
        model: optimization.model,
        technique: optimization.technique,
      }
    } catch (error) {
      console.error('Optimization error:', error)
      throw new Error('Failed to optimize text')
    }
  }

  async getOptimizations(limit: number = 10) {
    return await prisma.optimization.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })
  }

  async getOptimizationById(id: string) {
    return await prisma.optimization.findUnique({
      where: { id },
    })
  }

  async getOptimizationStats() {
    const optimizations = await prisma.optimization.findMany()
    
    if (optimizations.length === 0) {
      return {
        totalOptimizations: 0,
        averageReduction: 0,
        totalTokensSaved: 0,
        bestReduction: 0,
      }
    }

    const totalReduction = optimizations.reduce((sum, opt) => sum + opt.tokenReduction, 0)
    const averageReduction = optimizations.reduce((sum, opt) => sum + opt.reductionPercentage, 0) / optimizations.length
    const bestReduction = Math.max(...optimizations.map(opt => opt.reductionPercentage))

    return {
      totalOptimizations: optimizations.length,
      averageReduction,
      totalTokensSaved: totalReduction,
      bestReduction,
    }
  }
}

export const optimizerService = new OptimizerService()
