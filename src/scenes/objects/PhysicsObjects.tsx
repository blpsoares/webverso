import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, BallCollider } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { useTrackingStore } from '../../store/trackingStore'

/** Bola interativa — empurrada pela proximidade das mãos */
export function InteractiveBall({ position = [0, 0.5, -2] }: { position?: [number, number, number] }) {
  const rbRef  = useRef<RapierRigidBody>(null)
  const prevLeft  = useRef(new THREE.Vector3())
  const prevRight = useRef(new THREE.Vector3())

  useFrame(() => {
    if (!rbRef.current) return
    const { handPositions } = useTrackingStore.getState()
    const pos = rbRef.current.translation()
    const ballPos = new THREE.Vector3(pos.x, pos.y, pos.z)

    for (const [hand, prev] of [
      [handPositions.left,  prevLeft.current ] as const,
      [handPositions.right, prevRight.current] as const,
    ]) {
      if (!hand) continue
      const hv   = new THREE.Vector3(hand.x, hand.y, hand.z)
      const dist = hv.distanceTo(ballPos)

      if (dist < 0.35) {
        const velocity = new THREE.Vector3().subVectors(hv, prev).multiplyScalar(8)
        rbRef.current.applyImpulse({ x: velocity.x, y: velocity.y + 0.02, z: velocity.z }, true)
      }

      prev.set(hand.x, hand.y, hand.z)
    }
  })

  return (
    <RigidBody ref={rbRef} position={position} restitution={0.8} friction={0.5} linearDamping={0.4} angularDamping={0.6}>
      <BallCollider args={[0.18]} />
      <mesh>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial color="#88ccff" emissive="#2244aa" emissiveIntensity={0.8} roughness={0.2} metalness={0.1} />
      </mesh>
      {/* Glow */}
      <pointLight color="#4488ff" intensity={1} distance={2} />
    </RigidBody>
  )
}

/** Balde com pedras — pedras dinâmicas que podem ser espalhadas */
export function RockBucket({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const ROCKS = 8
  const rockRefs = useRef<(RapierRigidBody | null)[]>([])
  const prevLeft  = useRef(new THREE.Vector3())
  const prevRight = useRef(new THREE.Vector3())

  const rockPositions: [number, number, number][] = Array.from({ length: ROCKS }, (_, i) => [
    (Math.random() - 0.5) * 0.25,
    0.3 + i * 0.12,
    0,
  ])

  useFrame(() => {
    const { handPositions } = useTrackingStore.getState()

    for (const [hand, prev] of [
      [handPositions.left,  prevLeft.current ] as const,
      [handPositions.right, prevRight.current] as const,
    ]) {
      if (!hand) continue
      const hv = new THREE.Vector3(hand.x, hand.y, hand.z)

      for (const rb of rockRefs.current) {
        if (!rb) continue
        const p    = rb.translation()
        const rv   = new THREE.Vector3(p.x, p.y, p.z)
        const dist = hv.distanceTo(rv)
        if (dist < 0.3) {
          const vel = new THREE.Vector3().subVectors(hv, prev).multiplyScalar(5)
          rb.applyImpulse({ x: vel.x, y: Math.abs(vel.y) + 0.01, z: vel.z }, true)
        }
      }

      prev.set(hand.x, hand.y, hand.z)
    }
  })

  const rockColors = ['#887766', '#776655', '#998877', '#665544', '#aa9988', '#554433', '#996655', '#775533']

  return (
    <group position={position}>
      {/* Balde */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.22, 0.18, 0.4, 16, 1, true]} />
        <meshStandardMaterial color="#444422" roughness={0.9} metalness={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Fundo do balde */}
      <mesh position={[0, 0, 0]}>
        <circleGeometry args={[0.18, 16]} />
        <meshStandardMaterial color="#444422" roughness={0.9} metalness={0.3} />
      </mesh>

      {/* Pedras */}
      {rockPositions.map((pos, i) => (
        <RigidBody
          key={i}
          ref={(el) => { rockRefs.current[i] = el }}
          position={[pos[0], pos[1], pos[2]]}
          restitution={0.4}
          friction={0.8}
          linearDamping={0.5}
        >
          <BallCollider args={[0.06]} />
          <mesh>
            <dodecahedronGeometry args={[0.07, 0]} />
            <meshStandardMaterial color={rockColors[i % rockColors.length]} roughness={0.95} metalness={0.0} />
          </mesh>
        </RigidBody>
      ))}
    </group>
  )
}
