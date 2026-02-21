import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import DebateArena from './components/DebateArena';
import { useDebateSocket } from './hooks/useDebateSocket';

function App() {
  const [view, setView] = useState('landing'); // 'landing' or 'debate'
  const debateSocket = useDebateSocket();

  const handleStartDebate = (topic, models) => {
    debateSocket.startDebate(topic, models);
    setView('debate');
  };

  const handleBackToHome = () => {
    setView('landing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      {/* Animated background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-debate-blue-600/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-debate-orange-600/10 to-transparent rounded-full blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingPage 
              onStartDebate={handleStartDebate}
              connected={debateSocket.connected}
            />
          </motion.div>
        ) : (
          <motion.div
            key="debate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DebateArena 
              debate={debateSocket.debate}
              arguments={debateSocket.arguments}
              thinking={debateSocket.thinking}
              debateComplete={debateSocket.debateComplete}
              onVote={debateSocket.vote}
              onBackToHome={handleBackToHome}
              connected={debateSocket.connected}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
