

export const TREE_COLORS = {
  LEAVES_TOP: '#2d6a4f',
  LEAVES_BOTTOM: '#1b4332',
  TRUNK: '#3e2723',
  STAR: '#ffd700',
};

export const DECORATION_SHAPES = [
  { id: 'ball', label: 'Bauble', emoji: '🔮' },
  { id: 'gift', label: 'Gift Box', emoji: '🎁' },
  { id: 'diamond', label: 'Gem', emoji: '💎' },
  { id: 'star', label: 'Star', emoji: '⭐' },
];

// Preset colors for quick selection
export const COLOR_PRESETS = [
  '#2d6a4f', // Classic Green
  '#0ea5e9', // Vivid Sky
  '#ec4899', // Hot Pink
  '#a855f7', // Purple
  '#eab308', // Gold
  '#f43f5e', // Red
  '#14b8a6', // Teal
  '#64748b', // Silver/Grey
];

// Helper to darken or lighten a hex color
export const adjustBrightness = (hex: string, percent: number) => {
  hex = hex.replace(/^\s*#|\s*$/g, '');
  if (hex.length === 3) hex = hex.replace(/(.)/g, '$1$1');

  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return '#000000';

  const adjust = (val: number) => Math.min(255, Math.max(0, Math.floor(val * (1 + percent))));

  const newR = adjust(r).toString(16).padStart(2, '0');
  const newG = adjust(g).toString(16).padStart(2, '0');
  const newB = adjust(b).toString(16).padStart(2, '0');

  return `#${newR}${newG}${newB}`;
};

// Helper to generate random position on the tiered tree
export const getRandomTreePosition = (): { position: [number, number, number]; rotation: [number, number, number] } => {
  // Tree layers definition matching ChristmasTree.tsx
  const layers = [
      { y: 0.5, scale: 2.0 },
      { y: 2.0, scale: 1.7 },
      { y: 3.2, scale: 1.4 },
      { y: 4.2, scale: 1.1 },
      { y: 5.0, scale: 0.8 },
      { y: 5.6, scale: 0.5 },
  ];

  // Pick a random layer
  const layerIndex = Math.floor(Math.random() * layers.length);
  const layer = layers[layerIndex];

  // Height within the layer (relative to layer center)
  // Each layer is approx 1-1.5 units high effectively visually
  const yOffset = (Math.random() - 0.5) * 1.0; 
  const y = layer.y + yOffset;

  // Radius calculation
  // Base radius of particle cone is 1.5 * scale.
  // We want to place ornaments on the surface, so we go slightly inside the max radius
  // Logic: 1.5 (base radius) * scale * (taper factor based on y)
  
  // Simplified: Get max radius at this Y.
  // Linear interpolation approx: Bottom (y=0) -> R=3. Top (y=6.5) -> R=0.
  // But strictly adhering to layers is better.
  const rBase = 1.5 * layer.scale;
  // Taper: as we go up inside a layer, it gets thinner
  const r = rBase * (0.8 + Math.random() * 0.2) * (1 - (yOffset + 0.5) * 0.5); 

  const angle = Math.random() * Math.PI * 2;
  const x = Math.cos(angle) * r;
  const z = Math.sin(angle) * r;

  return {
    position: [x, y, z],
    rotation: [0, -angle, 0]
  };
};

export const INITIAL_MEMORIES = [
  {
    id: 'init-1',
    type: 'note',
    content: "Merry Christmas!",
    color: '#ffc8dd',
    position: [0.8, 2.5, 0.5],
    rotation: [0, -0.5, 0],
    createdAt: Date.now(),
  },
  {
    id: 'init-2',
    type: 'photo',
    // 这是一个类似的黑色轿车图片。请将此 URL 替换为您刚才上传照片的 Base64 编码或图片链接
    content: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop",
    position: [-0.6, 2.2, 1.0], // 放在树的左侧中间位置
    rotation: [0, 0.5, 0],
    createdAt: Date.now(),
  }
];