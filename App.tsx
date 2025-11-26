import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Controls } from './components/Controls';
import { ImageParticles } from './components/ImageParticles';
import { WebcamHandler } from './components/WebcamHandler';

function App() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 2D UI Layer */}
      <Controls />
      <WebcamHandler />

      {/* 3D Scene Layer */}
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]} // Handle high DPI screens
      >
        <color attach="background" args={['#050505']} />
        
        <Suspense fallback={null}>
          <group>
            <ImageParticles />
          </group>
          
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </Suspense>

        {/* Camera Controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          dampingFactor={0.05}
        />
      </Canvas>
      
      {/* Loading/Fallback indicator for Canvas if needed, though Suspense handles internal loading */}
      <div className="absolute bottom-4 left-4 text-white/30 text-xs pointer-events-none">
        Gemini Expert Dev
      </div>
    </div>
  );
}

export default App;
