import { motion, AnimatePresence } from 'framer-motion';
import { Home, Users, MessageSquare, Trophy, Loader2 } from 'lucide-react';
import ArgumentCard from './ArgumentCard';
import ThinkingIndicator from './ThinkingIndicator';
import DebateHeader from './DebateHeader';

export default function DebateArena({ 
  debate, 
  arguments: debateArguments, 
  thinking, 
  debateComplete,
  onVote, 
  onBackToHome,
  connected 
}) {
  if (!debate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-debate-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Initializing debate arena...</p>
        </div>
      </div>
    );
  }

  // Calculate vote totals
  const voteTotals = debateArguments.reduce((acc, arg) => {
    const side = arg.side || arg.model;
    acc[side] = (acc[side] || 0) + (arg.votes || 0);
    return acc;
  }, {});

  const modelATotal = voteTotals[debate.models?.modelA] || 0;
  const modelBTotal = voteTotals[debate.models?.modelB] || 0;
  const totalVotes = modelATotal + modelBTotal;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <DebateHeader 
        debate={debate}
        modelATotal={modelATotal}
        modelBTotal={modelBTotal}
        totalVotes={totalVotes}
        debateComplete={debateComplete}
        onBackToHome={onBackToHome}
      />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Debate Feed */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {debateArguments.map((argument, index) => (
              <ArgumentCard
                key={argument.id || index}
                argument={argument}
                debate={debate}
                onVote={onVote}
                index={index}
              />
            ))}
          </AnimatePresence>

          {/* Thinking Indicator */}
          {thinking && !debateComplete && (
            <ThinkingIndicator 
              model={thinking.model}
              side={thinking.side}
              debate={debate}
            />
          )}

          {/* Completion Message */}
          {debateComplete && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass rounded-2xl p-8 text-center"
            >
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Debate Complete!
              </h3>
              <p className="text-gray-400 mb-6">
                The final results are in. Review the arguments and cast your votes.
              </p>
              
              {/* Winner Announcement */}
              {totalVotes > 0 && (
                <div className="mt-6">
                  {modelATotal > modelBTotal ? (
                    <div className="text-debate-blue-400 text-xl font-semibold">
                      🏆 {debate.models.modelA.toUpperCase()} leads with {modelATotal} votes!
                    </div>
                  ) : modelBTotal > modelATotal ? (
                    <div className="text-debate-orange-400 text-xl font-semibold">
                      🏆 {debate.models.modelB.toUpperCase()} leads with {modelBTotal} votes!
                    </div>
                  ) : (
                    <div className="text-gray-400 text-xl font-semibold">
                      🤝 It's a tie! Both sides presented compelling arguments.
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={onBackToHome}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-debate-blue-600 to-debate-orange-600 hover:from-debate-blue-500 hover:to-debate-orange-500 text-white font-semibold rounded-xl transition-all"
              >
                Start New Debate
              </button>
            </motion.div>
          )}

          {/* Empty State */}
          {debateArguments.length === 0 && !thinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-2xl p-12 text-center"
            >
              <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                Waiting for the debate to begin...
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
