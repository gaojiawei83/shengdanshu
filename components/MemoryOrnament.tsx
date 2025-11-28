import React, { useState } from 'react';
import { Text, Image as DreiImage } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { ThreeEvent } from '@react-three/fiber';
import { MemoryItem } from '../types';

interface Props {
  data: MemoryItem;
  onClick: (data: MemoryItem) => void;
}

export const MemoryOrnament: React.FC<Props> = ({ data, onClick }) => {
  const [hovered, setHovered] = useState(false);

  const { scale } = useSpring({
    scale: hovered ? 1.25 : 1,
    config: { tension: 300, friction: 10 }
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'auto';
  };
  
  // Use exact position from data, assuming data is generated relative to tree base 0
  const position: [number, number, number] = [
    data.position[0],
    data.position[1], 
    data.position[2]
  ];

  const renderContent = () => {
      switch (data.type) {
        case 'photo':
            return (
                <group>
                    <mesh position={[0, 0, -0.01]}>
                        <boxGeometry args={[0.8, 0.9, 0.05]} />
                        <meshStandardMaterial color="#f8f9fa" />
                    </mesh>
                    <DreiImage 
                        url={data.content} 
                        position={[0, 0.05, 0.03]} 
                        scale={[0.7, 0.7]} 
                        transparent 
                    />
                    <mesh position={[0, 0.4, 0.03]}>
                        <boxGeometry args={[0.2, 0.1, 0.02]} />
                        <meshStandardMaterial color="#e63946" />
                    </mesh>
                </group>
            );
        case 'note':
            return (
                <group>
                    <mesh>
                        <boxGeometry args={[0.7, 0.7, 0.02]} />
                        <meshStandardMaterial color={data.color || '#ffc8dd'} roughness={0.9} />
                    </mesh>
                    <Text
                        position={[0, 0, 0.02]}
                        fontSize={0.08}
                        color="#000"
                        maxWidth={0.6}
                        textAlign="center"
                        lineHeight={1.2}
                    >
                        {data.content.length > 20 ? data.content.substring(0, 20) + '...' : data.content}
                    </Text>
                     <mesh position={[0, 0.3, 0.02]}>
                        <sphereGeometry args={[0.04]} />
                        <meshStandardMaterial color="red" />
                    </mesh>
                </group>
            );
        case 'decoration':
            const shapeColor = data.color || 'gold';
            if (data.content === 'gift') {
                return (
                    <group>
                         <mesh>
                            <boxGeometry args={[0.4, 0.4, 0.4]} />
                            <meshStandardMaterial color={shapeColor} metalness={0.5} roughness={0.2} />
                        </mesh>
                        <mesh position={[0, 0, 0]}>
                            <boxGeometry args={[0.42, 0.42, 0.1]} />
                            <meshStandardMaterial color="white" />
                        </mesh>
                        <mesh position={[0, 0, 0]}>
                            <boxGeometry args={[0.1, 0.42, 0.42]} />
                            <meshStandardMaterial color="white" />
                        </mesh>
                    </group>
                );
            }
            if (data.content === 'diamond') {
                return (
                    <mesh>
                        <octahedronGeometry args={[0.3]} />
                        <meshStandardMaterial color={shapeColor} metalness={0.9} roughness={0.0} emissive={shapeColor} emissiveIntensity={0.4} />
                    </mesh>
                );
            }
             if (data.content === 'star') {
                return (
                    <mesh>
                        <dodecahedronGeometry args={[0.25]} />
                        <meshStandardMaterial color={shapeColor} metalness={0.8} roughness={0.1} />
                    </mesh>
                );
            }
            // Default ball
            return (
                <mesh>
                    <sphereGeometry args={[0.25, 32, 32]} />
                    <meshStandardMaterial color={shapeColor} metalness={0.7} roughness={0.1} />
                </mesh>
            );
      }
  };

  return (
    <animated.group
      position={position}
      rotation={data.rotation}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        onClick(data);
      }}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* String */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.7]} />
        <meshBasicMaterial color="#ccc" />
      </mesh>
      {renderContent()}
    </animated.group>
  );
};