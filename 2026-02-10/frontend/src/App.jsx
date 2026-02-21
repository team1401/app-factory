import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Globe from './components/Globe';
import InfoPanel from './components/InfoPanel';
import Leaderboard from './components/Leaderboard';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function App() {
  const [sightLine, setSightLine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);

  // Fetch leaderboard on mount
  useEffect(() => {
    fetch(`${API_URL}/leaderboard`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLeaderboard(data.leaderboard);
        }
      })
      .catch(err => console.error('Failed to fetch leaderboard:', err));
  }, []);

  // Hide instructions after first click
  useEffect(() => {
    if (selectedPoint) {
      setShowInstructions(false);
    }
  }, [selectedPoint]);

  const handleGlobeClick = async (lat, lon) => {
    setSelectedPoint({ lat, lon });
    setLoading(true);
    setSightLine(null);

    try {
      const response = await fetch(`${API_URL}/sightline?lat=${lat}&lon=${lon}`);
      const data = await response.json();
      
      if (data.success) {
        setSightLine(data.data);
      } else {
        console.error('API error:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch sight line:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaderboardClick = (entry) => {
    setSelectedPoint(entry.from);
    setShowInstructions(false);
    setLoading(false);
    setSightLine({
      origin: { lat: entry.from.lat, lon: entry.from.lon, elevation: 0 },
      target: { lat: entry.to.lat, lon: entry.to.lon, elevation: 0 },
      distance: entry.distance,
      bearing: 0,
      originElevation: 0,
      targetElevation: 0
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Globe (full screen) */}
      <Globe 
        onPointClick={handleGlobeClick}
        sightLine={sightLine}
        selectedPoint={selectedPoint}
      />

      {/* Instructions (center, fades out after first click) */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            <div className="glass-panel" style={{ textAlign: 'center' }}>
              <h1 className="glow-text" style={{ fontSize: '2.5rem', marginBottom: '16px', fontWeight: 700 }}>
                ViewFinder
              </h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                Click anywhere on Earth to discover the longest line of sight
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading indicator (center) */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 20
            }}
          >
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
              <div className="spinner glow-text" style={{ fontSize: '2rem', marginBottom: '16px' }}>
                ⟳
              </div>
              <p style={{ color: 'var(--text-secondary)' }}>Calculating sight line...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Panel (bottom-left) */}
      <AnimatePresence>
        {sightLine && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'absolute',
              bottom: 32,
              left: 32,
              zIndex: 100,
              maxWidth: '400px'
            }}
          >
            <InfoPanel data={sightLine} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard (top-right) */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'absolute',
          top: 32,
          right: 32,
          zIndex: 100,
          maxWidth: '360px',
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto'
        }}
      >
        <Leaderboard 
          entries={leaderboard} 
          onEntryClick={handleLeaderboardClick}
        />
      </motion.div>

      {/* Footer credit */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          zIndex: 50,
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}
      >
        Inspired by{' '}
        <a 
          href="https://alltheviews.world" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glow-text"
          style={{ textDecoration: 'none' }}
        >
          All The Views
        </a>
      </motion.div>
    </div>
  );
}

export default App;
