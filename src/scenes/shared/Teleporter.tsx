import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import type { Mesh } from 'three'
import { useSceneStore } from '../../store/sceneStore'
import type { SpaceId } from '../../types/scene'

interface TeleporterProps {
  position: [number, number, number]
  targetSpace: SpaceId
  label: string
  color: string
}

export function Teleporter({ position, targetSpace, label, color }: TeleporterProps) {
  const ringRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { setActiveSpace } = useSceneStore()

  const activate = () => setActiveSpace(targetSpace)

  // Registra o mesh como objeto interativo para o HandPointer
  useEffect(() => {
    const mesh = ringRef.current
    if (!mesh) return
    mesh.userData.interactiveId = `teleporter_${targetSpace}`
    mesh.userData.onActivate = activate
    mesh.userData.onHoverChange = (entering: boolean) => setHovered(entering)
  }, [targetSpace, activate]) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, delta) => {
    if (!ringRef.current) return
    ringRef.current.rotation.y += delta * 0.5
    const target = hovered ? 1.12 : 1.0
    const targetScale = new THREE.Vector3(target, target, target)
    ringRef.current.scale.lerp(targetScale, 0.12)
  })

  return (
    <group position={position}>
      {/* Portal ring — objeto interativo */}
      <mesh
        ref={ringRef}
        onClick={activate}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <torusGeometry args={[1.5, 0.15, 16, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 2.5 : 1}
        />
      </mesh>

      {/* Interior do portal */}
      <mesh>
        <circleGeometry args={[1.35, 64]} />
        <meshStandardMaterial color={color} transparent opacity={hovered ? 0.25 : 0.12} side={2} />
      </mesh>

      {/* Indicador de interação por gesto */}
      {hovered && (
        <Text
          position={[0, -2.4, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Pinch para entrar
        </Text>
      )}

      <Text
        position={[0, -2, 0]}
        fontSize={0.35}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  )
}
