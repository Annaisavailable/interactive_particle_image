import { create } from 'zustand';
import { AppState } from './types';

export const useStore = create<AppState>((set) => ({
  imageSrc: null,
  gridSize: 150,
  noiseStrength: 2.0,
  noiseSpeed: 0.5,
  noiseFrequency: 1.0,
  pointSize: 30.0, // Increased default to ensure visibility
  rotation: [0, 0, 0],
  isWebcamActive: false,

  setImageSrc: (src) => set({ imageSrc: src }),
  setGridSize: (size) => set({ gridSize: size }),
  setNoiseStrength: (val) => set({ noiseStrength: val }),
  setNoiseSpeed: (val) => set({ noiseSpeed: val }),
  setNoiseFrequency: (val) => set({ noiseFrequency: val }),
  setPointSize: (val) => set({ pointSize: val }),
  setRotation: (rot) => set({ rotation: rot }),
  toggleWebcam: (isActive) => set({ isWebcamActive: isActive }),
}));