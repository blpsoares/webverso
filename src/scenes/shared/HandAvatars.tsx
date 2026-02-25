import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTrackingStore } from '../../store/trackingStore'

// Lerp por frame — suaviza a cada render (60fps) independente da taxa do tracking (30fps)
const LERP_FACTOR = 0.25

export function HandAvatars() {
  const leftRef  = useRef<THREE.Mesh>(null)
  const rightRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const { handPositions } = useTrackingStore.getState()

    if (leftRef.current) {
      if (handPositions.left) {
        leftRef.current.visible = true
        leftRef.current.position.lerp(
          new THREE.Vector3(handPositions.left.x, handPositions.left.y, handPositions.left.z),
          LERP_FACTOR,
        )
      } else {
        leftRef.current.visible = false
      }
    }

    if (rightRef.current) {
      if (handPositions.right) {
        rightRef.current.visible = true
        rightRef.current.position.lerp(
          new THREE.Vector3(handPositions.right.x, handPositions.right.y, handPositions.right.z),
          LERP_FACTOR,
        )
      } else {
        rightRef.current.visible = false
      }
    }
  })

  return (
    <>
      <mesh ref={leftRef} visible={false}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#4488ff" emissive="#2244ff" emissiveIntensity={1.5} transparent opacity={0.85} />
      </mesh>
      <mesh ref={rightRef} visible={false}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#ff8844" emissive="#ff4400" emissiveIntensity={1.5} transparent opacity={0.85} />
      </mesh>
    </>
  )
}
