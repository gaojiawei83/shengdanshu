import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, ContactShadows, Sparkles } from '@react-three/drei';
import { v4 as uuidv4 } from 'uuid';

import { ChristmasTree } from './components/ChristmasTree';
import { MemoryOrnament } from './components/MemoryOrnament';
import { UIOverlay } from './components/UIOverlay';
import { MemoryItem, MemoryType, TreeSettings } from './types';
import { getRandomTreePosition, INITIAL_MEMORIES, adjustBrightness, TREE_COLORS } from './constants';

export default function App() {
  // Memories State
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    const saved = localStorage.getItem('love-tree-memories');
    return saved ? JSON.parse(saved) : INITIAL_MEMORIES;
  });

  // Settings State
  const [treeSettings, setTreeSettings] = useState<TreeSettings>(() => {
      const saved = localStorage.getItem('love-tree-settings');
      return saved ? JSON.parse(saved) : { 
          color: TREE_COLORS.LEAVES_TOP, 
          particleSize: 6.0, 
          particleOpacity: 1.2 // Increased default opacity
      };
  });

  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);

  useEffect(() => {
    localStorage.setItem('love-tree-memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('love-tree-settings', JSON.stringify(treeSettings));
  }, [treeSettings]);

  const treeColors = {
    top: treeSettings.color,
    bottom: adjustBrightness(treeSettings.color, -0.25)
  };

  const handleAddMemory = (type: MemoryType, content: string, color?: string) => {
    // New simplified call - logic is handled in constants.ts
    const { position, rotation } = getRandomTreePosition();
    const newItem: MemoryItem = {
      id: uuidv4(),
      type,
      content,
      color,
      position,
      rotation,
      createdAt: Date.now(),
    };
    setMemories(prev => [...prev, newItem]);
  };

  const handleUpdateMemory = (id: string, content: string, color?: string) => {
    setMemories(prev => prev.map(m => 
      m.id === id ? { ...m, content, color: color || m.color } : m
    ));
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  const handleRandomizePosition = (id: string) => {
     const { position, rotation } = getRandomTreePosition();
     setMemories(prev => prev.map(m => 
        m.id === id ? { ...m, position, rotation } : m
     ));
  };

  return (
    <div className="w-full h-screen bg-slate-900 overflow-hidden relative">
      <Canvas shadows camera={{ position: [0, 2, 8], fov: 50 }}>
        <color attach="background" args={['#0f172a']} />
        <fog attach="fog" args={['#0f172a', 8, 25]} />
        <ambientLight intensity={0.5} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.5} 
          penumbra={1} 
          intensity={1.5} 
          castShadow 
          shadow-bias={-0.0001}
        />
        <pointLight position={[-10, 5, -10]} intensity={0.5} color={treeSettings.color} />

        {/* Snow Effect */}
        <Sparkles 
           count={200} 
           scale={[20, 20, 20]} 
           size={3} 
           speed={0.5} 
           opacity={0.7} 
           color="#ffffff" 
        />

        {/* Tree Group - Lowered to fit nicely in view */}
        <group position={[0, -3.5, 0]}>
          <ChristmasTree 
            colors={treeColors} 
            particleSize={treeSettings.particleSize}
            opacity={treeSettings.particleOpacity}
          />
          
          {memories.map(memory => (
            <MemoryOrnament 
              key={memory.id} 
              data={memory} 
              onClick={(m) => setSelectedMemory(m)} 
            />
          ))}
        </group>
        
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.5} />
        </mesh>
        <ContactShadows opacity={0.5} scale={10} blur={2} far={4} resolution={256} color="#000000" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <OrbitControls 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.8}
          minDistance={4}
          maxDistance={15}
          enablePan={false}
          autoRotate={!selectedMemory}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      <UIOverlay 
        onAdd={handleAddMemory}
        onUpdate={handleUpdateMemory}
        onDelete={handleDeleteMemory}
        onRandomizePosition={handleRandomizePosition}
        selectedMemory={selectedMemory}
        onCloseSelection={() => setSelectedMemory(null)}
        settings={treeSettings}
        onSettingsChange={setTreeSettings}
      />
    </div>
  );
}