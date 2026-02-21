import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, ArrowRight, Wifi, WifiOff } from 'lucide-react';

const AVAILABLE_MODELS = [
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
  { id: 'claude-sonnet', name: 'Claude Sonnet', provider: 'Anthropic' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google' },
  { id: 'llama3', name: 'Llama 3', provider: 'Meta (Local)' },
];

const EXAMPLE_TOPICS = [
  "Should AI have rights?",
  "Is remote work better than office work?",
  "Can AI replace human creativity?",
  "Should social media be regulated?",
  "Is space exploration worth the cost?"
];

export default function LandingPage({ onStartDebate, connected }) {
  const [topic, setTopic] = useState('');
  const [selectedModels, setSelectedModels] = useState(['claude-sonnet', 'gpt-4']);

  const handleModelToggle = (modelId) => {
    if (selectedModels.includes(modelId)) {
      if (selectedModels.length > 1) {
        setSelectedModels(selectedModels.filter(id => id !== modelId));
      }
    } else {
      if (selectedModels.length < 2) {
        setSelectedModels([...selectedModels, modelId]);
      } else {
        setSelectedModels([selectedModels[1], modelId]);
      }
    }
  };

  const handleStart = () => {
    if (topic.trim() && selectedModels.length === 2) {
      onStartDebate(topic.trim(), {
        modelA: selectedModels[0],
        modelB: selectedModels[1]
      });
    }
  };

  const handleExampleClick = (exampleTopic) => {
    setTopic(exampleTopic);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-debate-blue-400" />
            <h1 className="text-5xl sm:text-6xl font-bold text-gradient">
              DebateArena
            </h1>
            <Zap className="w-8 h-8 text-debate-orange-400" />
          </div>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto">
            Watch AI models battle it out in real-time debates. 
            Choose your topic, pick your champions, and vote on the winner.
          </p>
          
          {/* Connection Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 flex items-center justify-center gap-2 text-sm"
          >
            {connected ? (
              <>
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-red-400">Connecting...</span>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl"
        >
          {/* Topic Input */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Debate Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleStart()}
              placeholder="Enter a topic for AI models to debate..."
              className="w-full px-4 py-4 bg-dark-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-debate-blue-500 focus:ring-2 focus:ring-debate-blue-500/20 transition-all"
            />
            
            {/* Example Topics */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs text-gray-500 mr-2">Try:</span>
              {EXAMPLE_TOPICS.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(example)}
                  className="text-xs px-3 py-1.5 bg-dark-800/30 hover:bg-dark-700/50 border border-gray-700/50 hover:border-gray-600 rounded-lg text-gray-400 hover:text-gray-300 transition-all"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Choose Your Champions (Select 2)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_MODELS.map((model, idx) => {
                const isSelected = selectedModels.includes(model.id);
                const position = selectedModels.indexOf(model.id);
                
                return (
                  <motion.button
                    key={model.id}
                    onClick={() => handleModelToggle(model.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? position === 0
                          ? 'bg-debate-blue-500/10 border-debate-blue-500 glow-blue'
                          : 'bg-debate-orange-500/10 border-debate-orange-500 glow-orange'
                        : 'bg-dark-800/30 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="font-semibold text-white">{model.name}</div>
                        <div className="text-xs text-gray-400">{model.provider}</div>
                      </div>
                      {isSelected && (
                        <div className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          position === 0
                            ? 'bg-debate-blue-500 text-white'
                            : 'bg-debate-orange-500 text-white'
                        }`}>
                          Side {position === 0 ? 'A' : 'B'}
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Start Button */}
          <motion.button
            onClick={handleStart}
            disabled={!topic.trim() || selectedModels.length !== 2 || !connected}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
              topic.trim() && selectedModels.length === 2 && connected
                ? 'bg-gradient-to-r from-debate-blue-600 to-debate-orange-600 hover:from-debate-blue-500 hover:to-debate-orange-500 text-white shadow-lg hover:shadow-xl'
                : 'bg-dark-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            Begin Debate
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          Powered by cutting-edge AI models • Real-time WebSocket streaming
        </motion.div>
      </div>
    </div>
  );
}
