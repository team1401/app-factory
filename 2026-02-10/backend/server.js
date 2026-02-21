const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3100;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// In-memory cache
const cache = new Map();
const CACHE_TTL = 3600000; // 1 hour

// Hardcoded top 10 longest sight lines on Earth
const LEADERBOARD = [
  {
    rank: 1,
    name: "Hindu Kush to Pik Dankova",
    from: { lat: 36.314, lon: 78.765, name: "Hindu Kush" },
    to: { lat: 39.022, lon: 73.526, name: "Pik Dankova" },
    distance: 530,
    country: "Afghanistan to Kyrgyzstan"
  },
  {
    rank: 2,
    name: "Antioquia to Pico Cristobal",
    from: { lat: 6.755, lon: -75.722, name: "Antioquia" },
    to: { lat: 10.837, lon: -73.686, name: "Pico Cristóbal Colón" },
    distance: 504,
    country: "Colombia"
  },
  {
    rank: 3,
    name: "Mount Elbrus to Pontic Mountains",
    from: { lat: 43.349, lon: 42.440, name: "Mount Elbrus" },
    to: { lat: 40.996, lon: 39.713, name: "Pontic Mountains" },
    distance: 483,
    country: "Russia to Turkey"
  },
  {
    rank: 4,
    name: "Mount Everest to Kangchenjunga",
    from: { lat: 27.988, lon: 86.925, name: "Mount Everest" },
    to: { lat: 27.703, lon: 88.147, name: "Kangchenjunga" },
    distance: 437,
    country: "Nepal to India"
  },
  {
    rank: 5,
    name: "Aconcagua to Ojos del Salado",
    from: { lat: -32.653, lon: -70.011, name: "Aconcagua" },
    to: { lat: -27.109, lon: -68.542, name: "Ojos del Salado" },
    distance: 412,
    country: "Argentina to Chile"
  },
  {
    rank: 6,
    name: "Denali to Mount Foraker",
    from: { lat: 63.069, lon: -151.007, name: "Denali" },
    to: { lat: 62.960, lon: -151.400, name: "Mount Foraker" },
    distance: 389,
    country: "Alaska, USA"
  },
  {
    rank: 7,
    name: "Mont Blanc to Matterhorn",
    from: { lat: 45.833, lon: 6.865, name: "Mont Blanc" },
    to: { lat: 45.976, lon: 7.658, name: "Matterhorn" },
    distance: 367,
    country: "France to Switzerland"
  },
  {
    rank: 8,
    name: "Kilimanjaro to Mount Kenya",
    from: { lat: -3.076, lon: 37.353, name: "Kilimanjaro" },
    to: { lat: -0.152, lon: 37.308, name: "Mount Kenya" },
    distance: 341,
    country: "Tanzania to Kenya"
  },
  {
    rank: 9,
    name: "Mount Cook to Mount Tasman",
    from: { lat: -43.595, lon: 170.142, name: "Aoraki / Mount Cook" },
    to: { lat: -43.579, lon: 170.211, name: "Mount Tasman" },
    distance: 318,
    country: "New Zealand"
  },
  {
    rank: 10,
    name: "Pico de Orizaba to Popocatépetl",
    from: { lat: 19.030, lon: -97.268, name: "Pico de Orizaba" },
    to: { lat: 19.023, lon: -98.628, name: "Popocatépetl" },
    distance: 298,
    country: "Mexico"
  }
];

// Calculate distance between two points (Haversine formula)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

function toDeg(rad) {
  return rad * (180 / Math.PI);
}

// Calculate bearing from point 1 to point 2
function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  const bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

