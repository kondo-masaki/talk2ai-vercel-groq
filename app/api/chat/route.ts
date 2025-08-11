import { createGroq } from '@ai-sdk/groq'
import { streamText } from 'ai'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  const { messages, model = 'llama-3.3-70b-versatile', temperature = 0.7, enableWebSearch = false } = await req.json()

  // GPT OSS models have built-in browser search capabilities
  const hasBuiltInSearch = model.includes('gpt-oss')
  
  // If browser search is enabled for GPT OSS models, use direct Groq API
  if (hasBuiltInSearch && enableWebSearch) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You have access to browser search capabilities. When asked about current events, recent information, or anything requiring up-to-date data, use the browser search tool to provide accurate, current information.'
            },
            ...messages
          ],
          temperature,
          stream: true,
          tools: [
            {
              type: 'browser_search'
            }
          ],
          tool_choice: 'required'
        }),
      })

      if (!response.ok) {
        const errorData = {
          status: response.status,
          statusText: response.statusText,
          message: `Groq API error: ${response.statusText}`
        }
        throw errorData
      }

      // Convert Groq's SSE format to Vercel AI SDK's UI stream format
      const encoder = new TextEncoder()
      const decoder = new TextDecoder()
      
      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader()
          if (!reader) return
          
          let buffer = ''
          
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              
              buffer += decoder.decode(value, { stream: true })
              const lines = buffer.split('\n')
              buffer = lines.pop() || ''
              
              for (const line of lines) {
                if (line.trim() === '') continue
                if (line.trim() === 'data: [DONE]') {
                  controller.enqueue(encoder.encode('data: {"type":"finish"}\n\n'))
                  continue
                }
                
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6))
                    
                    // Extract content from Groq response and convert to UI stream format
                    if (data.choices?.[0]?.delta?.content) {
                      const content = data.choices[0].delta.content
                      const uiMessage = {
                        type: 'text-delta',
                        delta: content
                      }
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(uiMessage)}\n\n`))
                    }
                  } catch (e) {
                    console.error('Error parsing SSE data:', e)
                  }
                }
              }
            }
          } finally {
            controller.close()
          }
        }
      })
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
          'X-Vercel-AI-UI-Message-Stream': 'v1',
        },
      })
    } catch (error: any) {
      console.error('Error with direct Groq API:', error)
      
      // Check if it's a rate limit error (429 status code)
      if (error.status === 429 || error.message?.includes('429') || error.message?.includes('Too Many Requests') || error.message?.includes('rate_limit_exceeded')) {
        // Return error message to client
        const encoder = new TextEncoder()
        const stream = new ReadableStream({
          start(controller) {
            const errorMessage = {
              type: 'error',
              error: 'Rate limit exceeded. Please try again later or use a different model. The daily token limit has been reached for GPT OSS models.'
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`))
            controller.enqueue(encoder.encode('data: {"type":"finish"}\n\n'))
            controller.close()
          }
        })
        
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
            'X-Vercel-AI-UI-Message-Stream': 'v1',
          },
        })
      }
      
      // Fall back to regular handling without browser_search tool for other errors
      const groqOptions: any = {
        model: groq(model),
        messages,
        temperature,
        maxRetries: 3,
      }
      
      const result = streamText(groqOptions)
      return result.toUIMessageStreamResponse()
    }
  }
  
  // Regular handling for non-browser-search requests
  try {
    const groqOptions: any = {
      model: groq(model),
      messages,
      temperature,
      maxRetries: 3,
    }
    
    // Add note for non-GPT OSS models when web search is requested
    if (enableWebSearch && !hasBuiltInSearch) {
      const systemMessage = {
        role: 'system',
        content: 'Note: Web search is only available with GPT OSS 20B or GPT OSS 120B models. Current model does not support web search.'
      }
      
      if (!messages.some((m: any) => m.role === 'system')) {
        groqOptions.messages = [systemMessage, ...messages]
      }
    }

    const result = streamText(groqOptions)

    return result.toUIMessageStreamResponse()
  } catch (error: any) {
    console.error('Error in regular handling:', error)
    
    // Check if it's a rate limit error
    const isRateLimit = error.statusCode === 429 || 
                       error.status === 429 || 
                       error.message?.includes('rate_limit_exceeded') ||
                       error.message?.includes('429')
    
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const errorMessage = {
          type: 'error',
          error: isRateLimit 
            ? 'Rate limit exceeded. Please try again later or use a different model.'
            : 'An error occurred while processing your request. Please try again.'
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`))
        controller.enqueue(encoder.encode('data: {"type":"finish"}\n\n'))
        controller.close()
      }
    })
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'X-Vercel-AI-UI-Message-Stream': 'v1',
      },
    })
  }
}