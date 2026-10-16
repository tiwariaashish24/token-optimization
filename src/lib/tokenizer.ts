// Token estimation without tiktoken dependency
// This provides a reasonable approximation for token counting

export function countTokens(text: string, model: string = 'gpt-4'): number {
  return estimateTokens(text)
}

export function countTokensByModel(text: string, model: string): number {
  return estimateTokens(text)
}

// Estimation method based on character and word count
export function estimateTokens(text: string): number {
  if (!text || text.length === 0) return 0
  
  const charCount = text.length
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length
  
  // Different models have different tokenization patterns
  // GPT-4 and GPT-3.5 use cl100k_base encoding which is roughly:
  // - ~4 characters per token for English text
  // - ~0.75 words per token for English text
  
  const charBased = Math.ceil(charCount / 4)
  const wordBased = Math.ceil(wordCount / 0.75)
  
  // Average both methods for better accuracy
  const estimated = Math.ceil((charBased + wordBased) / 2)
  
  // Adjust for code (more tokens per character)
  const isCode = /[{}()\[\]<>,;:]/.test(text)
  if (isCode) {
    return Math.ceil(estimated * 1.3)
  }
  
  return estimated
}

export function truncateToTokens(text: string, maxTokens: number, model: string = 'gpt-4'): string {
  const estimatedChars = maxTokens * 4
  if (text.length <= estimatedChars) {
    return text
  }
  return text.slice(0, estimatedChars)
}
