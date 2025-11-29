import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, Extrude } from '@react-three/drei';
import * as THREE from 'three';
import { TREE_COLORS } from '../constants';

// Shader for the Tree Needles (Leaves)
// Adds a gentle sway and a "magical" glow fade at edges
const leafVertexShader = `
  uniform float uTime;
  uniform float uSize;
  attribute float aRandom;
  attribute vec3 aOriginalPos;
  varying float vAlpha;
  
  void main() {
    vec3 pos = position;
    
    // Wind/Sway Effect based on height
    float heightFactor = max(0.0, pos.y + 1.0);
    float swayStrength = 0.05 * heightFactor;
    
    pos.x += sin(uTime * 1.5 + pos.y) * swayStrength;
    pos.z += cos(uTime * 1.2 + pos.x) * swayStrength;
    
    // Slight breathing
    pos += normal * sin(uTime * 2.0 + aRandom * 10.0) * 0.02;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = uSize * (20.0 / -mvPosition.z);
    
    // Random twinkle alpha
    // Adjusted: Higher base value (0.8) to make tree less transparent
    vAlpha = 0.8 + 0.2 * sin(uTime * 3.0 + aRandom * 100.0);
  }
`;

const leafFragmentShader = `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  
  void main() {
    // Soft circle particle
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    
    // Soft edge glow
    float strength = 1.0 - (dist * 2.0);
    // Adjusted: Lower power (0.8) makes the particle core fuller/more solid
    strength = pow(strength, 0.8);
    
    gl_FragColor = vec4(uColor, vAlpha * strength * uOpacity);
  }
`;

// Shader for the Fairy Lights
// Brighter, sharper, and blinking
const lightFragmentShader = `
  uniform vec3 uColor;
  varying float vAlpha;
  
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    
    float strength = 1.0 - (dist * 2.0);
    strength = pow(strength, 0.5); // Sharper/Brighter than leaves
    
    gl_FragColor = vec4(uColor, strength * vAlpha); 
  }
`;

interface TreeLayerProps {
  index: number;
  position: [number, number, number];
  scale: number;
  color: string;
  particleSize: number;
  opacity: number;
}

