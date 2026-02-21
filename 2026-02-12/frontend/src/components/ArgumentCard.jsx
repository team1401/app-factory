import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

export default function ArgumentCard({ argument, debate, onVote, index }) {
  const isModelA = argument.model === debate.models?.modelA || argument.side === 'A';
  const sideColor = isModelA ? 'debate-blue' : 'debate-orange';
  const votes = argument.votes || 0;

  const handleVote = (voteType) => {
    onVote(argument.id, voteType);
  };

  return (
    <motion.div
      initial={{ y: 30, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.4,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      className={`glass rounded-2xl p-6 border-l-4 ${
        isModelA ? 'border-debate-blue-500' : 'border-debate-orange-500'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-${sideColor}-500/20 border-2 border-${sideColor}-500 flex items-center justify-center`}>
            <MessageSquare className={`w-5 h-5 text-${sideColor}-400`} />
          </div>
          <div>
            <div className="font-semibold text-white">
              {argument.model?.toUpperCase() || `Side ${argument.side}`}
            </div>
            <div className="text-xs text-gray-500">
              Round {argument.round || Math.floor(index / 2) + 1}
            </div>
          </div>
        </div>

        {/* Vote Count */}
        <motion.div
          key={votes}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className={`px-4 py-2 rounded-xl bg-${sideColor}-500/10 border border-${sideColor}-500/30`}
        >
          <div className="text-sm font-bold text-white">{votes}</div>
          <div className="text-xs text-gray-400">votes</div>
        </motion.div>
      </div>

      {/* Argument Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-4 text-gray-300 leading-relaxed"
      >
        {argument.text || argument.content}
      </motion.div>

      {/* Vote Buttons */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleVote('up')}
          className="flex-1 py-2.5 px-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 rounded-xl flex items-center justify-center gap-2 text-green-400 hover:text-green-300 transition-all"
        >
          <ThumbsUp className="w-4 h-4" />
          <span className="font-semibold text-sm">Agree</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleVote('down')}
          className="flex-1 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-xl flex items-center justify-center gap-2 text-red-400 hover:text-red-300 transition-all"
        >
          <ThumbsDown className="w-4 h-4" />
          <span className="font-semibold text-sm">Disagree</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
