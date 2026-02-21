import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Key, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react'

export default function SettingsModal({ isOpen, onClose }) {
  const [openaiKey, setOpenaiKey] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [braveKey, setBraveKey] = useState('')
  const [showKeys, setShowKeys] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Load saved keys
      setOpenaiKey(localStorage.getItem('openai_api_key') || '')
      setAnthropicKey(localStorage.getItem('anthropic_api_key') || '')
      setBraveKey(localStorage.getItem('brave_api_key') || '')
      setSaved(false)
    }
  }, [isOpen])

  const handleSave = () => {
    // Save to localStorage
    if (openaiKey) localStorage.setItem('openai_api_key', openaiKey)
    else localStorage.removeItem('openai_api_key')
    
    if (anthropicKey) localStorage.setItem('anthropic_api_key', anthropicKey)
    else localStorage.removeItem('anthropic_api_key')
    
    if (braveKey) localStorage.setItem('brave_api_key', braveKey)
    else localStorage.removeItem('brave_api_key')

    setSaved(true)
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  const handleClear = () => {
    setOpenaiKey('')
    setAnthropicKey('')
    setBraveKey('')
    localStorage.removeItem('openai_api_key')
    localStorage.removeItem('anthropic_api_key')
    localStorage.removeItem('brave_api_key')
  }

  if (!isOpen) return null

  const hasOpenAI = openaiKey.length > 0
  const hasAnthropic = anthropicKey.length > 0
  const hasBrave = braveKey.length > 0

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative glass-strong rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Key className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">API Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="glass p-2 rounded-xl hover:glass-strong transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-300 mb-8">
            Bring Your Own Keys (BYOK) - Your API keys are stored locally in your browser 
            and sent securely with each request. We never store them on our servers.
          </p>

          {/* Success Message */}
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 glass-strong border-green-500/30 rounded-2xl p-4 flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300">Settings saved successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* API Key Fields */}
          <div className="space-y-6">
            {/* OpenAI */}
            <div className="glass p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">OpenAI API Key</h3>
                  {hasOpenAI ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <span className="text-xs text-gray-400">GPT-4 / GPT-3.5</span>
              </div>
              <input
                type={showKeys ? 'text' : 'password'}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-2">
                Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">platform.openai.com</a>
              </p>
            </div>

            {/* Anthropic */}
            <div className="glass p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">Anthropic API Key</h3>
                  {hasAnthropic ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <span className="text-xs text-gray-400">Claude</span>
              </div>
              <input
                type={showKeys ? 'text' : 'password'}
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-2">
                Get your key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">console.anthropic.com</a>
              </p>
            </div>

            {/* Brave Search (Optional) */}
            <div className="glass p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">Brave Search API Key</h3>
                  {hasBrave ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-500" />
                  )}
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-lg">Optional</span>
                </div>
              </div>
              <input
                type={showKeys ? 'text' : 'password'}
                value={braveKey}
                onChange={(e) => setBraveKey(e.target.value)}
                placeholder="BSA..."
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-2">
                Get your key from <a href="https://brave.com/search/api/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">brave.com/search/api</a>. Falls back to web scraping if not provided.
              </p>
            </div>
          </div>

          {/* Show/Hide Toggle */}
          <button
            onClick={() => setShowKeys(!showKeys)}
            className="mt-6 flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showKeys ? 'Hide' : 'Show'} API Keys
          </button>

          {/* Actions */}
          <div className="flex gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all glow"
            >
              Save Settings
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClear}
              className="glass hover:glass-strong py-3 px-6 rounded-xl transition-all"
            >
              Clear All
            </motion.button>
          </div>

          {/* Privacy Note */}
          <div className="mt-6 p-4 glass rounded-xl">
            <p className="text-xs text-gray-400 text-center">
              🔒 Your API keys are stored only in your browser's localStorage and transmitted 
              securely via custom headers. They are never sent to or stored on our servers.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