const TreeLayer: React.FC<TreeLayerProps> = ({ index, position, scale, color, particleSize, opacity }) => {
  const meshRef = useRef<THREE.Points>(null);
  const lightsRef = useRef<THREE.Points>(null);

  // Generate particles for a "Pine Branch" cone shape
  const { positions, randomness, lightPositions, lightRandomness } = useMemo(() => {
    const count = 1500 + (index * 500); // More particles at bottom layers
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    
    // Fairy lights (fewer than leaves)
    const lightCount = 50 + (index * 20);
    const lPos = new Float32Array(lightCount * 3);
    const lRnd = new Float32Array(lightCount);

    const coneHeight = 2.0 * scale;
    const coneRadius = 1.5 * scale;

    // LEAVES
    for (let i = 0; i < count; i++) {
      // Spiral distribution for "branches"
      const t = i / count;
      const angle = t * Math.PI * 2 * 15.0; // 15 spirals
      
      const h = Math.random(); // Height 0 to 1
      const rRatio = 1.0 - h; // Wide at bottom, narrow at top
      
      // Add noise to radius to simulate fluffiness
      const r = coneRadius * rRatio * (0.8 + 0.4 * Math.random());
      
      // Calculate position
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = (h - 0.5) * coneHeight; // Center y around 0

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      
      rnd[i] = Math.random();
    }

    // LIGHTS (Concentrated on outer edges)
    for (let i = 0; i < lightCount; i++) {
        const h = Math.random();
        const rRatio = 1.0 - h;
        const angle = Math.random() * Math.PI * 2;
        
        // Push lights to the edge of the branches
        const r = coneRadius * rRatio * 0.95;
        
        lPos[i*3] = Math.cos(angle) * r;
        lPos[i*3+1] = (h - 0.5) * coneHeight;
        lPos[i*3+2] = Math.sin(angle) * r;
        
        lRnd[i] = Math.random();
    }

    return { positions: pos, randomness: rnd, lightPositions: lPos, lightRandomness: lRnd };
  }, [index, scale]);

  const leafUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(color) },
    uSize: { value: particleSize },
    uOpacity: { value: opacity }
  }), [color, particleSize, opacity]);

  const lightUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#ffd700') }, // Gold lights default
    uSize: { value: particleSize * 1.5 }, // Lights are slightly bigger
  }), [particleSize]);

  useFrame((state) => {
    if (meshRef.current) {
      // @ts-ignore
      meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
      // @ts-ignore
      meshRef.current.material.uniforms.uColor.value.set(color);
      // @ts-ignore
      meshRef.current.material.uniforms.uSize.value = particleSize;
      // @ts-ignore
      meshRef.current.material.uniforms.uOpacity.value = opacity;
    }
    if (lightsRef.current) {
        // @ts-ignore
        lightsRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
        // @ts-ignore
        lightsRef.current.material.uniforms.uSize.value = particleSize * 1.2;
    }
  });

  return (
    <group position={position}>
      {/* Leaves */}
      <points ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-aRandom" count={randomness.length} array={randomness} itemSize={1} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={leafVertexShader}
          fragmentShader={leafFragmentShader}
          uniforms={leafUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Fairy Lights */}
      <points ref={lightsRef}>
        <bufferGeometry>
           <bufferAttribute attach="attributes-position" count={lightPositions.length / 3} array={lightPositions} itemSize={3} />
           <bufferAttribute attach="attributes-aRandom" count={lightRandomness.length} array={lightRandomness} itemSize={1} />
        </bufferGeometry>
        <shaderMaterial 
           vertexShader={leafVertexShader} // Reuse vertex motion
           fragmentShader={lightFragmentShader}
           uniforms={lightUniforms}
           transparent
           depthWrite={false}
           blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

// 5-Pointed Star Shape
const StarShape = () => {
    const shape = useMemo(() => {
        const s = new THREE.Shape();
        const points = 5;
        const outerRadius = 0.5;
        const innerRadius = 0.25;
        
        for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? outerRadius : innerRadius;
            const a = (i / points) * Math.PI;
            const x = Math.cos(a + Math.PI / 2) * r;
            const y = Math.sin(a + Math.PI / 2) * r;
            if (i === 0) s.moveTo(x, y);
            else s.lineTo(x, y);
        }
        s.closePath();
        return s;
    }, []);

    return (
        <Extrude args={[shape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.05, bevelSegments: 2 }]}>
             <meshStandardMaterial color={TREE_COLORS.STAR} emissive={TREE_COLORS.STAR} emissiveIntensity={2} toneMapped={false} />
        </Extrude>
    );
};

interface ChristmasTreeProps {
  colors?: { top: string; bottom: string };
  particleSize: number;
  opacity: number;
}

export const ChristmasTree: React.FC<ChristmasTreeProps> = ({ 
  colors = { top: TREE_COLORS.LEAVES_TOP, bottom: TREE_COLORS.LEAVES_BOTTOM },
  particleSize,
  opacity
}) => {
  // Define 6 tiers of the tree
  // Position Y moves up, Scale gets smaller
  const layers = [
      { y: 0.5, scale: 2.0 },
      { y: 2.0, scale: 1.7 },
      { y: 3.2, scale: 1.4 },
      { y: 4.2, scale: 1.1 },
      { y: 5.0, scale: 0.8 },
      { y: 5.6, scale: 0.5 },
  ];

  return (
    <group>
      {/* Base / Pot */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[0.8, 0.6, 1, 16]} />
        <meshStandardMaterial color="#4a3b32" roughness={0.8} />
      </mesh>
      <mesh position={[0, 3, 0]} receiveShadow>
         <cylinderGeometry args={[0.15, 0.15, 6.5, 8]} />
         <meshStandardMaterial color={TREE_COLORS.TRUNK} />
      </mesh>

      {/* Tree Layers */}
      {layers.map((layer, i) => (
          <TreeLayer 
            key={i}
            index={i}
            position={[0, layer.y, 0]}
            scale={layer.scale}
            color={i % 2 === 0 ? colors.bottom : colors.top}
            particleSize={particleSize}
            opacity={opacity}
          />
      ))}

      {/* Star */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
        <group position={[0, 6.5, 0]}>
            <StarShape />
            <pointLight intensity={2} color={TREE_COLORS.STAR} distance={8} decay={2} />
        </group>
      </Float>

      {/* Ambient Floor Reflection Sparkles */}
      <Sparkles 
        count={30} 
        scale={6} 
        size={4} 
        speed={0.2} 
        opacity={0.3} 
        color={colors.top} 
        position={[0, 0.1, 0]} 
      />
    </group>
  );
};
