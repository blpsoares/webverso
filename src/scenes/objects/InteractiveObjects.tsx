import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'

interface GrabbableProps {
  position: [number, number, number]
}

// ===== LASER BLASTER =====
export function LaserBlaster(props: GrabbableProps) {
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.userData.interactiveId = 'laser-blaster'
      groupRef.current.userData.isGrabbable = true
    }
  }, [])

  return (
    <group ref={groupRef}>
      <RigidBody type="dynamic" linearDamping={0.3} angularDamping={0.5} {...props}>
        <group>
          {/* Barrel */}
          <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.3, 12]} />
            <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Grip */}
          <mesh position={[-0.05, -0.05, 0]} castShadow>
            <boxGeometry args={[0.08, 0.12, 0.06]} />
            <meshStandardMaterial color="#334455" metalness={0.5} roughness={0.6} />
          </mesh>
          {/* Energy cell glow */}
          <mesh position={[-0.05, 0.05, 0]} castShadow>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshStandardMaterial color="#00ff88" emissive="#00cc66" emissiveIntensity={2} />
          </mesh>
        </group>
      </RigidBody>
    </group>
  )
}

// ===== PLASMA RIFLE =====
export function PlasmaRifle(props: GrabbableProps) {
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.userData.interactiveId = 'plasma-rifle'
      groupRef.current.userData.isGrabbable = true
    }
  }, [])

  return (
    <group ref={groupRef}>
      <RigidBody type="dynamic" linearDamping={0.3} angularDamping={0.5} {...props}>
        <group>
          <mesh position={[0.2, 0, 0]} castShadow>
            <boxGeometry args={[0.35, 0.04, 0.04]} />
            <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Scope */}
          <mesh position={[0.1, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
            <meshStandardMaterial color="#444444" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* Plasma chamber */}
          <mesh position={[0.25, 0, 0]} castShadow>
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshStandardMaterial color="#ff0088" emissive="#ff0066" emissiveIntensity={2.5} />
          </mesh>
        </group>
      </RigidBody>
    </group>
  )
}

// ===== ENERGY CUBE =====
export function EnergyCube(props: GrabbableProps) {
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.userData.interactiveId = 'energy-cube'
      groupRef.current.userData.isGrabbable = true
    }
  }, [])

  return (
    <group ref={groupRef}>
      <RigidBody type="dynamic" linearDamping={0.5} angularDamping={0.5} {...props}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshStandardMaterial color="#00ffff" emissive="#0088ff" emissiveIntensity={1.5} />
        </mesh>
      </RigidBody>
    </group>
  )
}

// ===== HEAVY SPHERE =====
export function HeavySphere(props: GrabbableProps) {
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.userData.interactiveId = 'heavy-sphere'
      groupRef.current.userData.isGrabbable = true
    }
  }, [])

  return (
    <group ref={groupRef}>
      <RigidBody type="dynamic" linearDamping={0.6} angularDamping={0.6} mass={2} {...props}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.12, 32, 32]} />
          <meshStandardMaterial color="#ffaa00" metalness={0.7} roughness={0.4} />
        </mesh>
      </RigidBody>
    </group>
  )
}

// ===== TARGET SPHERE (static) =====
export function TargetSphere(props: GrabbableProps) {
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.userData.interactiveId = 'target-sphere'
    }
  }, [])

  return (
    <group ref={groupRef}>
      <RigidBody type="fixed" {...props}>
        <group>
          {/* Outer sphere */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.15, 32, 32]} />
            <meshStandardMaterial color="#ff0000" emissive="#aa0000" emissiveIntensity={0.8} />
          </mesh>
          {/* Center dot */}
          <mesh position={[0, 0, 0.151]}>
            <circleGeometry args={[0.03, 16]} />
            <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={2} />
          </mesh>
        </group>
      </RigidBody>
    </group>
  )
}

// ===== METAL BAR =====
export function MetalBar(props: GrabbableProps) {
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.userData.interactiveId = 'metal-bar'
      groupRef.current.userData.isGrabbable = true
    }
  }, [])

  return (
    <group ref={groupRef}>
      <RigidBody type="dynamic" linearDamping={0.4} angularDamping={0.4} {...props}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.06, 0.06]} />
          <meshStandardMaterial color="#888888" metalness={0.95} roughness={0.2} />
        </mesh>
      </RigidBody>
    </group>
  )
}

// ===== CUBE STACK (decorative + grabbable) =====
export function CubeStack() {
  return (
    <group position={[5, -0.5, -5]}>
      {[0, 1, 2].map(i => (
        <RigidBody key={i} type="dynamic" position={[0, i * 0.2, 0]} linearDamping={0.5}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.18, 0.18, 0.18]} />
            <meshStandardMaterial
              color={['#ff6b6b', '#4ecdc4', '#ffe66d'][i]}
              metalness={0.3}
              roughness={0.7}
            />
          </mesh>
        </RigidBody>
      ))}
    </group>
  )
}

// ===== SHATTERED ASTEROIDS =====
export function ShatteredAsteroids() {
  const positions: [number, number, number][] = [
    [-3, 0.5, -3],
    [-2.5, 1, -4],
    [-2, 0, -3.5],
    [3, 0.5, -4],
    [3.5, 1.2, -3.5],
  ]

  return (
    <group>
      {positions.map((pos, i) => (
        <RigidBody key={i} type="dynamic" position={pos} linearDamping={0.3}>
          <mesh castShadow receiveShadow>
            <dodecahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial color="#666655" roughness={0.95} metalness={0.1} />
          </mesh>
        </RigidBody>
      ))}
    </group>
  )
}

// ===== WEAPON RACK =====
export function WeaponRack() {
  return (
    <group position={[-5, 0, -6]}>
      {/* Stand */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[0.8, 1.5, 0.3]} />
        <meshStandardMaterial color="#222222" metalness={0.6} roughness={0.6} />
      </mesh>

      {/* Weapon slots */}
      <group position={[-0.2, 0.2, 0]}>
        <LaserBlaster position={[0, 0, 0]} />
      </group>
      <group position={[0.2, -0.1, 0]}>
        <PlasmaRifle position={[0, 0, 0]} />
      </group>
      <group position={[0, -0.5, 0]}>
        <MetalBar position={[0, 0, 0]} />
      </group>
    </group>
  )
}

// ===== TARGET RANGE =====
export function TargetRange() {
  const positions: [number, number, number][] = [
    [0, 1, -8],
    [3, 1.5, -9],
    [-3, 0.8, -8.5],
    [2, 2, -10],
    [-2, 1.2, -11],
  ]

  return (
    <group>
      {positions.map((pos, i) => (
        <TargetSphere key={i} position={pos} />
      ))}
    </group>
  )
}
