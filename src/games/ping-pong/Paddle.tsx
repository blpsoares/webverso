import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import { useTrackingStore } from '../../store/trackingStore'

interface PaddleProps {
  side: 'left' | 'right'
  defaultPosition: [number, number, number]
}

export function Paddle({ side, defaultPosition }: PaddleProps) {
  const rigidRef = useRef<RapierRigidBody>(null)

  useFrame(() => {
    if (!rigidRef.current) return

    const { handPositions } = useTrackingStore.getState()
    const hand = handPositions[side]

    let tx: number, ty: number, tz: number

    if (hand) {
      // Map hand position to paddle position (constrained near table)
      tx = defaultPosition[0] + hand.x * 0.3
      ty = Math.max(-0.1, Math.min(0.6, hand.y * 0.5 + 0.3))
      tz = defaultPosition[2] + hand.z * 0.1
    } else {
      tx = defaultPosition[0]
      ty = defaultPosition[1]
      tz = defaultPosition[2]
    }

    rigidRef.current.setNextKinematicTranslation({ x: tx, y: ty, z: tz })
  })

  const color = side === 'left' ? '#ff4444' : '#4444ff'

  return (
    <RigidBody
      ref={rigidRef}
      type="kinematicPosition"
      position={defaultPosition}
      colliders="cuboid"
      restitution={0.9}
      name={`paddle_${side}`}
    >
      {/* Handle */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Paddle face */}
      <mesh>
        <boxGeometry args={[0.16, 0.18, 0.008]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Rubber */}
      <mesh position={[0, 0, 0.005]}>
        <boxGeometry args={[0.15, 0.17, 0.002]} />
        <meshStandardMaterial color="#cc0000" roughness={0.9} />
      </mesh>
    </RigidBody>
  )
}
