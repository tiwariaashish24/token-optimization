import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export const createOpenAI = (apiKey: string) => {
  return new OpenAI({
    apiKey,
  })
}

export default openai
