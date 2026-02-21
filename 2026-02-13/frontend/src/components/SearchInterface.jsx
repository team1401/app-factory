import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2, Github, Globe, Twitter, RotateCcw } from 'lucide-react'

export default function SearchInterface({ onSearch, loading, hasResults }) {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [sources, setSources] = useState({
    github: true,
    web: true,
    social: false
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() && !username.trim()) return
    
    const selectedSources = Object.entries(sources)
      .filter(([_, enabled]) => enabled)
      .map(([source]) => source)
    
    onSearch({
      name: name.trim(),
      username: username.trim(),
      sources: selectedSources
    })
  }

  const handleReset = () => {
    setName('')
    setUsername('')
    setSources({
      github: true,
      web: true,
      social: false
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: hasResults ? 0 : 0.6 }}
      className={`max-w-3xl mx-auto ${hasResults ? 'mb-8' : 'mb-16'}`}
    >
      <form onSubmit={handleSubmit} className="glass-strong rounded-3xl p-8 glow">
        {hasResults && (
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">New Search</h3>
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-gray-400 hover:text-gray-300 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., John Smith"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-purple-400 transition-colors placeholder:text-gray-500"
            />
          </div>

          {/* Username Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username / Handle <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., @johndoe or github.com/johndoe"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-purple-400 transition-colors placeholder:text-gray-500"
            />
          </div>

          {/* Source Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Search Sources
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { key: 'github', icon: Github, label: 'GitHub', desc: 'Issues, PRs, comments' },
                { key: 'web', icon: Globe, label: 'Web', desc: 'Blogs, articles, AI posts' },
                { key: 'social', icon: Twitter, label: 'Social', desc: 'Twitter, Moltbook', disabled: true }
              ].map(({ key, icon: Icon, label, desc, disabled }) => (
                <motion.button
                  key={key}
                  type="button"
                  onClick={() => !disabled && setSources(s => ({ ...s, [key]: !s[key] }))}
                  disabled={disabled}
                  whileHover={!disabled ? { scale: 1.02 } : {}}
                  whileTap={!disabled ? { scale: 0.98 } : {}}
                  className={`
                    relative p-4 rounded-xl text-left transition-all
                    ${sources[key] 
                      ? 'glass-strong border-purple-400/50 glow' 
                      : 'glass border-white/10'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${sources[key] ? 'text-purple-400' : 'text-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium mb-1 flex items-center gap-2">
                        {label}
                        {disabled && (
                          <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded">
                            Soon
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                    {sources[key] && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full"
                      />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading || (!name.trim() && !username.trim())}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all glow flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching AI Mentions...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search My Reputation
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}
