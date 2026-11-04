import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Key, Check, AlertCircle } from 'lucide-react'

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI', color: 'text-emerald-400' },
  { value: 'anthropic', label: 'Anthropic', color: 'text-orange-400' },
]

export default function SettingsModal({ onClose }) {
  const [settings, setSettings] = useState({
    provider: 'openai',
    apiKey: '',
    accessToken: '',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('viralcheck-settings')
    if (stored) {
      setSettings({ provider: 'openai', apiKey: '', accessToken: '', ...JSON.parse(stored) })
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('viralcheck-settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 1000)
  }

  const handleClear = () => {
    setSettings({ provider: 'openai', apiKey: '', accessToken: '' })
    localStorage.removeItem('viralcheck-settings')
  }

  const hasKey = settings.apiKey.length > 0
  const hasAccessToken = settings.accessToken.length > 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-2xl p-8 max-w-lg w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Key className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">BYOK Settings</h2>
              <p className="text-sm text-gray-400">Bring Your Own Key</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info banner */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-1">An API key or access token is required</p>
            <p className="text-blue-400/80">
              Keys are stored locally and sent via headers. To use the server's keys
              instead, enter the access token provided by the operator.
            </p>
          </div>
        </div>

        {/* Provider selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            AI Provider
          </label>
          <div className="grid grid-cols-2 gap-3">
            {PROVIDERS.map((provider) => (
              <button
                key={provider.value}
                onClick={() => setSettings({ ...settings, provider: provider.value })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  settings.provider === provider.value
                    ? 'bg-white/10 border-purple-500'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${provider.color}`}>
                    {provider.label}
                  </span>
                  {settings.provider === provider.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-3 h-3" />
                    </motion.div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* API key input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            API Key
          </label>
          <div className="relative">
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              placeholder={`sk-${settings.provider === 'openai' ? 'proj-...' : 'ant-...'}`}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none input-glow transition-all pr-10"
            />
            {hasKey && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>

        {/* Access token input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Server Access Token (optional)
          </label>
          <input
            type="password"
            value={settings.accessToken}
            onChange={(e) => setSettings({ ...settings, accessToken: e.target.value })}
            placeholder="Use the server's API keys"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none input-glow transition-all"
          />
        </div>

        {/* Status indicator */}
        <div className="mb-6 p-4 bg-white/5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Status</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${hasKey || hasAccessToken ? 'bg-green-500' : 'bg-gray-600'}`}></div>
              <span className={`text-sm font-medium ${hasKey || hasAccessToken ? 'text-green-400' : 'text-gray-500'}`}>
                {hasKey ? 'Key configured' : hasAccessToken ? 'Using server key' : 'No key configured'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClear}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-xl transition-all"
          >
            Clear
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <Check className="w-5 h-5" />
                Saved!
              </>
            ) : (
              'Save Settings'
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
