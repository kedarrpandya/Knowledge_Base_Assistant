import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, useSphere, useBox } from '@react-three/cannon';
import * as THREE from 'three';

// Interactive physics sphere that responds to mouse
function PhysicsSphere({ position }: { position: [number, number, number] }) {
  const [ref, api] = useSphere<THREE.Mesh>(() => ({
    mass: 1,
    position,
    args: [0.3],
  }));

  const [hovered, setHovered] = useState(false);

  useFrame(({ mouse, viewport }) => {
    // Apply realistic force towards mouse position with physics
    const x = (mouse.x * viewport.width) / 2;
    const y = (mouse.y * viewport.height) / 2;
    
    // Apply force with damping for realistic physics
    api.applyForce([x * 0.08, y * 0.08, 0], [0, 0, 0]);
  });

  return (
    <mesh
      ref={ref}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial
        color="#FFFFFF"
        emissive="#FFFFFF"
        emissiveIntensity={hovered ? 0.8 : 0.4}
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={hovered ? 1 : 0.7}
      />
    </mesh>
  );
}

// Boundaries to keep physics objects in view
function Boundaries() {
  useBox(() => ({ position: [0, -10, 0], args: [100, 1, 100], type: 'Static' }));
  useBox(() => ({ position: [0, 10, 0], args: [100, 1, 100], type: 'Static' }));
  useBox(() => ({ position: [-15, 0, 0], args: [1, 100, 100], type: 'Static' }));
  useBox(() => ({ position: [15, 0, 0], args: [1, 100, 100], type: 'Static' }));
  return null;
}

// Stars with constellation lines - OPTIMIZED for clarity
function StarField() {
  const meshRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const starPositionsRef = useRef<Float32Array | null>(null);

  const [stars, lines] = useMemo(() => {
    const starCount = 300; // Reduced from 600 for clearer view
    const positions = new Float32Array(starCount * 3);
    const linePositions = [];

    // Use fixed dimensions to prevent buffer resize issues
    const width = 60;
    const height = 35;

    // Generate star positions with wider distribution to fill space
    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * width;
      positions[i * 3 + 1] = (Math.random() - 0.5) * height;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }

    // Create FEWER constellation connections for clarity
    for (let i = 0; i < starCount; i++) {
      for (let j = i + 1; j < starCount; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Connect only VERY nearby stars - reduced from 6 to 4 for clarity
        if (distance < 4) {
          linePositions.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
          );
        }
      }
    }

    starPositionsRef.current = positions;
    return [positions, new Float32Array(linePositions)];
  }, []); // Remove viewport dependency to prevent buffer recreation

  useFrame(({ mouse, clock, viewport }) => {
    const mouseX = (mouse.x * viewport.width) / 2;
    const mouseY = (mouse.y * viewport.height) / 2;
    
    if (meshRef.current && starPositionsRef.current) {
      const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
      const originalPositions = starPositionsRef.current;
      
      // Interactive cursor following - stars move to create path
      for (let i = 0; i < positions.length / 3; i++) {
        const dx = mouseX - originalPositions[i * 3];
        const dy = mouseY - originalPositions[i * 3 + 1];
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Stars within range move away from cursor to create path
        if (distance < 8) {
          const force = (1 - distance / 8) * 2;
          positions[i * 3] = originalPositions[i * 3] - (dx / distance) * force;
          positions[i * 3 + 1] = originalPositions[i * 3 + 1] - (dy / distance) * force;
        } else {
          // Smoothly return to original position
          positions[i * 3] += (originalPositions[i * 3] - positions[i * 3]) * 0.05;
          positions[i * 3 + 1] += (originalPositions[i * 3 + 1] - positions[i * 3 + 1]) * 0.05;
        }
      }
      
      meshRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Subtle rotation
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.01;
      meshRef.current.rotation.x = mouse.y * 0.05;
    }
    
    if (linesRef.current) {
      linesRef.current.rotation.y = clock.getElapsedTime() * 0.01;
      linesRef.current.rotation.x = mouse.y * 0.05;
    }
  });

  return (
    <>
      {/* Stars */}
      <points ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={stars.length / 3}
            array={stars}
            args={[stars, 3]}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.2}
          color="#FFFFFF"
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>

      {/* Constellation Lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={lines.length / 3}
            array={lines}
            args={[lines, 3]}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#E5E7EB"
          transparent
          opacity={0.35}
          linewidth={1}
        />
      </lineSegments>
    </>
  );
}

// Mouse trail effect with proper typing - FIXED buffer size issues
function MouseTrail() {
  const lineRef = useRef<THREE.Line>(null);
  const positions = useRef<number[]>([]);
  const maxPoints = 30;
  
  // Pre-allocate geometry with fixed size to prevent buffer errors
  const lineObject = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({ 
      color: '#FFFFFF', 
      transparent: true, 
      opacity: 0.5 
    });
    
    // Pre-allocate buffer with max size
    const initialPositions = new Float32Array(maxPoints * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(initialPositions, 3));
    geometry.setDrawRange(0, 0); // Start with no visible points
    
    return new THREE.Line(geometry, material);
  }, [maxPoints]);

  useFrame(({ mouse, viewport }) => {
    const x = (mouse.x * viewport.width) / 2;
    const y = (mouse.y * viewport.height) / 2;

    // Add new position
    positions.current.unshift(x, y, 0);

    // Keep only last N points
    if (positions.current.length > maxPoints * 3) {
      positions.current = positions.current.slice(0, maxPoints * 3);
    }

    // Update geometry with fixed buffer size
    if (lineRef.current && positions.current.length >= 6) {
      const geometry = lineRef.current.geometry as THREE.BufferGeometry;
      const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
      
      const pointCount = Math.min(positions.current.length / 3, maxPoints);
      
      // Update buffer values
      for (let i = 0; i < pointCount; i++) {
        positionAttribute.setXYZ(
          i,
          positions.current[i * 3] || 0,
          positions.current[i * 3 + 1] || 0,
          positions.current[i * 3 + 2] || 0
        );
      }
      
      positionAttribute.needsUpdate = true;
      geometry.setDrawRange(0, pointCount);
    }
  });

  return <primitive object={lineObject} ref={lineRef} />;
}

export default function StarConstellation() {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10" style={{ background: '#000000' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 75 }}>
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#FFFFFF" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#E5E7EB" />

        {/* Star Constellation Background */}
        <StarField />

        {/* Physics World */}
        <Physics gravity={[0, 0, 0]} iterations={10}>
          <Boundaries />
          
          {/* More interactive physics spheres to fill space */}
          <PhysicsSphere position={[-3, 2, 0]} />
          <PhysicsSphere position={[3, -2, 0]} />
          <PhysicsSphere position={[0, 3, -2]} />
          <PhysicsSphere position={[-4, -3, 1]} />
          <PhysicsSphere position={[4, 3, -1]} />
          <PhysicsSphere position={[0, -4, 2]} />
          <PhysicsSphere position={[2, 0, -3]} />
          <PhysicsSphere position={[-2, 0, 3]} />
          <PhysicsSphere position={[-5, 0, -2]} />
          <PhysicsSphere position={[5, 0, 2]} />
          <PhysicsSphere position={[0, -5, -1]} />
          <PhysicsSphere position={[0, 5, 1]} />
          <PhysicsSphere position={[-3, -4, -2]} />
          <PhysicsSphere position={[3, 4, 2]} />
          <PhysicsSphere position={[-4, 4, 0]} />
        </Physics>

        {/* Mouse trail */}
        <MouseTrail />
      </Canvas>
    </div>
  );
}

