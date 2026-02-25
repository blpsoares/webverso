import { useRef, forwardRef, useImperativeHandle } from 'react'
import { RigidBody } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'

export interface BallHandle {
  reset: (position: [number, number, number]) => void
  applyImpulse: (impulse: { x: number; y: number; z: number }) => void
}

interface BallProps {
  initialPosition?: [number, number, number]
}

export const Ball = forwardRef<BallHandle, BallProps>(function Ball(
  { initialPosition = [0, 0.5, 0] },
  ref,
) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)

  useImperativeHandle(ref, () => ({
    reset(position) {
      if (rigidBodyRef.current) {
        rigidBodyRef.current.setTranslation({ x: position[0], y: position[1], z: position[2] }, true)
        rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
        rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
      }
    },
    applyImpulse(impulse) {
      rigidBodyRef.current?.applyImpulse(impulse, true)
    },
  }))

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={initialPosition}
      colliders="ball"
      restitution={0.85}
      friction={0.3}
      linearDamping={0.1}
      angularDamping={0.1}
      mass={0.0027}
      name="ball"
    >
      <mesh castShadow>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.3} />
      </mesh>
    </RigidBody>
  )
})
