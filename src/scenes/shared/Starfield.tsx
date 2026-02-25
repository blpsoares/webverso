import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface StarfieldProps {
  count?: number
  radius?: number
  speed?: number
}

export function Starfield({ count = 3000, radius = 800, speed = 0 }: StarfieldProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, sizes } = useMemo(() => {
    const pos   = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Distribuição esférica uniforme
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const r     = radius * (0.3 + Math.random() * 0.7)

      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)

      sizes[i] = 0.5 + Math.random() * 2.5
    }
    return { positions: pos, sizes }
  }, [count, radius])

  useFrame((_, delta) => {
    if (pointsRef.current && speed > 0) {
      pointsRef.current.rotation.y += delta * speed
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size"     args={[sizes, 1]}     />
      </bufferGeometry>
      <pointsMaterial
        size={1.2}
        color="#ffffff"
        transparent
        opacity={0.85}
        sizeAttenuation
        vertexColors={false}
      />
    </points>
  )
}
