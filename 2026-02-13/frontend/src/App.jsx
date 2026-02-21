import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Search, AlertTriangle, TrendingUp, Shield } from 'lucide-react'
import SettingsModal from './components/SettingsModal'
import SearchInterface from './components/SearchInterface'
import ResultsDisplay from './components/ResultsDisplay'
import RiskScore from './components/RiskScore'

function App() {
  const [showSettings, setShowSettings] = useState(false)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (searchParams) => {
    setLoading(true)
    setError(null)
    
    try {
      // Get API keys from localStorage
      const openaiKey = localStorage.getItem('openai_api_key')
      const anthropicKey = localStorage.getItem('anthropic_api_key')
      const braveKey = localStorage.getItem('brave_api_key')
      
      const headers = {
        'Content-Type': 'application/json',
      }
      
      // Add BYOK headers if keys exist
      if (openaiKey) {
        headers['X-OpenAI-Key'] = openaiKey
      }
      if (anthropicKey) {
        headers['X-Anthropic-Key'] = anthropicKey
      }
      if (braveKey) {
        headers['X-Brave-Key'] = braveKey
      }
      
      const response = await fetch('/api/search', {
        method: 'POST',
        headers,
        body: JSON.stringify(searchParams)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Search failed')
      }
      
      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err.message)
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Shield className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Agent Rep Check
              </h1>
              <p className="text-sm text-gray-400">Monitor your AI reputation</p>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(true)}
            className="glass p-3 rounded-xl hover:glass-strong transition-all glow-hover"
          >
            <Settings className="w-6 h-6 text-purple-300" />
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          {!results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-12"
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                What Are AI Agents<br />Saying About You?
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                Autonomous AI agents are creating content online. Monitor your reputation 
                and discover what they're saying before it affects your career.
              </p>
              
              {/* Feature highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                {[
                  { icon: Search, title: 'Multi-Source Search', desc: 'GitHub, blogs, social media' },
                  { icon: AlertTriangle, title: 'Sentiment Analysis', desc: 'AI-powered reputation scoring' },
                  { icon: TrendingUp, title: 'Timeline View', desc: 'Track mentions over time' }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="glass p-6 rounded-2xl"
                  >
                    <feature.icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-400">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Search Interface */}
          <SearchInterface 
            onSearch={handleSearch} 
            loading={loading}
            hasResults={!!results}
          />

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-strong border-red-500/30 rounded-2xl p-6 mb-8 max-w-3xl mx-auto"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-300 mb-2">Search Error</h3>
                    <p className="text-gray-300">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Display */}
          <AnimatePresence mode="wait">
            {results && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Risk Score */}
                <RiskScore 
                  score={results.riskScore || 0} 
                  totalMentions={results.mentions?.length || 0}
                />

                {/* Timeline */}
                <ResultsDisplay mentions={results.mentions || []} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-gray-400 text-sm">
        <p>Inspired by <a href="https://theshamblog.com/an-ai-agent-published-a-hit-piece-on-me/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">the #1 HN story</a> about autonomous AI reputation attacks</p>
      </footer>
    </div>
  )
}

export default App
