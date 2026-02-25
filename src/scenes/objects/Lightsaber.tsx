import { useRef, useState, useCallback, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTrackingStore } from '../../store/trackingStore'
import { useGestureStore } from '../../store/gestureStore'

interface LightsaberProps {
  id: string
  color: string
  emissiveColor: string
  restPosition: [number, number, number]
  restRotation?: [number, number, number]
  handSide: 'left' | 'right'
}

const GRAB_DISTANCE = 1.0  // metros para grab

export function Lightsaber({
  id, color, emissiveColor, restPosition, restRotation = [0, 0, 0], handSide,
}: LightsaberProps) {
  const groupRef  = useRef<THREE.Group>(null)
  const bladeRef  = useRef<THREE.Mesh>(null)
  const lightRef  = useRef<THREE.PointLight>(null)
  const [ignited, setIgnited] = useState(false)
  const [grabbed, setGrabbed] = useState(false)
  const bladeScaleY = useRef(0)

  // Posição de descanso (animação de retorno)
  const restPos = useRef(new THREE.Vector3(...restPosition))
  const restRot = useRef(new THREE.Euler(...restRotation))

  // Registra como interativo para HandPointer e MouseController
  useEffect(() => {
    if (!groupRef.current) return
    groupRef.current.userData.interactiveId = id
    groupRef.current.userData.isGrabbable = true
    groupRef.current.userData.onActivate = () => {
      setIgnited((v) => !v)
    }
    groupRef.current.userData.onGrabStart = () => {
      setGrabbed(true)
      setIgnited(true)
    }
    groupRef.current.userData.onGrabEnd = () => {
      setGrabbed(false)
    }
  }, [id])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return

    const { handPositions, handTrackingEnabled } = useTrackingStore.getState()
    const { leftGesture, rightGesture } = useGestureStore.getState()

    // Hand tracking mode
    if (handTrackingEnabled) {
      const handPos = handPositions[handSide]
      const gesture = handSide === 'left' ? leftGesture : rightGesture
      const isPinching = gesture === 'PINCH' || gesture === 'CLOSED_FIST'

      if (handPos) {
        const hv = new THREE.Vector3(handPos.x, handPos.y, handPos.z)
        const dist = hv.distanceTo(group.position)

        if (dist < GRAB_DISTANCE && isPinching && !grabbed) {
          setGrabbed(true)
          setIgnited(true)
        }
        if (grabbed && !isPinching) {
          setGrabbed(false)
        }
        if (grabbed) {
          // Segue a mão com lerp
          group.position.lerp(hv, 0.35)
          group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, 0, 0.1)
          group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, 0, 0.1)
        }
      } else if (grabbed) {
        setGrabbed(false)
      }
    }

    // Retorna para posição de descanso se não estiver sendo segurado
    if (!grabbed) {
      group.position.lerp(restPos.current, 0.06)
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, restRot.current.x, 0.06)
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, restRot.current.y, 0.06)
      group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, restRot.current.z, 0.06)
    }

    // Anima a lâmina (escala Y)
    const targetScale = ignited ? 1 : 0
    bladeScaleY.current = THREE.MathUtils.lerp(bladeScaleY.current, targetScale, 0.15)
    if (bladeRef.current) {
      bladeRef.current.scale.y = bladeScaleY.current
      bladeRef.current.visible = bladeScaleY.current > 0.01
    }
    if (lightRef.current) {
      lightRef.current.intensity = ignited ? (2.5 + Math.sin(Date.now() * 0.01) * 0.3) : 0
    }
  })

  return (
    <group ref={groupRef} position={restPosition} rotation={restRotation}>
      {/* Cabo */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.28, 12]} />
        <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* Guarda */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.04, 12]} />
        <meshStandardMaterial color="#555555" roughness={0.4} metalness={0.9} />
      </mesh>
      {/* Detalhes do cabo */}
      {[-0.06, 0, 0.06].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.041, 0.006, 6, 16]} />
          <meshStandardMaterial color="#333333" metalness={1} roughness={0.2} />
        </mesh>
      ))}

      {/* Lâmina (pivot no base) */}
      <mesh ref={bladeRef} position={[0, 0.18 + 0.5, 0]} scale={[1, 0, 1]}>
        <cylinderGeometry args={[0.025, 0.015, 1.0, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={3}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Glow da lâmina */}
      <mesh position={[0, 0.18 + 0.5, 0]} scale={[1, bladeScaleY.current, 1]}>
        <cylinderGeometry args={[0.045, 0.025, 1.05, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={1}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Luz ponto */}
      <pointLight
        ref={lightRef}
        position={[0, 0.9, 0]}
        color={emissiveColor}
        intensity={0}
        distance={4}
      />
    </group>
  )
}
