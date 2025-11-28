
import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, StickyNote, Trash2, RotateCw, Palette, Settings, Gift, Upload } from 'lucide-react';
import { MemoryItem, MemoryType, TreeSettings } from '../types';
import { COLOR_PRESETS, DECORATION_SHAPES } from '../constants';

interface UIProps {
  onAdd: (type: MemoryType, content: string, color?: string) => void;
  onUpdate: (id: string, content: string, color?: string) => void;
  onDelete: (id: string) => void;
  onRandomizePosition: (id: string) => void;
  selectedMemory: MemoryItem | null;
  onCloseSelection: () => void;
  settings: TreeSettings;
  onSettingsChange: (settings: TreeSettings) => void;
}

export const UIOverlay: React.FC<UIProps> = ({ 
  onAdd, 
  onUpdate, 
  onDelete, 
  onRandomizePosition,
  selectedMemory, 
  onCloseSelection,
  settings,
  onSettingsChange
}) => {
  const [activeModal, setActiveModal] = useState<MemoryType | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Form States
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ffc8dd');
  const [selectedShape, setSelectedShape] = useState('ball');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load selected memory
  useEffect(() => {
    if (selectedMemory) {
      setActiveModal(selectedMemory.type);
      setContent(selectedMemory.content);
      setSelectedColor(selectedMemory.color || '#ffc8dd');
      if (selectedMemory.type === 'decoration') {
          setSelectedShape(selectedMemory.content);
      }
    } else {
      setActiveModal(null);
      setContent('');
    }
  }, [selectedMemory]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setContent(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For decoration, content is the shape ID
    const finalContent = activeModal === 'decoration' ? selectedShape : content;
    
    if (!finalContent) return;

    if (selectedMemory) {
      onUpdate(selectedMemory.id, finalContent, selectedColor);
      onCloseSelection();
    } else {
      if (activeModal) {
          onAdd(activeModal, finalContent, selectedColor);
      }
      setActiveModal(null);
      setContent('');
    }
  };

  const closeModal = () => {
      setActiveModal(null);
      onCloseSelection();
  };

  const renderModal = () => {
    if (!activeModal && !selectedMemory) return null;

    const isEdit = !!selectedMemory;
    const titleMap = { 'photo': 'Upload Photo', 'note': 'Write Note', 'decoration': 'Add Decoration' };
    const Icon = activeModal === 'photo' ? Camera : activeModal === 'note' ? StickyNote : Gift;

    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
          <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>

          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Icon className="text-pink-500" />
            {isEdit ? 'Edit Item' : titleMap[activeModal!]}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeModal === 'photo' && (
              <div className="space-y-4">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                    accept="image/*" 
                />
                
                {!content ? (
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                        <Upload size={32} className="mb-2" />
                        <span>Click to Upload Photo</span>
                    </button>
                ) : (
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                        <img src={content} alt="Preview" className="w-full h-full object-contain" />
                        <button 
                            type="button"
                            onClick={() => { setContent(''); fileInputRef.current!.value = ''; }}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
              </div>
            )}

            {activeModal === 'note' && (
              <div>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Your message..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none h-32 resize-none"
                  style={{ backgroundColor: selectedColor }}
                />
                 <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {['#ffc8dd', '#bde0fe', '#d0f4de', '#fcf6bd', '#e2e2df'].map(c => (
                    <button
                      key={c} type="button" onClick={() => setSelectedColor(c)}
                      className={`w-8 h-8 rounded-full border-2 flex-shrink-0 ${selectedColor === c ? 'border-gray-600 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeModal === 'decoration' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Choose Shape</label>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {DECORATION_SHAPES.map(shape => (
                            <button
                                key={shape.id}
                                type="button"
                                onClick={() => setSelectedShape(shape.id)}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${selectedShape === shape.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-200'}`}
                            >
                                <span className="text-2xl mb-1">{shape.emoji}</span>
                                <span className="text-xs text-gray-600">{shape.label}</span>
                            </button>
                        ))}
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <div className="flex gap-2 flex-wrap">
                        {COLOR_PRESETS.map(c => (
                             <button
                             key={c} type="button" onClick={() => setSelectedColor(c)}
                             className={`w-8 h-8 rounded-full border-2 ${selectedColor === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                             style={{ backgroundColor: c }}
                           />
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
               {isEdit && (
                 <>
                  <button type="button" onClick={() => onRandomizePosition(selectedMemory!.id)} className="p-2.5 text-orange-500 bg-orange-50 hover:bg-orange-100 rounded-lg">
                    <RotateCw size={20} />
                  </button>
                   <button type="button" onClick={() => { if(window.confirm('Delete?')) { onDelete(selectedMemory!.id); closeModal(); }}} className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg">
                    <Trash2 size={20} />
                  </button>
                 </>
               )}
              <button type="submit" className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold py-2.5 rounded-lg shadow-lg">
                {isEdit ? 'Save' : 'Hang on Tree'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="absolute top-20 right-8 z-40 bg-white/90 backdrop-blur rounded-xl p-4 shadow-xl w-72 animate-in fade-in slide-in-from-top-4">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Palette size={16} /> Tree Settings
        </h3>
        
        <div className="space-y-4">
            <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Tree Color</label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {COLOR_PRESETS.map((color) => (
                    <button
                        key={color}
                        onClick={() => onSettingsChange({...settings, color})}
                        className={`w-6 h-6 rounded-full border ${settings.color === color ? 'border-black scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                    />
                    ))}
                    <input 
                        type="color" 
                        value={settings.color}
                        onChange={(e) => onSettingsChange({...settings, color: e.target.value})}
                        className="w-6 h-6 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                    />
                </div>
            </div>

            <div>
                <label className="text-xs font-semibold text-gray-500 uppercase flex justify-between">
                    <span>Particle Size</span>
                    <span>{settings.particleSize.toFixed(1)}</span>
                </label>
                <input 
                    type="range" min="2" max="15" step="0.5"
                    value={settings.particleSize}
                    onChange={(e) => onSettingsChange({...settings, particleSize: parseFloat(e.target.value)})}
                    className="w-full mt-1 accent-pink-500"
                />
            </div>

             <div>
                <label className="text-xs font-semibold text-gray-500 uppercase flex justify-between">
                    <span>Transparency</span>
                    <span>{Math.round(settings.particleOpacity * 100)}%</span>
                </label>
                <input 
                    type="range" min="0.1" max="1" step="0.05"
                    value={settings.particleOpacity}
                    onChange={(e) => onSettingsChange({...settings, particleOpacity: parseFloat(e.target.value)})}
                    className="w-full mt-1 accent-pink-500"
                />
            </div>
        </div>
    </div>
  );

  return (
    <>
      <div className="absolute top-8 left-8 z-40 text-white drop-shadow-lg pointer-events-none">
        <h1 className="text-4xl font-black tracking-tight">🎄 Love Tree</h1>
        <p className="text-white/80 font-medium">Decorate our memories together</p>
      </div>

      {/* Settings Toggle */}
      <div className="absolute top-8 right-8 z-40">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-3 rounded-full shadow-lg transition-all hover:scale-105 ${showSettings ? 'bg-white text-gray-800' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'}`}
        >
          <Settings size={24} />
        </button>
      </div>

      {showSettings && renderSettings()}

      {/* Bottom Action Buttons */}
      <div className="absolute bottom-8 right-8 z-40 flex flex-col gap-4 items-end">
        <button
            onClick={() => { setActiveModal('photo'); setContent(''); }}
            className="flex items-center gap-3 bg-white text-blue-600 px-5 py-3 rounded-full shadow-lg hover:scale-105 transition-transform"
        >
            <span className="font-bold">Add Photo</span>
            <Camera size={24} />
        </button>

        <button
            onClick={() => { setActiveModal('note'); setContent(''); setSelectedColor('#ffc8dd'); }}
            className="flex items-center gap-3 bg-white text-pink-600 px-5 py-3 rounded-full shadow-lg hover:scale-105 transition-transform"
        >
            <span className="font-bold">Sticky Note</span>
            <StickyNote size={24} />
        </button>

        <button
            onClick={() => { setActiveModal('decoration'); setSelectedShape('ball'); setSelectedColor('gold'); }}
            className="flex items-center gap-3 bg-white text-purple-600 px-5 py-3 rounded-full shadow-lg hover:scale-105 transition-transform"
        >
            <span className="font-bold">Decoration</span>
            <Gift size={24} />
        </button>
      </div>

      {renderModal()}
    </>
  );
};