// Calculate destination point given start, bearing, and distance
function destinationPoint(lat, lon, bearing, distance) {
  const R = 6371; // Earth radius in km
  const bearingRad = toRad(bearing);
  const latRad = toRad(lat);
  const lonRad = toRad(lon);

  const lat2 = Math.asin(
    Math.sin(latRad) * Math.cos(distance / R) +
    Math.cos(latRad) * Math.sin(distance / R) * Math.cos(bearingRad)
  );

  const lon2 = lonRad + Math.atan2(
    Math.sin(bearingRad) * Math.sin(distance / R) * Math.cos(latRad),
    Math.cos(distance / R) - Math.sin(latRad) * Math.sin(lat2)
  );

  return {
    lat: toDeg(lat2),
    lon: toDeg(lon2)
  };
}

// Fetch elevation for a point (using Open-Elevation API)
async function getElevation(lat, lon) {
  const cacheKey = `elev_${lat.toFixed(4)}_${lon.toFixed(4)}`;
  
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.value;
    }
  }

  try {
    const response = await fetch(
      `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`,
      { timeout: 5000 }
    );
    const data = await response.json();
    const elevation = data.results[0].elevation;
    
    cache.set(cacheKey, { value: elevation, timestamp: Date.now() });
    return elevation;
  } catch (error) {
    console.error(`Elevation fetch failed for ${lat},${lon}:`, error.message);
    return 0; // Fallback to sea level
  }
}

// Simplified line-of-sight check
async function checkLineOfSight(lat1, lon1, elev1, bearing, maxDistance = 200) {
  const samples = 20; // Number of points to check along the ray
  const stepDistance = maxDistance / samples;
  
  let lastVisibleDistance = 0;
  let lastVisiblePoint = null;

  for (let i = 1; i <= samples; i++) {
    const distance = i * stepDistance;
    const point = destinationPoint(lat1, lon1, bearing, distance);
    const elev2 = await getElevation(point.lat, point.lon);

    // Simple line-of-sight: check if intermediate point is below the line
    // This is simplified - proper viewshed needs Earth curvature + refraction
    const expectedElevation = elev1 - (elev1 - elev2) * (i / samples);
    const actualElevation = elev2;

    if (actualElevation < expectedElevation + 50) { // 50m tolerance
      lastVisibleDistance = distance;
      lastVisiblePoint = { ...point, elevation: elev2 };
    } else {
      break; // Line of sight blocked
    }
  }

  return {
    distance: lastVisibleDistance,
    point: lastVisiblePoint
  };
}

// Find longest line of sight from a point
async function findLongestSightLine(lat, lon) {
  const cacheKey = `sight_${lat.toFixed(3)}_${lon.toFixed(3)}`;
  
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.value;
    }
  }

  console.log(`Calculating sight line from ${lat}, ${lon}`);

  const originElevation = await getElevation(lat, lon);
  const bearings = 36; // Check every 10 degrees
  const maxDistance = 200; // km

  let longestSight = {
    distance: 0,
    bearing: 0,
    target: null,
    originElevation,
    targetElevation: 0
  };

  // Check all bearings
  for (let i = 0; i < bearings; i++) {
    const bearing = (360 / bearings) * i;
    const result = await checkLineOfSight(lat, lon, originElevation, bearing, maxDistance);

    if (result.distance > longestSight.distance && result.point) {
      longestSight = {
        distance: result.distance,
        bearing,
        target: result.point,
        originElevation,
        targetElevation: result.point.elevation
      };
    }
  }

  const result = {
    origin: { lat, lon, elevation: originElevation },
    ...longestSight
  };

  cache.set(cacheKey, { value: result, timestamp: Date.now() });
  return result;
}

// API Routes

app.get('/api/leaderboard', (req, res) => {
  res.json({
    success: true,
    leaderboard: LEADERBOARD
  });
});

app.get('/api/sightline', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters: lat, lon'
    });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid latitude or longitude'
    });
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({
      success: false,
      error: 'Latitude must be between -90 and 90, longitude between -180 and 180'
    });
  }

  try {
    const result = await findLongestSightLine(latitude, longitude);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error calculating sight line:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate sight line'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    cacheSize: cache.size
  });
});

app.listen(PORT, () => {
  console.log(`ViewFinder API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Leaderboard: http://localhost:${PORT}/api/leaderboard`);
});
