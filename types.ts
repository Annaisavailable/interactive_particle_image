export interface AppState {
  imageSrc: string | null;
  gridSize: number; // Density of particles (e.g., 100x100)
  noiseStrength: number;
  noiseSpeed: number;
  noiseFrequency: number;
  pointSize: number;
  rotation: [number, number, number];
  isWebcamActive: boolean;
  
  setImageSrc: (src: string) => void;
  setGridSize: (size: number) => void;
  setNoiseStrength: (val: number) => void;
  setNoiseSpeed: (val: number) => void;
  setNoiseFrequency: (val: number) => void;
  setPointSize: (val: number) => void;
  setRotation: (rot: [number, number, number]) => void;
  toggleWebcam: (isActive: boolean) => void;
}
