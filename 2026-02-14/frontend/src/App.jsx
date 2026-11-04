import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Settings from './components/Settings';
import InputCard from './components/InputCard';
import LoadingState from './components/LoadingState';
import ResultsCard from './components/ResultsCard';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleExplain = async (input) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Get BYOK settings from localStorage
      const settings = JSON.parse(localStorage.getItem('paperplain_settings') || '{}');
      const provider = settings.provider || 'openai';
      const apiKey = settings[`${provider}_api_key`];

      const headers = {
        'Content-Type': 'application/json'
      };

      headers['X-AI-Provider'] = provider;
      if (apiKey) {
        headers['X-AI-API-Key'] = apiKey;
      } else if (settings.access_token) {
        headers['Authorization'] = `Bearer ${settings.access_token}`;
      }

      const response = await fetch('/api/explain', {
        method: 'POST',
        headers,
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to explain paper');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse delay-700" />
      </div>

      {/* Settings button */}
      <button
        onClick={() => setShowSettings(true)}
        className="absolute top-6 right-6 z-10 p-3 bg-white/10 backdrop-blur-md rounded-lg hover:bg-white/20 transition-all"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            PaperPlain
          </h1>
          <p className="text-xl text-white/80">
            Understand research papers in seconds with AI
          </p>
        </motion.div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto">
          {!results && !loading && (
            <InputCard onSubmit={handleExplain} />
          )}

          {loading && <LoadingState />}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-2xl p-6 text-center"
            >
              <p className="text-red-200">{error}</p>
              <button
                onClick={() => { setError(null); setResults(null); }}
                className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {results && (
            <ResultsCard 
              results={results} 
              onReset={() => setResults(null)}
            />
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <Settings onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
