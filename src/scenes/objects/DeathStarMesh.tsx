import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface DeathStarMeshProps {
  position?: [number, number, number]
  radius?: number
}

/** Estrela da Morte procedural — esfera cinza com prato superlaser emissivo */
export function DeathStarMesh({ position = [20, 5, -80], radius = 10 }: DeathStarMeshProps) {
  const groupRef = useRef<THREE.Group>(null)
  const glowRef  = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    if (groupRef.current) {
      // Rotação lenta
      groupRef.current.rotation.y += 0.0005
    }
    if (glowRef.current) {
      // Pulsar o brilho do superlaser
      glowRef.current.intensity = 1.5 + Math.sin(state.clock.elapsedTime * 0.8) * 0.5
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Corpo principal */}
      <mesh>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial color="#888899" roughness={0.9} metalness={0.2} />
      </mesh>

      {/* Grade de superfície — linhas horizontais */}
      {[-0.5, -0.2, 0.1, 0.4].map((y, i) => (
        <mesh key={`h${i}`} position={[0, y * radius, 0]}>
          <torusGeometry args={[Math.sqrt(radius * radius - (y * radius) ** 2) * 0.99, 0.06, 6, 64]} />
          <meshStandardMaterial color="#666677" />
        </mesh>
      ))}

      {/* Trincheira equatorial */}
      <mesh position={[0, -0.05 * radius, 0]}>
        <torusGeometry args={[radius * 0.99, 0.12, 6, 80]} />
        <meshStandardMaterial color="#444455" />
      </mesh>

      {/* Prato do superlaser — disco côncavo na face norte */}
      <mesh position={[radius * 0.7, radius * 0.3, 0]} rotation={[0, 0, Math.PI / 4]}>
        <circleGeometry args={[radius * 0.35, 48]} />
        <meshStandardMaterial color="#333344" roughness={1} side={THREE.DoubleSide} />
      </mesh>

      {/* Borda do prato */}
      <mesh position={[radius * 0.7, radius * 0.3, 0]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[radius * 0.34, 0.15, 8, 48]} />
        <meshStandardMaterial color="#555566" roughness={0.8} metalness={0.4} />
      </mesh>

      {/* Foco do superlaser (centro do prato) */}
      <mesh position={[radius * 0.72, radius * 0.31, 0]} rotation={[0, 0, Math.PI / 4]}>
        <circleGeometry args={[radius * 0.06, 24]} />
        <meshStandardMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={4} />
      </mesh>

      {/* Luz de glow do superlaser */}
      <pointLight
        ref={glowRef}
        position={[radius * 0.8, radius * 0.35, 0]}
        color="#00ff44"
        intensity={1.5}
        distance={radius * 4}
      />
    </group>
  )
}
