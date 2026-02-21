import { motion } from 'framer-motion';

export default function InfoPanel({ data }) {
  const formatCoord = (coord, isLat) => {
    const abs = Math.abs(coord);
    const direction = isLat 
      ? (coord >= 0 ? 'N' : 'S')
      : (coord >= 0 ? 'E' : 'W');
    return `${abs.toFixed(3)}° ${direction}`;
  };

  return (
    <div className="glass-panel">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="glow-text" style={{ fontSize: '1.5rem', marginBottom: '16px', fontWeight: 600 }}>
          Longest Line of Sight
        </h2>

        {/* Distance - Big and bold */}
        <div style={{ marginBottom: '24px' }}>
          <div className="glow-text" style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1 }}>
            {data.distance.toFixed(1)}
            <span style={{ fontSize: '1.5rem', marginLeft: '8px', opacity: 0.7 }}>km</span>
          </div>
          <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
            {(data.distance * 0.621371).toFixed(1)} miles
          </div>
        </div>

        {/* Origin */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>
            FROM
          </div>
          <div className="mono" style={{ fontSize: '0.9rem' }}>
            {formatCoord(data.origin.lat, true)}, {formatCoord(data.origin.lon, false)}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
            Elevation: {Math.round(data.originElevation)}m
          </div>
        </div>

        {/* Target */}
        {data.target && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>
              TO
            </div>
            <div className="mono" style={{ fontSize: '0.9rem' }}>
              {formatCoord(data.target.lat, true)}, {formatCoord(data.target.lon, false)}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
              Elevation: {Math.round(data.targetElevation)}m
            </div>
          </div>
        )}

        {/* Bearing */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>
            BEARING
          </div>
          <div className="mono" style={{ fontSize: '0.9rem' }}>
            {Math.round(data.bearing)}° {getBearingDirection(data.bearing)}
          </div>
        </div>

        {/* Share button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            const url = `${window.location.origin}?lat=${data.origin.lat}&lon=${data.origin.lon}`;
            navigator.clipboard.writeText(url);
          }}
          style={{
            width: '100%',
            padding: '12px',
            background: 'var(--electric-blue)',
            color: 'var(--deep-black)',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.9rem',
            marginTop: '8px'
          }}
        >
          📋 Copy Link
        </motion.button>
      </motion.div>
    </div>
  );
}

function getBearingDirection(bearing) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(bearing / 22.5) % 16;
  return directions[index];
}
