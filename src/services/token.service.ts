import { countTokens, countTokensByModel } from '@/lib/tokenizer'
import { prisma } from '@/lib/prisma'
import { TokenCountRequest, TokenCountResponse } from '@/types/optimizer'

export class TokenService {
  async countTokens(request: TokenCountRequest): Promise<TokenCountResponse> {
    const { text, model = 'gpt-4' } = request
    
    const tokenCount = countTokensByModel(text, model)
    
    return {
      tokenCount,
      model,
    }
  }

  async saveTokenHistory(text: string, tokenCount: number) {
    await prisma.optimizationHistory.create({
      data: {
        originalText: text,
        tokenCount,
      },
    })
  }

  async getTokenHistory(limit: number = 10) {
    return await prisma.optimizationHistory.findMany({
      orderBy: {
        savedAt: 'desc',
      },
      take: limit,
    })
  }

  async getTokenStats() {
    const history = await prisma.optimizationHistory.findMany()
    
    const totalTokens = history.reduce((sum, record) => sum + record.tokenCount, 0)
    const averageTokens = history.length > 0 ? totalTokens / history.length : 0
    const maxTokens = history.length > 0 ? Math.max(...history.map(r => r.tokenCount)) : 0
    const minTokens = history.length > 0 ? Math.min(...history.map(r => r.tokenCount)) : 0

    return {
      totalRecords: history.length,
      totalTokens,
      averageTokens,
      maxTokens,
      minTokens,
    }
  }
}

export const tokenService = new TokenService()
