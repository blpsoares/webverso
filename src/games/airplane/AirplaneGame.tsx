import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Airplane } from './Airplane'
import { Terrain } from './Terrain'
import { Obstacles } from './Obstacles'
import { TrailEffect } from './TrailEffect'
import { useGameStore } from '../../store/gameStore'
import type { AirplaneHandle } from './Airplane'

export function AirplaneGame() {
  const airplaneRef = useRef<AirplaneHandle>(null)
  const airplanePosRef = useRef(new THREE.Vector3(0, 10, 0))
  const { camera } = useThree()
  const { setAirplanePlaying } = useGameStore()
  const [airplanePos, setAirplanePos] = useState({ x: 0, y: 10, z: 0 })

  useEffect(() => {
    setAirplanePlaying(true)
    return () => setAirplanePlaying(false)
  }, [setAirplanePlaying])

  const cameraOffset = new THREE.Vector3(0, 3, 12)
  const cameraTarget = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    const pos = airplaneRef.current?.getPosition()
    if (!pos) return

    airplanePosRef.current.copy(pos)

    // Camera follows airplane with lag
    const idealPos = pos.clone().add(cameraOffset)
    camera.position.lerp(idealPos, 0.08)

    cameraTarget.current.lerp(pos, 0.1)
    camera.lookAt(cameraTarget.current)

    setAirplanePos({ x: pos.x, y: pos.y, z: pos.z })
  })

  const handlePositionUpdate = (pos: THREE.Vector3) => {
    airplanePosRef.current.copy(pos)
  }

  return (
    <group>
      {/* Sky */}
      <color attach="background" args={['#1a3a6e']} />
      <fog attach="fog" args={['#1a3a6e', 50, 300]} />

      {/* Clouds */}
      {Array.from({ length: 15 }, (_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 200,
            20 + Math.random() * 30,
            -i * 50 - 20,
          ]}
        >
          <sphereGeometry args={[3 + Math.random() * 4, 8, 6]} />
          <meshStandardMaterial color="white" transparent opacity={0.7} />
        </mesh>
      ))}

      <Terrain />
      <Airplane ref={airplaneRef} onPositionUpdate={handlePositionUpdate} />
      <TrailEffect position={airplanePosRef.current} />
      <Obstacles airplanePosition={airplanePos} />

      {/* Sun */}
      <directionalLight
        position={[100, 100, -100]}
        intensity={2}
        color="#fffaee"
        castShadow
      />
      <ambientLight intensity={0.4} color="#88aabb" />
    </group>
  )
}
