import { motion } from 'framer-motion';
import { Home, Wifi, WifiOff } from 'lucide-react';

export default function DebateHeader({ 
  debate, 
  modelATotal, 
  modelBTotal, 
  totalVotes,
  debateComplete,
  onBackToHome 
}) {
  const modelAPercent = totalVotes > 0 ? (modelATotal / totalVotes) * 100 : 50;
  const modelBPercent = totalVotes > 0 ? (modelBTotal / totalVotes) * 100 : 50;

  return (
    <div className="sticky top-0 z-50 glass border-b border-white/10 shadow-xl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Row */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {debate.topic}
            </h2>
            <p className="text-gray-400 text-sm">
              {debateComplete ? 'Debate complete' : 'Live debate in progress...'}
            </p>
          </div>
          
          <button
            onClick={onBackToHome}
            className="glass-hover p-3 rounded-xl flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">Home</span>
          </button>
        </div>

        {/* Model Comparison */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Model A */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-debate-blue-500/10 border border-debate-blue-500/30 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-debate-blue-400">SIDE A</span>
              <span className="text-2xl font-bold text-white">{modelATotal}</span>
            </div>
            <div className="text-sm text-gray-300 font-medium">
              {debate.models?.modelA?.toUpperCase() || 'Model A'}
            </div>
            {totalVotes > 0 && (
              <div className="mt-2 text-xs text-debate-blue-400 font-semibold">
                {modelAPercent.toFixed(1)}%
              </div>
            )}
          </motion.div>

          {/* Model B */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-debate-orange-500/10 border border-debate-orange-500/30 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-debate-orange-400">SIDE B</span>
              <span className="text-2xl font-bold text-white">{modelBTotal}</span>
            </div>
            <div className="text-sm text-gray-300 font-medium">
              {debate.models?.modelB?.toUpperCase() || 'Model B'}
            </div>
            {totalVotes > 0 && (
              <div className="mt-2 text-xs text-debate-orange-400 font-semibold">
                {modelBPercent.toFixed(1)}%
              </div>
            )}
          </motion.div>
        </div>

        {/* Progress Bar */}
        {totalVotes > 0 && (
          <div className="relative h-2 bg-dark-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '50%' }}
              animate={{ width: `${modelAPercent}%` }}
              transition={{ duration: 0.5 }}
              className="absolute left-0 top-0 h-full bg-debate-blue-500"
            />
            <motion.div
              initial={{ width: '50%' }}
              animate={{ width: `${modelBPercent}%` }}
              transition={{ duration: 0.5 }}
              className="absolute right-0 top-0 h-full bg-debate-orange-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}
