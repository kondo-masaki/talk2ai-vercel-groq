// Model definitions available on Groq Cloud

export interface GroqModel {
  id: string
  name: string
  description: string
  contextWindow: number
  category: 'llm' | 'whisper'
}

// Groq LLM Models - Extended list with all available models
export const GROQ_LLM_MODELS: GroqModel[] = [
  // GPT OSS Models (Required)
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT OSS 20B',
    description: 'OpenAI-compatible 20B model (browser search & code execution)',
    contextWindow: 128000,
    category: 'llm'
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT OSS 120B',
    description: 'OpenAI-compatible 120B flagship model (reasoning & search)',
    contextWindow: 128000,
    category: 'llm'
  },
  // DeepSeek Models
  {
    id: 'deepseek-r1-distill-llama-70b',
    name: 'DeepSeek R1 70B',
    description: 'Top reasoning model (94.5% MATH-500, beats o1 mini)',
    contextWindow: 128000,
    category: 'llm'
  },
  // Qwen Models
  {
    id: 'qwen/qwen3-32b',
    name: 'Qwen3 32B',
    description: 'Alibaba\'s powerful multilingual model',
    contextWindow: 128000,
    category: 'llm'
  },
  // Kimi Model
  {
    id: 'moonshotai/kimi-k2-instruct',
    name: 'Kimi K2',
    description: 'Moonshot AI\'s instruction-following model',
    contextWindow: 128000,
    category: 'llm'
  },
  // Llama Models
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B',
    description: 'Latest high-performance model, highly versatile',
    contextWindow: 128000,
    category: 'llm'
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B',
    description: 'Fast lightweight model for quick responses',
    contextWindow: 128000,
    category: 'llm'
  },
  {
    id: 'llama3-groq-70b-8192-tool-use-preview',
    name: 'Llama3 Tool Use',
    description: 'Specialized for tool use and function calling',
    contextWindow: 8192,
    category: 'llm'
  },
  // Llama 4 Preview Models
  {
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout',
    description: 'Next-gen Llama 4 preview (17B, 16 experts)',
    contextWindow: 128000,
    category: 'llm'
  },
  {
    id: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    name: 'Llama 4 Maverick',
    description: 'Llama 4 preview with 128 experts',
    contextWindow: 128000,
    category: 'llm'
  }
]

// Speech Recognition Models
export const SPEECH_RECOGNITION_MODELS = [
  {
    id: 'web-speech-api',
    name: 'Web Speech API',
    description: 'Built-in browser (Google speech recognition)',
    provider: 'browser'
  },
  {
    id: 'whisper-large-v3-turbo',
    name: 'Whisper Large v3 Turbo',
    description: 'Fastest Whisper model, optimized for speed',
    provider: 'groq'
  },
  {
    id: 'whisper-large-v3',
    name: 'Whisper Large v3',
    description: 'High accuracy speech recognition',
    provider: 'groq'
  },
  {
    id: 'distil-whisper-large-v3-en',
    name: 'Distil-Whisper English',
    description: 'Optimized for English, 6x faster',
    provider: 'groq'
  }
]

export interface ChatSettings {
  llmModel: string
  speechRecognition: string
  temperature: number
  maxTokens: number
  language: string
}

export const LANGUAGES = [
  { code: 'ja-JP', name: '日本語', whisperCode: 'ja' },
  { code: 'en-US', name: 'English', whisperCode: 'en' },
  { code: 'zh-CN', name: '中文', whisperCode: 'zh' },
  { code: 'ko-KR', name: '한국어', whisperCode: 'ko' },
  { code: 'es-ES', name: 'Español', whisperCode: 'es' },
  { code: 'fr-FR', name: 'Français', whisperCode: 'fr' },
  { code: 'de-DE', name: 'Deutsch', whisperCode: 'de' },
  { code: 'vi-VN', name: 'Tiếng Việt', whisperCode: 'vi' },
]