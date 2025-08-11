import { useState, useCallback, useRef } from 'react'

interface GroqWhisperHook {
  isRecording: boolean
  isTranscribing: boolean
  transcript: string
  startRecording: (model?: string) => Promise<void>
  stopRecording: () => Promise<void>
  resetTranscript: () => void
  isSupported: boolean
}

export function useGroqWhisper(selectedModel?: string, language: string = 'ja'): GroqWhisperHook {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  
  // Check MediaRecorder API support
  const isSupported = typeof window !== 'undefined' && 
    'MediaRecorder' in window && 
    'mediaDevices' in navigator

  const startRecording = useCallback(async (model?: string) => {
    if (!isSupported) return
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })
      
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setIsTranscribing(true)
        await transcribeAudio(audioBlob, selectedModel)
        setIsTranscribing(false)
        
        // Stop the stream
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Recording error:', error)
      setIsRecording(false)
    }
  }, [isSupported, selectedModel, language])

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const transcribeAudio = async (audioBlob: Blob, model?: string) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      if (model && model !== 'web-speech-api') {
        formData.append('model', model)
      }
      // Convert language code to Whisper format (ja-JP -> ja)
      const whisperLang = language.split('-')[0]
      formData.append('language', whisperLang)
      
      const response = await fetch('/api/whisper', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Transcription failed')
      }
      
      const data = await response.json()
      setTranscript(data.text || '')
    } catch (error) {
      console.error('Transcription error:', error)
    }
  }

  const resetTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  return {
    isRecording,
    isTranscribing,
    transcript,
    startRecording,
    stopRecording,
    resetTranscript,
    isSupported
  }
}