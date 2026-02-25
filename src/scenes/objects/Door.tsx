import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface DoorProps {
  position: [number, number, number]
  width?: number
  height?: number
  onOpen?: () => void
}

export function Door({ position, width = 1.2, height = 2.5, onOpen }: DoorProps) {
  const groupRef = useRef<THREE.Group>(null)
  const doorRef = useRef<THREE.Group>(null)
  const isOpenRef = useRef(false)
  const targetRotationRef = useRef(0)

  useEffect(() => {
    if (!groupRef.current) return

    const group = groupRef.current
    group.userData.interactiveId = 'door'
    group.userData.onActivate = () => {
      if (!isOpenRef.current) {
        isOpenRef.current = true
        targetRotationRef.current = Math.PI / 2
        onOpen?.()
      }
    }
    group.userData.onHoverChange = (hovering: boolean) => {
      if (doorRef.current) {
        doorRef.current.children.forEach(child => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.emissive.setHex(hovering ? 0x444444 : 0x000000)
          }
        })
      }
    }
  }, [onOpen])

  useFrame(() => {
    if (!doorRef.current) return

    const current = doorRef.current.rotation.y
    const target = targetRotationRef.current
    const diff = target - current

    // Smoothly animate door rotation
    if (Math.abs(diff) > 0.01) {
      doorRef.current.rotation.y += diff * 0.1
    } else {
      doorRef.current.rotation.y = target
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Door frame */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width + 0.2, height, 0.1]} />
        <meshStandardMaterial color="#444444" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Sliding door panel */}
      <group ref={doorRef}>
        <mesh position={[width / 2, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, height, 0.08]} />
          <meshStandardMaterial
            color="#333333"
            roughness={0.6}
            metalness={0.4}
          />
        </mesh>

        {/* Door details */}
        <mesh position={[width * 0.7, height / 2, 0.05]}>
          <circleGeometry args={[0.12, 32]} />
          <meshStandardMaterial color="#888888" metalness={0.8} />
        </mesh>

        {/* Light strip on door */}
        <mesh position={[width / 4, height / 2, 0.05]}>
          <boxGeometry args={[0.3, height * 0.6, 0.02]} />
          <meshStandardMaterial color="#00ffff" emissive="#00aaaa" />
        </mesh>
      </group>

      {/* Door open indicator */}
      {isOpenRef.current && (
        <mesh position={[width * 0.8, height * 0.9, -0.2]}>
          <boxGeometry args={[0.2, 0.2, 0.05]} />
          <meshStandardMaterial color="#00ff00" emissive="#00aa00" />
        </mesh>
      )}
    </group>
  )
}
