import { createGroq } from '@ai-sdk/groq'
import { streamText } from 'ai'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  const { messages, model = 'llama-3.3-70b-versatile', temperature = 0.7 } = await req.json()

  const result = streamText({
    model: groq(model),
    messages,
    temperature,
    maxRetries: 3,
  })

  return result.toTextStreamResponse()
}