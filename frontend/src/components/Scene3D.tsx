import { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Interactive Torus Knot (Mobius-like structure)
function InteractiveTorusKnot({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { mouse, viewport } = useThree();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Base rotation
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.1;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.15;
      
      // Mouse interaction - follow cursor smoothly
      const targetX = (mouse.x * viewport.width) / 6;
      const targetY = (mouse.y * viewport.height) / 6;
      
      meshRef.current.position.x += (position[0] + targetX - meshRef.current.position.x) * 0.02;
      meshRef.current.position.y += (position[1] + targetY - meshRef.current.position.y) * 0.02;
      
      // Scale pulse effect on hover
      const scale = hovered ? 1.15 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <torusKnotGeometry args={[5, 1.2, 150, 40]} />
      <meshStandardMaterial
        color="#FFFFFF"
        wireframe
        opacity={hovered ? 0.8 : 0.5}
        transparent
        emissive="#FFFFFF"
        emissiveIntensity={hovered ? 0.6 : 0.3}
      />
    </mesh>
  );
}

// Interactive Planet/Globe - Realistic with high detail
function InteractivePlanet({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { mouse, viewport } = useThree();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Realistic Earth-like rotation (23.5° axial tilt)
      const earthRotationSpeed = 0.05; // Slow, realistic rotation
      const axialTilt = 23.5 * (Math.PI / 180); // 23.5 degrees in radians
      
      meshRef.current.rotation.y = clock.getElapsedTime() * earthRotationSpeed;
      meshRef.current.rotation.z = axialTilt;
      
      // Subtle orbital drift effect
      const orbitSpeed = 0.02;
      const orbitRadius = 0.5;
      meshRef.current.position.x = position[0] + Math.cos(clock.getElapsedTime() * orbitSpeed) * orbitRadius;
      meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * orbitSpeed) * orbitRadius * 0.5;
      
      // Very subtle mouse interaction - planet drifts slightly toward cursor
      const targetX = (mouse.x * viewport.width) / 20;
      const targetY = (mouse.y * viewport.height) / 20;
      
      meshRef.current.position.x += targetX * 0.005;
      meshRef.current.position.y += targetY * 0.005;
      
      // Gentle scale pulse on hover
      const scale = hovered ? 1.08 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.08);
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* High-detail sphere - 64x64 segments for smooth, realistic planet */}
      <sphereGeometry args={[4.5, 64, 64]} />
      <meshStandardMaterial
        color="#D1D5DB"
        wireframe
        opacity={hovered ? 0.8 : 0.5}
        transparent
        emissive="#D1D5DB"
        emissiveIntensity={hovered ? 0.6 : 0.3}
        metalness={0.3}
        roughness={0.7}
      />
    </mesh>
  );
}

export default function Scene3D() {
  return (
    <div className="fixed top-0 left-0 w-full h-full opacity-50" style={{ zIndex: -8, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 75 }} style={{ pointerEvents: 'auto' }}>
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={2.5} color="#FFFFFF" />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#FFFFFF" />
        <pointLight position={[0, 0, 10]} intensity={2} color="#FFFFFF" />
        <spotLight position={[0, 15, 5]} intensity={2} color="#FFFFFF" angle={0.6} />
        
        {/* Interactive Mobius Strip (Center) */}
        <InteractiveTorusKnot position={[0, 0, -5]} />
        
        {/* Interactive Planet (Distant Right) - Realistic Earth-like planet */}
        <InteractivePlanet position={[20, 1, -12]} />
        
        {/* Smooth camera controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.2}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}

