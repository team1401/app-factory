import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

// Generate wireframe/grid globe geometry for a stylized look
function StylizedEarth({ onPointClick, selectedPoint, sightLine }) {
  const earthRef = useRef();
  const glowRef = useRef();

  useFrame((state, delta) => {
    if (earthRef.current && !selectedPoint) {
      earthRef.current.rotation.y += delta * 0.05;
    }
    if (glowRef.current && !selectedPoint) {
      glowRef.current.rotation.y += delta * 0.05;
    }
  });

  const latLonToVector3 = (lat, lon, radius = 2) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  const handleClick = (event) => {
    event.stopPropagation();
    const point = event.point;
    const distance = Math.sqrt(point.x ** 2 + point.y ** 2 + point.z ** 2);
    const normalizedPoint = point.clone().divideScalar(distance);
    const lat = 90 - (Math.acos(normalizedPoint.y) * 180) / Math.PI;
    const lon = ((Math.atan2(normalizedPoint.z, -normalizedPoint.x) * 180) / Math.PI) - 180;
    onPointClick(lat, lon);
  };

  // Generate continent outlines (simplified major landmasses)
  const continentLines = useMemo(() => {
    // Simplified continent outlines as lat/lon paths
    const continents = [
      // North America (simplified)
      [[70,-170],[65,-165],[60,-145],[55,-130],[50,-125],[48,-123],[37,-122],[32,-117],[25,-110],[20,-105],[15,-90],[10,-80],[8,-77],[10,-75],[18,-88],[22,-97],[26,-97],[30,-90],[30,-85],[25,-80],[30,-82],[35,-76],[40,-74],[42,-70],[45,-67],[47,-65],[48,-60],[50,-57],[52,-56],[55,-60],[60,-65],[58,-75],[55,-85],[55,-95],[60,-110],[65,-140],[70,-160],[70,-170]],
      // South America
      [[10,-75],[8,-77],[5,-77],[0,-80],[-5,-80],[-10,-77],[-15,-75],[-20,-70],[-25,-65],[-30,-70],[-35,-72],[-40,-72],[-45,-75],[-50,-75],[-55,-68],[-55,-65],[-50,-65],[-45,-65],[-40,-65],[-35,-57],[-30,-50],[-25,-48],[-20,-40],[-15,-39],[-10,-37],[-5,-35],[0,-50],[5,-60],[8,-62],[10,-67],[12,-72],[10,-75]],
      // Europe
      [[72,25],[70,30],[65,30],[60,30],[56,30],[55,28],[50,30],[47,35],[45,28],[42,28],[40,26],[37,24],[35,25],[38,28],[40,30],[42,32],[44,34],[43,16],[42,13],[40,14],[38,16],[36,0],[37,-8],[40,-9],[43,-9],[43,-2],[46,2],[48,5],[51,4],[53,7],[56,10],[57,12],[60,18],[63,20],[68,20],[70,25],[72,25]],
      // Africa
      [[37,10],[35,0],[33,-8],[28,-13],[22,-17],[15,-17],[10,-15],[5,-5],[0,9],[-5,12],[-10,14],[-15,12],[-20,15],[-25,16],[-30,18],[-34,18],[-35,20],[-34,25],[-30,32],[-25,35],[-20,35],[-15,41],[-10,40],[-5,40],[0,42],[5,45],[10,45],[12,50],[15,42],[20,40],[25,35],[30,33],[32,35],[37,10]],
      // Asia (simplified)
      [[72,25],[70,40],[65,40],[60,50],[55,55],[50,60],[45,65],[40,70],[35,70],[30,68],[25,65],[20,72],[15,75],[10,77],[5,80],[0,100],[-5,105],[-8,115],[0,105],[5,100],[10,100],[15,108],[20,110],[25,120],[30,122],[35,129],[40,130],[42,132],[45,140],[50,140],[55,135],[60,140],[65,170],[70,180],[72,175],[70,160],[68,170],[65,180],[70,180]],
      // Australia
      [[-12,132],[-15,129],[-20,119],[-25,114],[-30,115],[-35,117],[-35,138],[-38,145],[-37,150],[-33,152],[-28,153],[-23,150],[-18,146],[-15,145],[-12,142],[-12,137],[-12,132]],
    ];

    return continents.map(continent => {
      const points = continent.map(([lat, lon]) => latLonToVector3(lat, lon, 2.01));
      return points;
    });
  }, []);

  // Generate grid lines
  const gridLines = useMemo(() => {
    const lines = [];
    // Latitude lines every 30 degrees
    for (let lat = -60; lat <= 60; lat += 30) {
      const points = [];
      for (let lon = -180; lon <= 180; lon += 5) {
        points.push(latLonToVector3(lat, lon, 2.005));
      }
      lines.push(points);
    }
    // Longitude lines every 30 degrees
    for (let lon = -180; lon < 180; lon += 30) {
      const points = [];
      for (let lat = -90; lat <= 90; lat += 5) {
        points.push(latLonToVector3(lat, lon, 2.005));
      }
      lines.push(points);
    }
    return lines;
  }, []);

  const generateSightLineCurve = () => {
    if (!sightLine || !sightLine.target) return null;
    const start = latLonToVector3(sightLine.origin.lat, sightLine.origin.lon);
    const end = latLonToVector3(sightLine.target.lat, sightLine.target.lon);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const height = start.distanceTo(end) * 0.3;
    mid.normalize().multiplyScalar(2 + height);
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve.getPoints(50);
  };

  const sightLinePoints = sightLine ? generateSightLineCurve() : null;
  const originPos = selectedPoint ? latLonToVector3(selectedPoint.lat, selectedPoint.lon) : null;
  const targetPos = sightLine?.target ? latLonToVector3(sightLine.target.lat, sightLine.target.lon) : null;

  return (
    <group>
      {/* Base sphere */}
      <Sphere ref={earthRef} args={[2, 64, 64]} onClick={handleClick}>
        <meshStandardMaterial
          color="#0d1117"
          roughness={0.9}
          metalness={0.1}
        />
      </Sphere>

      {/* Grid lines */}
      <group ref={glowRef}>
        {gridLines.map((points, i) => (
          <Line key={`grid-${i}`} points={points} color="#1a3a4a" lineWidth={0.5} transparent opacity={0.3} />
        ))}

        {/* Continent outlines */}
        {continentLines.map((points, i) => (
          <Line key={`continent-${i}`} points={points} color="#00d9ff" lineWidth={1.5} transparent opacity={0.6} />
        ))}
      </group>

      {/* Atmosphere glow */}
      <Sphere args={[2.08, 64, 64]}>
        <meshBasicMaterial color="#00d9ff" transparent opacity={0.04} side={THREE.BackSide} />
      </Sphere>
      <Sphere args={[2.15, 64, 64]}>
        <meshBasicMaterial color="#00d9ff" transparent opacity={0.02} side={THREE.BackSide} />
      </Sphere>

      {/* Selected point marker */}
      {originPos && (
        <mesh position={originPos}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshBasicMaterial color="#00d9ff" />
        </mesh>
      )}

      {/* Target marker */}
      {targetPos && (
        <mesh position={targetPos}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshBasicMaterial color="#ff006e" />
        </mesh>
      )}

      {/* Sight line */}
      {sightLinePoints && (
        <Line points={sightLinePoints} color="#00d9ff" lineWidth={2} transparent opacity={0.8} />
      )}
    </group>
  );
}

export default function Globe({ onPointClick, selectedPoint, sightLine }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ background: '#0a0a0f' }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={0.8} />
      <pointLight position={[-5, -3, -5]} intensity={0.3} color="#00d9ff" />

      <StylizedEarth
        onPointClick={onPointClick}
        selectedPoint={selectedPoint}
        sightLine={sightLine}
      />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={10}
      />
    </Canvas>
  );
}
