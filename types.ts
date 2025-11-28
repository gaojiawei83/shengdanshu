
export type MemoryType = 'photo' | 'note' | 'decoration';

export type DecorationShape = 'ball' | 'gift' | 'diamond' | 'star';

export interface MemoryItem {
  id: string;
  type: MemoryType;
  content: string; // URL for photo, Text for note, Shape for decoration
  color?: string; // For notes or decorations
  position: [number, number, number]; // x, y, z
  rotation: [number, number, number]; // x, y, z
  createdAt: number;
}

export interface TreeSettings {
  color: string;
  particleSize: number;
  particleOpacity: number;
}

// Fix for TypeScript not recognizing R3F elements in JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
