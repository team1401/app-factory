import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Leaderboard({ entries, onEntryClick }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div className="glass-panel" style={{ position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>
          🏆 Top 10 Longest
        </h3>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '1rem'
          }}
        >
          {collapsed ? '▼' : '▲'}
        </motion.button>
      </div>

      {/* List */}
      <motion.div
        animate={{ height: collapsed ? 0 : 'auto', opacity: collapsed ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        style={{ overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {entries.map((entry, index) => (
            <motion.button
              key={entry.rank}
              onClick={() => onEntryClick(entry)}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Rank badge */}
                <div 
                  className={entry.rank <= 3 ? 'glow-text' : ''}
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    minWidth: '32px',
                    textAlign: 'center',
                    color: entry.rank <= 3 ? 'var(--electric-blue)' : 'var(--text-secondary)'
                  }}
                >
                  {entry.rank}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '4px' }}>
                    {entry.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {entry.country}
                  </div>
                </div>

                {/* Distance */}
                <div style={{ textAlign: 'right' }}>
                  <div className="mono glow-text" style={{ fontSize: '1rem', fontWeight: 600 }}>
                    {entry.distance}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    km
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
