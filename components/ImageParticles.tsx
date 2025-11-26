import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { useStore } from '../store';

// Vertex Shader: Handles the grid position and noise displacement
const vertexShader = `
  uniform float uTime;
  uniform float uNoiseStrength;
  uniform float uNoiseFreq;
  uniform float uPointSize;
  uniform float uAspectRatio;
  uniform sampler2D uTexture;
  
  attribute vec2 aGrid;
  
  varying vec3 vColor;

  // Simplex 2D noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    // Sample color from texture
    vec4 color = texture2D(uTexture, aGrid);
    vColor = color.rgb;

    // Calculate noise based on position and time
    float noiseVal = snoise(aGrid * uNoiseFreq + uTime * 0.2);
    
    // Displacement logic:
    // 1. Brightness creates base height (lighter = higher)
    float brightness = (color.r + color.g + color.b) / 3.0;
    
    // 2. Apply Perlin noise to Z axis
    vec3 newPos = position;
    
    // Map grid UV (0..1) to World Space (-5..5), correcting for aspect ratio
    // Base height is 10.0 units, Width is 10.0 * AspectRatio
    newPos.x = (aGrid.x - 0.5) * 10.0 * uAspectRatio;
    newPos.y = (aGrid.y - 0.5) * 10.0;
    
    // Z displacement: Noise * Strength + Brightness boost
    float displacement = (noiseVal * uNoiseStrength) + (brightness * 2.0);
    newPos.z = displacement;

    vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation (particles smaller when further away)
    // Scaled by uPointSize uniform
    gl_PointSize = uPointSize * (50.0 / -mvPosition.z); 
  }
`;

// Fragment Shader: Renders the point
const fragmentShader = `
  varying vec3 vColor;
  
  void main() {
    // Square particle (pixel-like)
    // To make it circular, uncomment the discard line below:
    // vec2 coord = gl_PointCoord - vec2(0.5);
    // if(length(coord) > 0.5) discard;
    
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

export const ImageParticles: React.FC = () => {
  const { 
    imageSrc, 
    gridSize, 
    noiseStrength, 
    noiseSpeed, 
    noiseFrequency, 
    pointSize,
    rotation 
  } = useStore();
  
  const meshRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0); // Track time manually for smooth speed changes
  
  // Load texture
  const texture = useLoader(THREE.TextureLoader, imageSrc || 'https://picsum.photos/1000/1000');

  // Calculate aspect ratio
  const aspectRatio = useMemo(() => {
    if (texture && texture.image) {
      return texture.image.width / texture.image.height;
    }
    return 1.0;
  }, [texture]);

  // Generate grid attributes
  const { positions, gridUvs } = useMemo(() => {
    const count = gridSize * gridSize;
    const positions = new Float32Array(count * 3);
    const gridUvs = new Float32Array(count * 2);

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index = i * gridSize + j;
        
        // Initial flat positions
        positions[index * 3] = 0;
        positions[index * 3 + 1] = 0;
        positions[index * 3 + 2] = 0;

        // UV coordinates (0 to 1) for texture sampling
        gridUvs[index * 2] = j / (gridSize - 1);
        gridUvs[index * 2 + 1] = i / (gridSize - 1);
      }
    }
    return { positions, gridUvs };
  }, [gridSize]);

  // Create uniforms ONCE. We update .value in useFrame or useEffect.
  // This is crucial for performance and for UI controls to work reliably without rebuilding shaders.
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uNoiseStrength: { value: noiseStrength },
    uNoiseFreq: { value: noiseFrequency },
    uTexture: { value: texture },
    uPointSize: { value: pointSize },
    uAspectRatio: { value: 1.0 }
  }), []); // Empty dependency array ensures reference stability

  // Sync texture and aspect ratio when they load/change
  useEffect(() => {
    if (uniforms.uTexture) uniforms.uTexture.value = texture;
    if (uniforms.uAspectRatio) uniforms.uAspectRatio.value = aspectRatio;
  }, [texture, aspectRatio, uniforms]);

  // Update loop
  useFrame((state, delta) => {
    if (meshRef.current && meshRef.current.material) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      
      // Update time using accumulated delta * speed
      timeRef.current += delta * noiseSpeed;
      material.uniforms.uTime.value = timeRef.current;
      
      // Update other uniforms from store state directly
      material.uniforms.uNoiseStrength.value = noiseStrength;
      material.uniforms.uNoiseFreq.value = noiseFrequency;
      material.uniforms.uPointSize.value = pointSize;
      
      // Interpolate rotation for smooth gesture control
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, rotation[0], 0.1);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, rotation[1], 0.1);
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aGrid"
          count={gridUvs.length / 2}
          array={gridUvs}
          itemSize={2}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};