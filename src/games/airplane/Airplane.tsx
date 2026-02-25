import { useRef, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTrackingStore } from '../../store/trackingStore'

const MAX_PITCH = Math.PI / 4
const SPEED = 15

export interface AirplaneHandle {
  getPosition: () => THREE.Vector3
}

interface AirplaneProps {
  onPositionUpdate?: (pos: THREE.Vector3) => void
}

export const Airplane = forwardRef<AirplaneHandle, AirplaneProps>(function Airplane(
  { onPositionUpdate },
  ref,
) {
  const groupRef = useRef<THREE.Group>(null)

  useImperativeHandle(ref, () => ({
    getPosition() {
      return groupRef.current?.position ?? new THREE.Vector3()
    },
  }))

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const { headOrientation } = useTrackingStore.getState()

    // Head controls the airplane
    const targetPitch = THREE.MathUtils.clamp(headOrientation.pitch * 1.5, -MAX_PITCH, MAX_PITCH)
    const targetYaw = headOrientation.yaw * 1.2

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetPitch, 0.05)
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetYaw, 0.05)

    // Move forward in local direction
    const forward = new THREE.Vector3(0, 0, -1)
    forward.applyQuaternion(groupRef.current.quaternion)
    groupRef.current.position.addScaledVector(forward, SPEED * delta)

    // Minimum altitude
    groupRef.current.position.y = Math.max(-5, groupRef.current.position.y)

    onPositionUpdate?.(groupRef.current.position)
  })

  return (
    <group ref={groupRef} position={[0, 10, 0]}>
      {/* Fuselage */}
      <mesh castShadow>
        <cylinderGeometry args={[0.15, 0.3, 2.5, 12]} />
        <meshStandardMaterial color="#ccddee" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Wings */}
      <mesh position={[0, 0.1, -0.2]} castShadow>
        <boxGeometry args={[3.5, 0.08, 0.6]} />
        <meshStandardMaterial color="#bbccdd" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Tail horizontal */}
      <mesh position={[0, 0.3, 1]} castShadow>
        <boxGeometry args={[1.5, 0.06, 0.3]} />
        <meshStandardMaterial color="#bbccdd" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Tail vertical */}
      <mesh position={[0, 0.6, 0.9]} castShadow>
        <boxGeometry args={[0.06, 0.5, 0.4]} />
        <meshStandardMaterial color="#bbccdd" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Cockpit */}
      <mesh position={[0, 0.2, -0.9]}>
        <sphereGeometry args={[0.2, 12, 8]} />
        <meshStandardMaterial color="#88aabb" transparent opacity={0.6} roughness={0.1} metalness={0.3} />
      </mesh>

      {/* Engine glow */}
      <pointLight color="#ff8800" intensity={2} distance={3} position={[0, 0, 0.5]} />
    </group>
  )
})
