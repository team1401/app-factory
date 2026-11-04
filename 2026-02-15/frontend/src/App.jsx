import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Sparkles, TrendingUp, Zap } from 'lucide-react'
import axios from 'axios'
import SettingsModal from './components/SettingsModal'
import PersonaVoting from './components/PersonaVoting'
import ResultsPanel from './components/ResultsPanel'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const AUDIENCES = [
  { value: 'hacker-news', label: 'Hacker News', description: 'Tech-savvy developers' },
  { value: 'product-hunt', label: 'Product Hunt', description: 'Early adopters, founders' },
  { value: 'reddit-technology', label: 'Reddit r/technology', description: 'Tech enthusiasts' },
  { value: 'twitter-tech', label: 'Twitter Tech', description: 'AI/crypto/startup crowd' },
  { value: 'linkedin-business', label: 'LinkedIn Business', description: 'Professionals, B2B' },
  { value: 'general-public', label: 'General Public', description: 'Diverse demographics' },
]

function App() {
  const [showSettings, setShowSettings] = useState(false)
  const [content, setContent] = useState('')
  const [audience, setAudience] = useState('hacker-news')
  const [isLoading, setIsLoading] = useState(false)
  const [personas, setPersonas] = useState([])
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  // Load example on mount
  useEffect(() => {
    const examples = [
      'We built an AI that predicts viral posts with 60% accuracy',
      'Show HN: I made a tool that tells you if your headline will go viral',
      'I analyzed 10,000 viral tweets and found this pattern',
      'This simple trick increased my post engagement by 300%',
    ]
    setContent(examples[Math.floor(Math.random() * examples.length)])
  }, [])

  const getApiHeaders = () => {
    const settings = JSON.parse(localStorage.getItem('viralcheck-settings') || '{}')
    const headers = {}
    
    if (settings.provider && settings.apiKey) {
      headers['X-AI-Provider'] = settings.provider
      headers['X-AI-API-Key'] = settings.apiKey
    } else if (settings.accessToken) {
      if (settings.provider) headers['X-AI-Provider'] = settings.provider
      headers['X-Access-Token'] = settings.accessToken
    }
    
    return headers
  }

  const handleTest = async () => {
    if (!content.trim()) {
      setError('Please enter some content to test')
      return
    }

    setIsLoading(true)
    setError(null)
    setResults(null)
    setPersonas([])

    try {
      // Step 1: Generate personas
      const personasResponse = await axios.post(
        `${API_BASE_URL}/api/generate-personas`,
        { audience },
        { headers: getApiHeaders() }
      )

      setPersonas(personasResponse.data.personas)

      // Step 2: Test content
      const testResponse = await axios.post(
        `${API_BASE_URL}/api/test-content`,
        {
          content,
          audience,
          personas: personasResponse.data.personas,
        },
        { headers: getApiHeaders() }
      )

      setResults(testResponse.data)
    } catch (err) {
      console.error('Test failed:', err)
      setError(err.response?.data?.error || err.message || 'Failed to test content')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-gray-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
        
        {/* Floating orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Settings button */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setShowSettings(true)}
        className="fixed top-6 right-6 z-50 glass p-3 rounded-xl hover:bg-white/10 transition-all group"
      >
        <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
      </motion.button>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-5xl md:text-6xl font-bold gradient-text">
              ViralCheck
            </h1>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Test your content against AI personas representing your target audience.
            Get instant virality predictions with{' '}
            <span className="text-purple-400 font-semibold">60% accuracy</span>.
          </p>
        </motion.div>

        {/* Input section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-strong rounded-2xl p-8 mb-8"
        >
          <div className="space-y-6">
            {/* Content input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your headline, tweet, or post title..."
                maxLength={2000}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none input-glow transition-all resize-none"
                rows={3}
              />
            </div>

            {/* Audience selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none input-glow transition-all cursor-pointer"
              >
                {AUDIENCES.map((aud) => (
                  <option key={aud.value} value={aud.value} className="bg-gray-900">
                    {aud.label} - {aud.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Test button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTest}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="w-5 h-5" />
                  </motion.div>
                  Testing Virality...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Test Virality
                </>
              )}
            </motion.button>

            {/* Error display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Persona voting animation */}
        <AnimatePresence>
          {isLoading && personas.length > 0 && (
            <PersonaVoting personas={personas} />
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <ResultsPanel results={results} content={content} />
          )}
        </AnimatePresence>
      </div>

      {/* Settings modal */}
      <AnimatePresence>
        {showSettings && (
          <SettingsModal onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
