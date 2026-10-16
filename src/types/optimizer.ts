export interface OptimizationRequest {
  text: string
  model?: string
  technique?: 'compression' | 'summarization' | 'code-optimization' | 'general'
}

export interface OptimizationResponse {
  originalText: string
  optimizedText: string
  originalTokens: number
  optimizedTokens: number
  tokenReduction: number
  reductionPercentage: number
  model: string
  technique: string
}

export interface TokenCountRequest {
  text: string
  model?: string
}

export interface TokenCountResponse {
  tokenCount: number
  model: string
}

export interface CostCalculation {
  inputTokens: number
  outputTokens: number
  model: string
  inputCost: number
  outputCost: number
  totalCost: number
}

export type OptimizationTechnique = 'compression' | 'summarization' | 'code-optimization' | 'general'

export type ModelName = 'gpt-4' | 'gpt-4-32k' | 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k'

export interface TokenUsage {
  id: string
  date: Date
  model: string
  tokensUsed: number
  cost: number
  description?: string
}

export interface Optimization {
  id: string
  originalText: string
  optimizedText: string
  originalTokens: number
  optimizedTokens: number
  tokenReduction: number
  reductionPercentage: number
  model: string
  technique: string
  createdAt: Date
  updatedAt: Date
}
