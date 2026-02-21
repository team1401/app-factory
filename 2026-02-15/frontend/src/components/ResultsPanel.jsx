import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, MessageSquare, Lightbulb, BarChart3, Share2 } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export default function ResultsPanel({ results, content }) {
  const [displayScore, setDisplayScore] = useState(0)
  const viralityScore = results.viralityScore || 0

  // Animate score counter
  useEffect(() => {
    let start = 0
    const end = viralityScore
    const duration = 2000
    const increment = end / (duration / 16)

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayScore(end)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [viralityScore])

  const isViral = viralityScore >= 60
  const isGood = viralityScore >= 40
  const scoreColor = isViral ? 'text-green-400' : isGood ? 'text-yellow-400' : 'text-red-400'
  const scoreGradient = isViral
    ? 'from-green-500 to-emerald-500'
    : isGood
    ? 'from-yellow-500 to-orange-500'
    : 'from-red-500 to-pink-500'

  // Prepare chart data
  const chartData = [
    { name: 'Would Share', value: results.votingDistribution?.positive || 0, color: '#10b981' },
    { name: 'Neutral', value: results.votingDistribution?.neutral || 0, color: '#6b7280' },
    { name: 'Would Skip', value: results.votingDistribution?.negative || 0, color: '#ef4444' },
  ]

  const topReactions = results.topReactions || []
  const suggestions = results.suggestions || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="space-y-6"
    >
      {/* Score card */}
      <div className="glass-strong rounded-2xl p-8 overflow-hidden relative">
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${scoreGradient} opacity-5`}></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            {isViral ? (
              <TrendingUp className="w-8 h-8 text-green-400" />
            ) : (
              <TrendingDown className="w-8 h-8 text-gray-400" />
            )}
            <h3 className="text-2xl font-bold">Virality Analysis</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Score display */}
            <div className="flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative"
              >
                <div className={`text-8xl font-bold ${scoreColor} tabular-nums`}>
                  {displayScore}%
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className={`h-2 bg-gradient-to-r ${scoreGradient} rounded-full mt-4`}
                />
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-gray-400 mt-4 text-center"
              >
                {isViral
                  ? '🚀 This content is likely to go viral!'
                  : isGood
                  ? '📊 Moderate engagement potential'
                  : '💭 Needs improvement to gain traction'}
              </motion.p>
            </div>

            {/* Distribution chart */}
            <div className="flex flex-col items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="w-full"
              >
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {chartData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: entry.color }}
                      />
                      <span className="text-sm text-gray-400">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Top reactions */}
      {topReactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-strong rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold">Top Persona Reactions</h3>
          </div>

          <div className="space-y-4">
            {topReactions.slice(0, 6).map((reaction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="glass rounded-xl p-4 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">
                    {reaction.sentiment === 'positive' ? '👍' : reaction.sentiment === 'negative' ? '👎' : '🤔'}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      "{reaction.comment}"
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">
                        Interest: {reaction.interestLevel}/10
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="glass-strong rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold">Improvement Suggestions</h3>
          </div>

          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 + index * 0.1 }}
                className="flex items-start gap-3 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl"
              >
                <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-yellow-400 text-xs font-bold">{index + 1}</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed flex-1">
                  {suggestion}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Share button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="flex justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="glass-strong px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all group"
        >
          <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="font-semibold">Share Results</span>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
