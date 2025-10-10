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

// Stars with constellation lines
function StarField() {
  const meshRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const [stars, lines] = useMemo(() => {
    const starCount = 600; // Increased to 600 for denser filling
    const positions = new Float32Array(starCount * 3);
    const linePositions = [];

    // Use fixed dimensions to prevent buffer resize issues
    const width = 50;
    const height = 30;

    // Generate star positions with wider distribution to fill space
    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * width;
      positions[i * 3 + 1] = (Math.random() - 0.5) * height;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }

    // Create more constellation connections
    for (let i = 0; i < starCount; i++) {
      for (let j = i + 1; j < starCount; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Connect nearby stars - increased distance for more connections
        if (distance < 6) {
          linePositions.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
          );
        }
      }
    }

    return [positions, new Float32Array(linePositions)];
  }, []); // Remove viewport dependency to prevent buffer recreation

  useFrame(({ mouse, clock }) => {
    if (meshRef.current) {
      // Subtle rotation and mouse following
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.02;
      meshRef.current.rotation.x = mouse.y * 0.1;
      meshRef.current.rotation.z = mouse.x * 0.1;
    }
    if (linesRef.current) {
      linesRef.current.rotation.y = clock.getElapsedTime() * 0.02;
      linesRef.current.rotation.x = mouse.y * 0.1;
      linesRef.current.rotation.z = mouse.x * 0.1;
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

