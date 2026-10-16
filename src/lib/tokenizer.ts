import { Tiktoken, get_encoding } from 'tiktoken'

export function countTokens(text: string, model: string = 'gpt-4'): number {
  try {
    const encoding = getEncoding('cl100k_base')
    const tokens = encoding.encode(text)
    encoding.free()
    return tokens.length
  } catch (error) {
    console.error('Error counting tokens:', error)
    return 0
  }
}

export function countTokensByModel(text: string, model: string): number {
  const encodingMap: Record<string, string> = {
    'gpt-4': 'cl100k_base',
    'gpt-4-32k': 'cl100k_base',
    'gpt-3.5-turbo': 'cl100k_base',
    'gpt-3.5-turbo-16k': 'cl100k_base',
    'text-davinci-003': 'p50k_base',
    'text-davinci-002': 'p50k_base',
    'code-davinci-002': 'p50k_base',
  }

  const encodingName = encodingMap[model] || 'cl100k_base'
  const encoding = get_encoding(encodingName)
  const tokens = encoding.encode(text)
  encoding.free()
  return tokens.length
}

export function truncateToTokens(text: string, maxTokens: number, model: string = 'gpt-4'): string {
  const encoding = get_encoding('cl100k_base')
  const tokens = encoding.encode(text)
  
  if (tokens.length <= maxTokens) {
    encoding.free()
    return text
  }

  const truncatedTokens = tokens.slice(0, maxTokens)
  const truncatedText = new TextDecoder().decode(encoding.decode(truncatedTokens))
  encoding.free()
  
  return truncatedText
}
