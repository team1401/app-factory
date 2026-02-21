import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Key, Check } from 'lucide-react'

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
]

const MODELS = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ],
  anthropic: [
    { value: 'claude-opus-4', label: 'Claude Opus 4' },
    { value: 'claude-sonnet-4', label: 'Claude Sonnet 4' },
    { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
  ],
}

export default function SettingsModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState({
    openaiKey: '',
    anthropicKey: '',
    provider: 'openai',
    model: 'gpt-4o',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    const stored = localStorage.getItem('paperplain-settings')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSettings({
          openaiKey: parsed.openaiKey || '',
          anthropicKey: parsed.anthropicKey || '',
          provider: parsed.provider || 'openai',
          model: parsed.model || 'gpt-4o',
        })
      } catch (e) {
        console.error('Failed to parse settings:', e)
      }
    }
  }, [isOpen])

  const handleSave = () => {
    const toSave = {
      openaiKey: settings.openaiKey,
      anthropicKey: settings.anthropicKey,
      provider: settings.provider,
      model: settings.model,
      apiKey: settings.provider === 'openai' ? settings.openaiKey : settings.anthropicKey,
    }
    localStorage.setItem('paperplain-settings', JSON.stringify(toSave))
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 1500)
  }

  const isProviderConfigured = (provider) => {
    if (provider === 'openai') return !!settings.openaiKey
    if (provider === 'anthropic') return !!settings.anthropicKey
    return false
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass w-full max-w-2xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <Key className="w-6 h-6 text-violet-400" />
              <h2 className="text-3xl font-bold gradient-text">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* API Keys section */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                API Keys
                <span className="text-sm text-slate-500 font-normal">(BYOK)</span>
              </h3>
              
              <div className="space-y-4">
                {/* OpenAI */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">
                      OpenAI API Key
                    </label>
                    <div className={`w-2 h-2 rounded-full ${
                      isProviderConfigured('openai') ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>
                  <input
                    type="password"
                    value={settings.openaiKey}
                    onChange={(e) => setSettings({ ...settings, openaiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>

                {/* Anthropic */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">
                      Anthropic API Key
                    </label>
                    <div className={`w-2 h-2 rounded-full ${
                      isProviderConfigured('anthropic') ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>
                  <input
                    type="password"
                    value={settings.anthropicKey}
                    onChange={(e) => setSettings({ ...settings, anthropicKey: e.target.value })}
                    placeholder="sk-ant-..."
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Provider selection */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                AI Provider
              </label>
              <div className="grid grid-cols-2 gap-3">
                {PROVIDERS.map((provider) => (
                  <button
                    key={provider.value}
                    onClick={() => {
                      setSettings({
                        ...settings,
                        provider: provider.value,
                        model: MODELS[provider.value][0].value,
                      })
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      settings.provider === provider.value
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-medium">{provider.label}</div>
                    <div className={`text-xs mt-1 ${
                      isProviderConfigured(provider.value)
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                      {isProviderConfigured(provider.value) ? '● Configured' : '● Not configured'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Model selection */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Model
              </label>
              <select
                value={settings.model}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                {MODELS[settings.provider].map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Info box */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-sm text-blue-300">
                💡 Your API keys are stored locally in your browser and sent directly to the providers. 
                They never touch our servers.
              </p>
            </div>

            {/* Save button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saved}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                saved
                  ? 'bg-green-600 hover:bg-green-600'
                  : 'bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-5 h-5" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
