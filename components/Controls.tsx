import React from 'react';
import { useStore } from '../store';
import { Upload, Settings2, Grid3X3, Waves, Zap, Activity, Maximize } from 'lucide-react';

export const Controls: React.FC = () => {
  const {
    setImageSrc,
    gridSize, setGridSize,
    noiseStrength, setNoiseStrength,
    noiseSpeed, setNoiseSpeed,
    noiseFrequency, setNoiseFrequency,
    pointSize, setPointSize
  } = useStore();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed top-4 left-4 z-40 w-80 bg-black/80 backdrop-blur-md border border-white/10 text-white p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
        <Settings2 className="w-5 h-5 text-blue-400" />
        <h1 className="text-xl font-bold tracking-wider">Particle Arch</h1>
      </div>

      <div className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-gray-400 flex items-center gap-2">
            <Upload className="w-3 h-3" /> Source Image
          </label>
          <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-white/20 rounded-lg hover:border-blue-500/50 hover:bg-white/5 transition-all cursor-pointer group">
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm text-gray-400 group-hover:text-white">Choose File</span>
              <span className="text-[10px] text-gray-600">JPG, PNG</span>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
        </div>

        {/* Grid Density */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-2 text-gray-300"><Grid3X3 className="w-3 h-3" /> Grid Density</span>
            <span className="font-mono text-blue-400">{gridSize}x{gridSize}</span>
          </div>
          <input
            type="range"
            min="50"
            max="400"
            step="10"
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
          />
        </div>

        {/* Point Size */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-2 text-gray-300"><Maximize className="w-3 h-3" /> Particle Size</span>
            <span className="font-mono text-blue-400">{pointSize.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={pointSize}
            onChange={(e) => setPointSize(Number(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400"
          />
        </div>

        {/* Noise Strength (Amplitude) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-2 text-gray-300"><Waves className="w-3 h-3" /> Z-Displacement</span>
            <span className="font-mono text-blue-400">{noiseStrength.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            step="0.1"
            value={noiseStrength}
            onChange={(e) => setNoiseStrength(Number(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400"
          />
        </div>

        {/* Noise Frequency */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-2 text-gray-300"><Activity className="w-3 h-3" /> Noise Frequency</span>
            <span className="font-mono text-blue-400">{noiseFrequency.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="5.0"
            step="0.1"
            value={noiseFrequency}
            onChange={(e) => setNoiseFrequency(Number(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400"
          />
        </div>

        {/* Noise Speed */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-2 text-gray-300"><Zap className="w-3 h-3" /> Animation Speed</span>
            <span className="font-mono text-blue-400">{noiseSpeed.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="3.0"
            step="0.1"
            value={noiseSpeed}
            onChange={(e) => setNoiseSpeed(Number(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:accent-yellow-400"
          />
        </div>
        
        <div className="pt-4 border-t border-white/10 text-[10px] text-gray-500 text-center">
          Powered by R3F & MediaPipe
        </div>
      </div>
    </div>
  );
};