import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { RigidBody } from '@react-three/rapier'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { Starfield } from '../shared/Starfield'
import { Teleporter } from '../shared/Teleporter'
import { Door } from '../objects/Door'
import { Lightsaber } from '../objects/Lightsaber'
import { InteractiveBall, RockBucket } from '../objects/PhysicsObjects'
import {
  LaserBlaster,
  PlasmaRifle,
  EnergyCube,
  HeavySphere,
  MetalBar,
  CubeStack,
  ShatteredAsteroids,
  WeaponRack,
  TargetRange,
} from '../objects/InteractiveObjects'

function HologramPlanet() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.3
  })
  return (
    <mesh ref={ref} position={[-2.5, 0.2, -2]}>
      <sphereGeometry args={[0.35, 24, 24]} />
      <meshStandardMaterial color="#004488" emissive="#002266" emissiveIntensity={1.5} wireframe transparent opacity={0.7} />
    </mesh>
  )
}

function AsteroidField() {
  const refs = useRef<THREE.Mesh[]>([])
  const asteroids = Array.from({ length: 20 }, (_, i) => ({
    pos: new THREE.Vector3(
      (Math.random() - 0.5) * 120,
      (Math.random() - 0.5) * 40,
      -30 - Math.random() * 100,
    ),
    scale: 0.3 + Math.random() * 1.2,
    speed: 0.05 + Math.random() * 0.1,
  }))

  useFrame((_, delta) => {
    refs.current.forEach((m, i) => {
      if (m) m.rotation.x += asteroids[i].speed * delta
    })
  })

  return (
    <>
      {asteroids.map((a, i) => (
        <mesh key={i} ref={(el) => { if (el) refs.current[i] = el }} position={a.pos} scale={a.scale}>
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color="#666655" roughness={0.95} metalness={0.1} />
        </mesh>
      ))}
    </>
  )
}

function NebulaCloud() {
  return (
    <>
      {[
        { pos: [-40, 10, -60] as [number,number,number], color: '#220033', r: 18 },
        { pos: [30, -5, -90] as [number,number,number], color: '#002211', r: 22 },
        { pos: [-20, 20, -120] as [number,number,number], color: '#110022', r: 30 },
      ].map((n, i) => (
        <mesh key={i} position={n.pos}>
          <sphereGeometry args={[n.r, 8, 8]} />
          <meshStandardMaterial color={n.color} transparent opacity={0.18} side={THREE.BackSide} />
        </mesh>
      ))}
    </>
  )
}

export function GalaxyHubSpace() {
  return (
    <group>
      {/* Fundo — espaço profundo */}
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 100, 500]} />

      {/* Iluminação ambiente espacial */}
      <ambientLight intensity={0.2} color="#6666aa" />
      <directionalLight position={[-40, 30, 20]} intensity={0.6} color="#aabbff" />
      <pointLight position={[0, 5, 0]} color="#ffffff" intensity={1} distance={50} />

      {/* Estrelas infinitas */}
      <Starfield count={8000} radius={1000} />

      {/* Nébulas de fundo */}
      <NebulaCloud />

      {/* Estrela pequena (sun) longe */}
      <mesh position={[-60, 20, -200]}>
        <sphereGeometry args={[4, 16, 16]} />
        <meshStandardMaterial color="#ffffaa" emissive="#ffff88" emissiveIntensity={3} />
      </mesh>
      <pointLight position={[-60, 20, -200]} color="#ffffaa" intensity={3} distance={400} />

      {/* Portal para Estrela da Morte */}
      <group position={[0, 1.5, -12]}>
        <Teleporter
          position={[0, 0, 0]}
          targetSpace="deathstar"
          label="⚡ ENTRAR"
          color="#00ffff"
        />
      </group>

      {/* Physics para objetos interativos */}
      <Physics gravity={[0, -9.8, 0]}>
        {/* Chão (invisível) */}
        <RigidBody type="fixed" position={[0, 1.6, 0]}>
          <mesh visible={false}>
            <boxGeometry args={[100, 1, 100]} />
          </mesh>
        </RigidBody>

        {/* ===== ZONE 1: Weapon Rack (esquerda) ===== */}
        <WeaponRack />

        {/* ===== ZONE 2: Lightsabers (centro) ===== */}
        <group position={[0, 0, 0]}>
          <Lightsaber
            id="saber_blue"
            color="#00ffff"
            emissiveColor="#0088ff"
            restPosition={[-1, 0.5, 0]}
            restRotation={[0.3, 0.2, 0]}
            handSide="left"
          />
          <Lightsaber
            id="saber_red"
            color="#ff6666"
            emissiveColor="#ff0000"
            restPosition={[1, 0.5, 0]}
            restRotation={[0.3, -0.2, 0]}
            handSide="right"
          />
        </group>

        {/* ===== ZONE 3: Energy Objects (direita) ===== */}
        <group position={[5, 0.5, 0]}>
          <EnergyCube position={[0, 0, 0]} />
          <HeavySphere position={[0.3, 0, -0.4]} />
          <EnergyCube position={[-0.4, 0.2, 0.2]} />
        </group>

        {/* ===== ZONE 4: Target Range (frente) ===== */}
        <TargetRange />

        {/* ===== ZONE 5: Decorative Objects ===== */}
        <CubeStack />
        <ShatteredAsteroids />

        {/* Bola original */}
        <InteractiveBall position={[0, 1.5, -4]} />

        {/* Balde com pedras */}
        <RockBucket position={[-3, 0, 2]} />
      </Physics>

      {/* Texto de boas-vindas */}
      <Text position={[0, 4, 0]} fontSize={0.6} color="#00ffff" anchorX="center" anchorY="middle">
        ⚔️ ARENA ESPACIAL ⚔️
      </Text>
      <Text position={[0, 3, 0]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle">
        Pegue as armas, atire nos alvos, jogue objetos • Use mouse para drag/drop
      </Text>
    </group>
  )
}
