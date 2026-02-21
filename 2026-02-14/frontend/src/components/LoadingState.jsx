import { motion } from 'framer-motion';

export default function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12"
    >
      <div className="text-center">
        {/* Animated gradient spinner */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-spin">
          <div className="w-14 h-14 m-1 bg-purple-900 rounded-full" />
        </div>

        <h3 className="text-2xl font-bold mb-2">Analyzing paper...</h3>
        <p className="text-white/60">
          AI is reading through the research and breaking it down for you
        </p>

        {/* Loading bars */}
        <div className="mt-8 space-y-3">
          {['Extracting key findings', 'Understanding methodology', 'Generating insights'].map((text, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                />
              </div>
              <span className="text-xs text-white/40 w-48 text-left">{text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
