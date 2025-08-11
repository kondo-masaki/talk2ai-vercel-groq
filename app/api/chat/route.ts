import { createGroq } from '@ai-sdk/groq'
import { streamText, tool } from 'ai'
import { z } from 'zod'
import { tavily } from '@tavily/core'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

// Initialize Tavily client if API key is available
const tavilyClient = process.env.TAVILY_API_KEY ? 
  tavily({ apiKey: process.env.TAVILY_API_KEY }) : null

export async function POST(req: Request) {
  const { messages, model = 'llama-3.3-70b-versatile', temperature = 0.7, enableWebSearch = false } = await req.json()

  // Define tools only if web search is enabled and Tavily is configured
  const tools = enableWebSearch && tavilyClient ? {
    searchWeb: tool({
      description: 'Search the web for current information. Use this when you need recent data, news, or information not in your training data.',
      parameters: z.object({
        query: z.string().describe('The search query'),
        maxResults: z.number().optional().default(5).describe('Maximum number of results'),
      }),
      execute: async ({ query, maxResults }) => {
        try {
          const response = await tavilyClient.search(query, {
            maxResults,
            includeAnswer: true,
            includeRawContent: false,
          })
          
          return {
            answer: response.answer,
            results: response.results.map(r => ({
              title: r.title,
              url: r.url,
              content: r.content,
              score: r.score,
            })),
          }
        } catch (error) {
          console.error('Tavily search error:', error)
          return { error: 'Search failed', query }
        }
      },
    }),
  } : undefined

  const result = streamText({
    model: groq(model),
    messages,
    temperature,
    maxRetries: 3,
    tools,
    toolChoice: tools ? 'auto' : undefined,
  })

  return result.toTextStreamResponse()
}