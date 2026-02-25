import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const TRAIL_LENGTH = 40

interface TrailEffectProps {
  position: THREE.Vector3
}

export function TrailEffect({ position }: TrailEffectProps) {
  const geometryRef = useRef<THREE.BufferGeometry>(null)
  const historyRef = useRef<THREE.Vector3[]>([])

  const positions = useMemo(() => new Float32Array(TRAIL_LENGTH * 3), [])

  useFrame(() => {
    historyRef.current.unshift(position.clone())
    if (historyRef.current.length > TRAIL_LENGTH) {
      historyRef.current.length = TRAIL_LENGTH
    }

    for (let i = 0; i < TRAIL_LENGTH; i++) {
      const p = historyRef.current[i] ?? position
      positions[i * 3] = p.x
      positions[i * 3 + 1] = p.y
      positions[i * 3 + 2] = p.z
    }

    if (geometryRef.current) {
      geometryRef.current.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3),
      )
      geometryRef.current.attributes.position.needsUpdate = true
    }
  })

  return (
    <line>
      <bufferGeometry ref={geometryRef} />
      <lineBasicMaterial
        color="#88aaff"
        transparent
        opacity={0.6}
        linewidth={2}
      />
    </line>
  )
}
