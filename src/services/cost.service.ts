import { CostCalculation } from '@/types/optimizer'
import { prisma } from '@/lib/prisma'

export class CostService {
  private pricing: Record<string, { input: number; output: number }> = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-32k': { input: 0.06, output: 0.12 },
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
    'gpt-3.5-turbo-16k': { input: 0.003, output: 0.004 },
  }

  calculateCost(inputTokens: number, outputTokens: number, model: string): CostCalculation {
    const pricing = this.pricing[model] || this.pricing['gpt-3.5-turbo']
    
    const inputCost = (inputTokens / 1000) * pricing.input
    const outputCost = (outputTokens / 1000) * pricing.output
    const totalCost = inputCost + outputCost

    return {
      inputTokens,
      outputTokens,
      model,
      inputCost,
      outputCost,
      totalCost,
    }
  }

  async saveTokenUsage(model: string, tokensUsed: number, cost: number, description?: string) {
    await prisma.tokenUsage.create({
      data: {
        model,
        tokensUsed,
        cost,
        description,
      },
    })
  }

  async getTokenUsageStats(days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const usage = await prisma.tokenUsage.findMany({
      where: {
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    const totalTokens = usage.reduce((sum, u) => sum + u.tokensUsed, 0)
    const totalCost = usage.reduce((sum, u) => sum + u.cost, 0)
    const averageCostPerDay = usage.length > 0 ? totalCost / days : 0

    const usageByModel = usage.reduce((acc, u) => {
      if (!acc[u.model]) {
        acc[u.model] = { tokens: 0, cost: 0 }
      }
      acc[u.model].tokens += u.tokensUsed
      acc[u.model].cost += u.cost
      return acc
    }, {} as Record<string, { tokens: number; cost: number }>)

    return {
      totalRecords: usage.length,
      totalTokens,
      totalCost,
      averageCostPerDay,
      usageByModel,
      period: `${days} days`,
    }
  }

  async getDailyUsage(days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const usage = await prisma.tokenUsage.findMany({
      where: {
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    const dailyUsage = usage.reduce((acc, u) => {
      const dateKey = u.date.toISOString().split('T')[0]
      if (!acc[dateKey]) {
        acc[dateKey] = { tokens: 0, cost: 0 }
      }
      acc[dateKey].tokens += u.tokensUsed
      acc[dateKey].cost += u.cost
      return acc
    }, {} as Record<string, { tokens: number; cost: number }>)

    return Object.entries(dailyUsage).map(([date, data]) => ({
      date,
      ...data,
    }))
  }
}

export const costService = new CostService()
