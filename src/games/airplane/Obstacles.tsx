import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { useGameStore } from '../../store/gameStore'

interface Ring {
  id: number
  position: [number, number, number]
  passed: boolean
}

interface ObstaclesProps {
  airplanePosition: { x: number; y: number; z: number }
}

const RING_COUNT = 10
const RING_SPACING = 80

function generateRings(): Ring[] {
  return Array.from({ length: RING_COUNT }, (_, i) => ({
    id: i,
    position: [
      (Math.random() - 0.5) * 40,
      5 + Math.random() * 20,
      -(i + 1) * RING_SPACING,
    ] as [number, number, number],
    passed: false,
  }))
}

export function Obstacles({ airplanePosition }: ObstaclesProps) {
  const ringsRef = useRef<Ring[]>(generateRings())
  const groupsRef = useRef<(Group | null)[]>([])
  const { incrementAirplaneRings } = useGameStore()

  useFrame(() => {
    ringsRef.current.forEach((ring, i) => {
      if (ring.passed) return

      const dx = airplanePosition.x - ring.position[0]
      const dy = airplanePosition.y - ring.position[1]
      const dz = airplanePosition.z - ring.position[2]

      // Check if airplane passed through the ring
      if (Math.abs(dz) < 3 && Math.sqrt(dx * dx + dy * dy) < 4) {
        ring.passed = true
        incrementAirplaneRings()
      }

      // If too far behind, recycle ring ahead
      if (airplanePosition.z - ring.position[2] > 50) {
        ring.position = [
          (Math.random() - 0.5) * 40,
          5 + Math.random() * 20,
          airplanePosition.z - RING_SPACING * (RING_COUNT - i),
        ]
        ring.passed = false
      }
    })
  })

  return (
    <>
      {ringsRef.current.map((ring, i) => (
        <group
          key={ring.id}
          ref={(el) => {
            groupsRef.current[i] = el
          }}
          position={ring.position}
        >
          <mesh>
            <torusGeometry args={[4, 0.4, 16, 64]} />
            <meshStandardMaterial
              color={ring.passed ? '#444' : '#ffaa00'}
              emissive={ring.passed ? '#000' : '#884400'}
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      ))}
    </>
  )
}
