import { motion } from 'framer-motion'
import { ExternalLink, Calendar, MessageSquare, ThumbsUp, AlertTriangle, Flame } from 'lucide-react'

const sentimentConfig = {
  positive: {
    color: 'text-sentiment-positive',
    bg: 'bg-sentiment-positive/10',
    border: 'border-sentiment-positive/30',
    icon: ThumbsUp,
    label: 'Positive'
  },
  neutral: {
    color: 'text-sentiment-neutral',
    bg: 'bg-sentiment-neutral/10',
    border: 'border-sentiment-neutral/30',
    icon: MessageSquare,
    label: 'Neutral'
  },
  negative: {
    color: 'text-sentiment-negative',
    bg: 'bg-sentiment-negative/10',
    border: 'border-sentiment-negative/30',
    icon: AlertTriangle,
    label: 'Negative'
  },
  hostile: {
    color: 'text-sentiment-hostile',
    bg: 'bg-sentiment-hostile/10',
    border: 'border-sentiment-hostile/30',
    icon: Flame,
    label: 'Hostile'
  }
}

export default function ResultsDisplay({ mentions }) {
  if (!mentions || mentions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-12 text-center"
      >
        <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold mb-2">No Mentions Found</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Good news! We didn't find any AI agent mentions about you in our search. 
          Your digital reputation appears clean.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h3 className="text-2xl font-bold">
          Timeline <span className="text-gray-400">({mentions.length} mentions)</span>
        </h3>
      </motion.div>

      <div className="space-y-4">
        {mentions.map((mention, index) => {
          const sentiment = mention.sentiment?.toLowerCase() || 'neutral'
          const config = sentimentConfig[sentiment] || sentimentConfig.neutral
          const Icon = config.icon

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-strong rounded-2xl p-6 border ${config.border} hover:scale-[1.01] transition-transform`}
            >
              <div className="flex items-start gap-4">
                {/* Timeline indicator */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 ${config.bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${config.color}`} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1 line-clamp-2">
                        {mention.title || 'Untitled Mention'}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        {mention.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(mention.date).toLocaleDateString()}
                          </span>
                        )}
                        {mention.source && (
                          <span className="px-2 py-1 glass rounded-lg text-xs">
                            {mention.source}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sentiment badge */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 ${config.bg} rounded-xl border ${config.border}`}>
                      <div className={`w-2 h-2 ${config.color.replace('text-', 'bg-')} rounded-full animate-pulse`} />
                      <span className={`text-sm font-medium ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  {mention.summary && (
                    <p className="text-gray-300 mb-4 line-clamp-3">
                      {mention.summary}
                    </p>
                  )}

                  {/* Claims/Key Points */}
                  {mention.claims && mention.claims.length > 0 && (
                    <div className="mb-4 space-y-2">
                      <p className="text-sm font-medium text-gray-400">Key Claims:</p>
                      <ul className="space-y-1">
                        {mention.claims.slice(0, 3).map((claim, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-purple-400 mt-1">•</span>
                            <span>{claim}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    {mention.author && (
                      <span className="text-sm text-gray-400">
                        by <span className="text-gray-300">{mention.author}</span>
                      </span>
                    )}
                    {mention.url && (
                      <a
                        href={mention.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        View Source
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
