import { motion } from 'framer-motion'
import { User, ThumbsUp, ThumbsDown } from 'lucide-react'

const AVATARS = ['👨‍💻', '👩‍💼', '👨‍🔬', '👩‍🎨', '👨‍🏫', '👩‍⚕️', '👨‍🚀', '👩‍🔧']

export default function PersonaVoting({ personas }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="glass-strong rounded-2xl p-8 mb-8"
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">
          <span className="gradient-text">AI Personas Voting</span>
        </h3>
        <p className="text-gray-400">
          Watch as {personas.length} diverse personas evaluate your content...
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map((persona, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: index * 0.05,
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
            className="glass rounded-xl p-4 hover:bg-white/10 transition-all"
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <motion.div
                initial={{ rotate: -180 }}
                animate={{ rotate: 0 }}
                transition={{ delay: index * 0.05 + 0.2 }}
                className="text-3xl"
              >
                {AVATARS[index % AVATARS.length]}
              </motion.div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm truncate">
                    Persona #{index + 1}
                  </span>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 + 0.3 }}
                  >
                    {Math.random() > 0.4 ? (
                      <ThumbsUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <ThumbsDown className="w-4 h-4 text-red-400" />
                    )}
                  </motion.div>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {persona.background || 'Analyzing content...'}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <motion.div
              className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{
                  delay: index * 0.05 + 0.1,
                  duration: 0.8,
                  ease: "easeOut"
                }}
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex items-center justify-center gap-2 text-gray-400"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full"
        />
        <span className="text-sm">Analyzing responses...</span>
      </motion.div>
    </motion.div>
  )
}
