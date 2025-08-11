import { createGroq } from '@ai-sdk/groq'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const model = formData.get('model') as string || 'whisper-large-v3-turbo'
    const language = formData.get('language') as string || 'ja'
    
    if (!audioFile) {
      return Response.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Send audio file to Groq API
    const groqFormData = new FormData()
    groqFormData.append('file', audioFile)
    groqFormData.append('model', model)
    groqFormData.append('language', language)
    groqFormData.append('response_format', 'json')

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: groqFormData,
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Groq Whisper API error:', error)
      return Response.json({ error: 'Transcription failed' }, { status: 500 })
    }

    const data = await response.json()
    return Response.json({ text: data.text })
    
  } catch (error) {
    console.error('Whisper API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}