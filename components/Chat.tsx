'use client'

import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useGroqWhisper } from '@/hooks/useGroqWhisper'
import { useEffect, useRef, useState } from 'react'
import Settings from './Settings'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const SETTINGS_STORAGE_KEY = 'talk2ai-settings'

// Detect browser language
const getBrowserLanguage = () => {
  const lang = navigator.language || 'en-US'
  // Map common browser languages to our supported formats
  const langMap: { [key: string]: string } = {
    'ja': 'ja-JP',
    'ja-JP': 'ja-JP',
    'en': 'en-US',
    'en-US': 'en-US',
    'en-GB': 'en-US',
    'zh': 'zh-CN',
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-CN',
    'ko': 'ko-KR',
    'ko-KR': 'ko-KR',
    'es': 'es-ES',
    'es-ES': 'es-ES',
    'fr': 'fr-FR',
    'fr-FR': 'fr-FR',
    'de': 'de-DE',
    'de-DE': 'de-DE',
    'vi': 'vi-VN',
    'vi-VN': 'vi-VN',
  }
  
  // Check if we support this language
  for (const [key, value] of Object.entries(langMap)) {
    if (lang.startsWith(key)) {
      return value
    }
  }
  
  // Default to English if not supported
  return 'en-US'
}

const DEFAULT_SETTINGS = {
  llmModel: 'llama-3.3-70b-versatile',
  speechRecognition: 'web-speech-api',
  temperature: 0.7,
  language: typeof window !== 'undefined' ? getBrowserLanguage() : 'en-US'
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  // Settings state
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  
  // Web Speech API
  const webSpeech = useSpeechRecognition(settings.language)
  
  // Groq Whisper  
  const groqWhisper = useGroqWhisper(settings.speechRecognition, settings.language)
  
  // Select current speech recognition system
  const currentSpeechSystem = settings.speechRecognition === 'web-speech-api' ? webSpeech : groqWhisper
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  
  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY)
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          setSettings({ ...DEFAULT_SETTINGS, ...parsed })
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
    loadSettings()
  }, [])
  
  // Save settings to localStorage when changed
  const handleSettingsChange = (newSettings: typeof settings) => {
    setSettings(newSettings)
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }
  
  // Reflect speech recognition text to input field
  useEffect(() => {
    const transcript = settings.speechRecognition === 'web-speech-api' 
      ? webSpeech.transcript 
      : groqWhisper.transcript
      
    if (transcript) {
      setInput(transcript)
    }
  }, [webSpeech.transcript, groqWhisper.transcript, settings.speechRecognition])
  
  // Auto scroll to bottom of message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim()) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          model: settings.llmModel,
          temperature: settings.temperature
        }),
      })
      
      if (!response.ok) {
        throw new Error('API request failed')
      }
      
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''
      const assistantId = (Date.now() + 1).toString()
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          assistantMessage += chunk
          
          setMessages(prev => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            
            if (lastMessage && lastMessage.id === assistantId) {
              lastMessage.content = assistantMessage
            } else {
              newMessages.push({
                id: assistantId,
                role: 'assistant',
                content: assistantMessage
              })
            }
            
            return newMessages
          })
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'An error occurred. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleVoiceSubmit = () => {
    const transcript = settings.speechRecognition === 'web-speech-api' 
      ? webSpeech.transcript 
      : groqWhisper.transcript
      
    if (transcript) {
      const event = new Event('submit') as any
      event.preventDefault = () => {}
      handleSubmit(event)
      
      if (settings.speechRecognition === 'web-speech-api') {
        webSpeech.resetTranscript()
      } else {
        groqWhisper.resetTranscript()
      }
    }
  }
  
  const toggleListening = async () => {
    if (settings.speechRecognition === 'web-speech-api') {
      if (webSpeech.isListening) {
        webSpeech.stopListening()
        if (webSpeech.transcript) {
          handleVoiceSubmit()
        }
      } else {
        webSpeech.resetTranscript()
        webSpeech.startListening()
      }
    } else {
      // Groq Whisper
      if (groqWhisper.isRecording) {
        await groqWhisper.stopRecording()
        // For Whisper, transcript is automatically set on stopRecording
        setTimeout(() => {
          if (groqWhisper.transcript) {
            handleVoiceSubmit()
          }
        }, 500)
      } else {
        groqWhisper.resetTranscript()
        await groqWhisper.startRecording(settings.speechRecognition)
      }
    }
  }
  
  const isListeningOrRecording = settings.speechRecognition === 'web-speech-api' 
    ? webSpeech.isListening 
    : groqWhisper.isRecording

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Talk2AI - Advanced Voice Chat</h1>
            <p className="text-sm mt-1 opacity-90">
              Model: {settings.llmModel.split('-')[0].toUpperCase()} | 
              Voice: {settings.speechRecognition === 'web-speech-api' ? 'Web Speech' : 'Whisper'}
            </p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p className="text-lg mb-2">To start a conversation:</p>
            <p>1. Click the microphone button for voice input</p>
            <p>2. Or type a message and send</p>
            <p className="mt-4 text-sm">⚙️ Change model and speech recognition in settings</p>
          </div>
        )}
        
        {messages.map((message: Message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl p-4 rounded-lg shadow ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} ref={formRef} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              groqWhisper.isTranscribing ? "Transcribing..." :
              isListeningOrRecording ? 
                (settings.speechRecognition === 'web-speech-api' ? "Listening..." : "Recording...") 
                : "Type a message..."
            }
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || groqWhisper.isTranscribing}
          />
          
          {currentSpeechSystem.isSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-lg transition-all ${
                isListeningOrRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-gray-600 hover:bg-gray-700'
              } text-white`}
              title={isListeningOrRecording ? 
                (settings.speechRecognition === 'web-speech-api' ? 'Stop voice input' : 'Stop recording') 
                : (settings.speechRecognition === 'web-speech-api' ? 'Start voice input' : 'Start recording')}
            >
              {isListeningOrRecording ? '🔴' : '🎙️'}
            </button>
          )}
          
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
        
        {groqWhisper.isTranscribing && (
          <div className="mt-2 flex items-center justify-center text-sm text-gray-600">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="ml-2">Transcribing audio...</span>
          </div>
        )}
        
        {!currentSpeechSystem.isSupported && (
          <p className="text-sm text-red-500 mt-2 text-center">
            {settings.speechRecognition === 'web-speech-api' 
              ? 'This browser does not support speech recognition. Please use Chrome or Edge.'
              : 'Microphone access not granted.'}
          </p>
        )}
      </div>
      
      {/* Settings Modal */}
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  )
}