import { motion } from 'framer-motion';
import { Brain, Loader2 } from 'lucide-react';

export default function ThinkingIndicator({ model, side, debate }) {
  const isModelA = model === debate.models?.modelA || side === 'A';
  const sideColor = isModelA ? 'debate-blue' : 'debate-orange';

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className={`glass rounded-2xl p-6 border-l-4 ${
        isModelA ? 'border-debate-blue-500' : 'border-debate-orange-500'
      }`}
    >
      <div className="flex items-center gap-4">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`w-12 h-12 rounded-full bg-${sideColor}-500/20 border-2 border-${sideColor}-500 flex items-center justify-center`}
        >
          <Brain className={`w-6 h-6 text-${sideColor}-400`} />
        </motion.div>

        <div className="flex-1">
          <div className="font-semibold text-white mb-1">
            {model?.toUpperCase() || `Side ${side}`}
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Crafting argument</span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ...
            </motion.span>
          </div>
        </div>

        {/* Animated dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className={`w-2 h-2 rounded-full bg-${sideColor}-400`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
