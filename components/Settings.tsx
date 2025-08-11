'use client'

import { GROQ_LLM_MODELS, SPEECH_RECOGNITION_MODELS } from '@/types/models'
import { useState, useEffect } from 'react'

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
  settings: {
    llmModel: string
    speechRecognition: string
    temperature: number
    enableWebSearch?: boolean
  }
  onSettingsChange: (settings: any) => void
}

export default function Settings({ isOpen, onClose, settings, onSettingsChange }: SettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleSave = () => {
    onSettingsChange(localSettings)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* LLM Model Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Chat Model
          </label>
          <select
            value={localSettings.llmModel}
            onChange={(e) => setLocalSettings({ ...localSettings, llmModel: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            {GROQ_LLM_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        {/* Speech Recognition Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Speech Recognition Engine
          </label>
          <select
            value={localSettings.speechRecognition}
            onChange={(e) => setLocalSettings({ ...localSettings, speechRecognition: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            {SPEECH_RECOGNITION_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        {/* Web Search Toggle */}
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localSettings.enableWebSearch || false}
              onChange={(e) => setLocalSettings({ ...localSettings, enableWebSearch: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm font-medium">
              Enable Web Search (for current information)
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Allows AI to search the web for up-to-date information.
            {localSettings.llmModel?.includes('gpt-oss') ? 
              ' (Available with GPT OSS models)' : 
              ' (Requires GPT OSS 20B or 120B model)'}
          </p>
        </div>

        {/* Temperature Setting */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Creativity Level (Temperature): {localSettings.temperature}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={localSettings.temperature}
            onChange={(e) => setLocalSettings({ ...localSettings, temperature: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Conservative</span>
            <span>Balanced</span>
            <span>Creative</span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>

        {/* Model Information */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          <p className="font-semibold mb-1">Selected Model Info:</p>
          {GROQ_LLM_MODELS.find(m => m.id === localSettings.llmModel) && (
            <p>
              Context Window: {
                GROQ_LLM_MODELS.find(m => m.id === localSettings.llmModel)?.contextWindow.toLocaleString()
              } tokens
            </p>
          )}
          {localSettings.speechRecognition === 'whisper-large-v3-turbo' && (
            <p className="mt-1">Whisper: High-precision speech recognition (25MB file size limit)</p>
          )}
        </div>
      </div>
    </div>
  )
}