import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Settings({ onClose }) {
  const [settings, setSettings] = useState({
    provider: 'openai',
    openai_api_key: '',
    anthropic_api_key: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('paperplain_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('paperplain_settings', JSON.stringify(settings));
    onClose();
  };

  const hasOpenAI = settings.openai_api_key?.length > 0;
  const hasAnthropic = settings.anthropic_api_key?.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-6">Settings</h2>

        <div className="space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">AI Provider</label>
            <div className="flex gap-3">
              <button
                onClick={() => setSettings({ ...settings, provider: 'openai' })}
                className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                  settings.provider === 'openai'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                OpenAI
              </button>
              <button
                onClick={() => setSettings({ ...settings, provider: 'anthropic' })}
                className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                  settings.provider === 'anthropic'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Anthropic
              </button>
            </div>
          </div>

          {/* OpenAI API Key */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium">OpenAI API Key</label>
              <div className={`w-2 h-2 rounded-full ${hasOpenAI ? 'bg-green-400' : 'bg-red-400'}`} />
            </div>
            <input
              type="password"
              value={settings.openai_api_key}
              onChange={(e) => setSettings({ ...settings, openai_api_key: e.target.value })}
              placeholder="sk-..."
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Anthropic API Key */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium">Anthropic API Key</label>
              <div className={`w-2 h-2 rounded-full ${hasAnthropic ? 'bg-green-400' : 'bg-red-400'}`} />
            </div>
            <input
              type="password"
              value={settings.anthropic_api_key}
              onChange={(e) => setSettings({ ...settings, anthropic_api_key: e.target.value })}
              placeholder="sk-ant-..."
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-all"
          >
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
