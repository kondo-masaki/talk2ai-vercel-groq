# Talk2AI - Voice Chat with Groq

Voice-enabled conversational web application powered by Vercel AI SDK and Groq Cloud API.

## 🎮 Live Demo

**Try it now:** https://talk2ai-vercel-groq-pr05tf5tq-kondo-masakis-projects.vercel.app/

This is a sample application running on Groq's free tier API. Please note:
- 🆓 Using Groq Cloud free tier (rate limits apply)
- 📖 Open source under MIT License
- 🔄 May experience slower response times during peak usage
- ⚠️ Free tier has rate limits - check [Groq's rate limits page](https://console.groq.com/settings/limits) for current limits

## Features

- 🎤 Voice Input (Web Speech API / Groq Whisper)
- 💬 Real-time Chat with Streaming Responses
- 🚀 Fast Inference with Groq Cloud
- 📱 Responsive Design
- ⚙️ Model & Voice Engine Selection
- 🌍 Multi-language Support (8 languages)
- 📊 Real-time Transcription Progress Indicator
- 💾 Persistent Settings (localStorage)
- 🌐 Auto-detect Browser Language
- 🔍 Built-in Web Search (GPT OSS models only)

## Available Models

### LLM Models (10 Options)
1. **GPT OSS 20B** - OpenAI-compatible with **built-in browser search** & code execution
2. **GPT OSS 120B** - Flagship OpenAI-compatible model with reasoning & **built-in browser search**
3. **DeepSeek R1 70B** - Top reasoning model (94.5% MATH-500, beats o1 mini)
4. **Qwen3 32B** - Alibaba's powerful multilingual model
5. **Kimi K2** - Moonshot AI's instruction-following model
6. **Llama 3.3 70B** - Latest high-performance versatile model
7. **Llama 3.1 8B** - Fast lightweight model for quick responses
8. **Llama3 Tool Use** - Specialized for tool use and function calling
9. **Llama 4 Scout** - Next-gen Llama 4 preview (17B, 16 experts)
10. **Llama 4 Maverick** - Llama 4 preview with 128 experts

### Speech Recognition (4 Options)
1. **Web Speech API** - Built-in browser (Google speech recognition)
2. **Whisper Large v3 Turbo** - Fastest Whisper model, optimized for speed
3. **Whisper Large v3** - High accuracy speech recognition
4. **Distil-Whisper English** - Optimized for English, 6x faster

### Supported Languages
- 🇯🇵 Japanese (日本語)
- 🇺🇸 English
- 🇨🇳 Chinese (中文)
- 🇰🇷 Korean (한국어)
- 🇪🇸 Spanish (Español)
- 🇫🇷 French (Français)
- 🇩🇪 German (Deutsch)
- 🇻🇳 Vietnamese (Tiếng Việt)

## Tech Stack

- Next.js 15 (App Router)
- Vercel AI SDK
- Groq Cloud API
- TypeScript
- Tailwind CSS v3
- Web Speech API / MediaRecorder API

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local` file and add your Groq API key:

```bash
cp .env.local.example .env.local
```

Get your API key from [Groq Console](https://console.groq.com/keys) and update `.env.local`:

```
GROQ_API_KEY=your_actual_groq_api_key_here
```

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 2. Deploy on Vercel

1. Log in to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Set environment variables:
   - `GROQ_API_KEY`: Your Groq API key
5. Click "Deploy"

### 3. Custom Domain (Optional)

Configure custom domain in Vercel Dashboard under Settings > Domains.

## Usage

### Voice Input
- Click the microphone button 🎙️ to start voice input
- Speech is automatically transcribed to text
- Choose between Web Speech API or Groq Whisper in settings

### Text Input
- Type messages directly in the input field
- Press Enter or click Send to submit

### Settings
- Click the ⚙️ button to open settings
- Select LLM model (10 options available)
- Choose speech recognition engine (4 options)
- Select language for speech recognition
- Adjust temperature for creativity level
- Settings are automatically saved to localStorage

## Browser Compatibility

### Voice Recognition
- ✅ Google Chrome (recommended)
- ✅ Microsoft Edge
- ⚠️ Safari (limited support)
- ❌ Firefox (Web Speech API not supported, Whisper works)

### Language Auto-Detection
- Automatically detects browser language on first load
- Falls back to English if browser language not supported

### General Features
All modern browsers support text chat features.

## API Endpoints

- `/api/chat` - Main chat endpoint (supports model selection)
- `/api/whisper` - Groq Whisper transcription endpoint

## Project Structure

```
talk2ai-vercel-groq/
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # Groq LLM endpoint
│   │   └── whisper/route.ts   # Whisper ASR endpoint
│   ├── page.tsx               # Home page
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── components/
│   ├── Chat.tsx               # Main chat component
│   └── Settings.tsx           # Settings modal
├── hooks/
│   ├── useSpeechRecognition.ts # Web Speech API hook
│   └── useGroqWhisper.ts      # Groq Whisper hook
├── types/
│   └── models.ts              # Model definitions
└── .env.local                 # Environment variables
```

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript checks
```

## Troubleshooting

### Voice Recognition Not Working
1. Ensure HTTPS connection (or localhost)
2. Check microphone permissions in browser
3. Use Chrome or Edge for best compatibility

### API Errors
1. Verify Groq API key is correctly set
2. Check API rate limits
3. Ensure selected model is available

### Whisper Recording Issues
1. Grant microphone permissions
2. Check browser supports MediaRecorder API
3. Ensure audio file size < 25MB

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Your Groq Cloud API key | Yes |

## Web Search Feature

### Built-in Browser Search (No API Key Required)
- **Available Models**: GPT OSS 20B and GPT OSS 120B only
- **How to Enable**: 
  1. Select GPT OSS 20B or 120B model in settings
  2. Toggle "Enable Web Search" in settings
  3. Ask about current events or recent information
- **Cost**: Free during beta (included with Groq API)
- **Powered by**: Groq's internal browser search (Exa)

### Example Queries
- "What are today's AI news?"
- "今日の技術ニュースを教えて"
- "Latest developments in quantum computing"
- "Current stock market situation"

## Performance

- Groq Cloud provides ultra-fast inference
- Streaming responses for better UX
- Context windows up to 128k tokens (model dependent)
- Real-time transcription progress indicators
- Optimized for low-latency voice interactions

## Security

- API keys should never be committed to repository
- Use environment variables for sensitive data
- HTTPS required for voice features in production
- Settings stored locally in browser (no server persistence)
- No personal data collection or tracking

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## License

MIT - This is free and open source software. You can use, modify, and distribute it under the terms of the MIT License.

## Demo Application

The live demo at https://talk2ai-vercel-groq-pr05tf5tq-kondo-masakis-projects.vercel.app/ is provided as a sample implementation using Groq's free tier API. Feel free to fork this repository and deploy your own instance with your own API key for unrestricted usage.

## Links

- [Groq Cloud Console](https://console.groq.com)
- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## Acknowledgments

Built with Vercel AI SDK and powered by Groq's Lightning-Fast Inference.