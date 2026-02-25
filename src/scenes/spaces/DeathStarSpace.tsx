import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { Starfield } from '../shared/Starfield'
import { Teleporter } from '../shared/Teleporter'

function ReactorShaft() {
  const beamRef  = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (beamRef.current) {
      beamRef.current.material instanceof THREE.MeshStandardMaterial &&
        (beamRef.current.material.emissiveIntensity = 1.5 + Math.sin(t * 2) * 0.5)
    }
    if (lightRef.current) {
      lightRef.current.intensity = 3 + Math.sin(t * 3) * 1
    }
  })

  return (
    <group position={[0, -1, 0]}>
      {/* Shaft principal — cilindro subindo */}
      <mesh position={[0, 25, 0]}>
        <cylinderGeometry args={[3, 3, 50, 32, 1, true]} />
        <meshStandardMaterial color="#111118" side={THREE.BackSide} roughness={0.8} />
      </mesh>

      {/* Feixe de energia */}
      <mesh ref={beamRef} position={[0, 20, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 40, 12]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2} transparent opacity={0.6} />
      </mesh>

      {/* Anéis do shaft */}
      {[5, 12, 20, 28, 36].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[2.9, 0.15, 8, 48]} />
          <meshStandardMaterial color="#222233" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {/* Luz do reactor */}
      <pointLight ref={lightRef} position={[0, 5, 0]} color="#00ff88" intensity={4} distance={30} />
    </group>
  )
}

function ImperialCatwalk() {
  return (
    <group position={[0, -1.5, 0]}>
      {/* Plataforma central */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[8, 0.15, 3]} />
        <meshStandardMaterial color="#1a1a22" roughness={0.6} metalness={0.7} />
      </mesh>

      {/* Corrimões */}
      {[-1.45, 1.45].map((z, i) => (
        <group key={i}>
          <mesh position={[0, 0.4, z]}>
            <boxGeometry args={[8, 0.05, 0.04]} />
            <meshStandardMaterial color="#333344" metalness={0.9} roughness={0.2} />
          </mesh>
          {[-3.5, -2.3, -1.1, 0, 1.1, 2.3, 3.5].map((x, j) => (
            <mesh key={j} position={[x, 0.2, z]}>
              <cylinderGeometry args={[0.025, 0.025, 0.4, 6]} />
              <meshStandardMaterial color="#222233" metalness={0.9} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Luzes de piso */}
      {[-3, -1, 0, 1, 3].map((x, i) => (
        <mesh key={i} position={[x, 0.08, 0]}>
          <boxGeometry args={[0.3, 0.02, 0.3]} />
          <meshStandardMaterial color="#334455" emissive="#112233" emissiveIntensity={2} />
        </mesh>
      ))}
    </group>
  )
}

function ImperialWalls() {
  const panels = [
    // Parede esquerda
    { pos: [-8, 2, 0] as [number,number,number], rot: [0, Math.PI/2, 0] as [number,number,number], w: 20, h: 8 },
    // Parede direita
    { pos: [8, 2, 0]  as [number,number,number], rot: [0, -Math.PI/2, 0] as [number,number,number], w: 20, h: 8 },
    // Parede traseira
    { pos: [0, 2, 8]  as [number,number,number], rot: [0, Math.PI, 0] as [number,number,number], w: 16, h: 8 },
    // Teto (anel)
    { pos: [0, 5, 0]  as [number,number,number], rot: [0, 0, 0] as [number,number,number], w: 0, h: 0, isRing: true },
  ]

  return (
    <>
      {panels.filter((p) => !p.isRing).map((p, i) => (
        <group key={i} position={p.pos} rotation={p.rot}>
          <mesh>
            <planeGeometry args={[p.w, p.h, 6, 4]} />
            <meshStandardMaterial color="#0d0d15" roughness={0.7} metalness={0.5} side={THREE.FrontSide} />
          </mesh>
          {/* Grade de painéis */}
          {[-2, 0, 2].map((x, j) => (
            <mesh key={j} position={[x * 2.5, 0, 0.02]}>
              <boxGeometry args={[2.2, p.h - 0.5, 0.04]} />
              <meshStandardMaterial color="#0a0a12" roughness={0.8} metalness={0.6} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Anel do teto */}
      <mesh position={[0, 5, 0]}>
        <torusGeometry args={[7.5, 1.5, 6, 32]} />
        <meshStandardMaterial color="#0d0d15" roughness={0.7} metalness={0.5} />
      </mesh>
    </>
  )
}

function ViewPort() {
  return (
    <group position={[0, 1.5, -7.5]}>
      {/* Moldura */}
      <mesh>
        <torusGeometry args={[1.5, 0.12, 8, 4]} />
        <meshStandardMaterial color="#222233" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* Janela — vidro */}
      <mesh position={[0, 0, 0.05]}>
        <circleGeometry args={[1.38, 32]} />
        <meshStandardMaterial color="#001122" transparent opacity={0.5} roughness={0} metalness={0.1} />
      </mesh>
      {/* Luz através da janela */}
      <pointLight position={[0, 0, -1]} color="#aabbff" intensity={0.8} distance={10} />
    </group>
  )
}

export function DeathStarSpace() {
  return (
    <group>
      <color attach="background" args={['#030308']} />
      <fog attach="fog" args={['#030308', 15, 60]} />

      {/* Iluminação imperial */}
      <ambientLight intensity={0.08} color="#334455" />
      <pointLight position={[0, 4, -2]} color="#334466" intensity={1.5} distance={20} />

      {/* Estrelas visíveis através da janela (longe) */}
      <Starfield count={1500} radius={200} />

      {/* Elementos da sala */}
      <ReactorShaft />
      <ImperialCatwalk />
      <ImperialWalls />
      <ViewPort />

      {/* Consoles imperiais */}
      {[-3, 3].map((x, i) => (
        <group key={i} position={[x, -1.1, -5]}>
          <mesh>
            <boxGeometry args={[1.5, 0.7, 0.8]} />
            <meshStandardMaterial color="#0a0a14" roughness={0.7} metalness={0.8} />
          </mesh>
          {[-0.4, 0, 0.4].map((dx, j) => (
            <mesh key={j} position={[dx, 0.37, -0.15]}>
              <boxGeometry args={[0.25, 0.08, 0.3]} />
              <meshStandardMaterial
                color={['#ff3333', '#33ff66', '#3366ff'][j]}
                emissive={['#cc1111', '#22cc44', '#2244cc'][j]}
                emissiveIntensity={2}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Texto ambiental */}
      <Text position={[0, 3.8, -3]} fontSize={0.35} color="#334455" anchorX="center">
        DEATH STAR — SECTOR 7G
      </Text>

      {/* Hologram table — mapa da galáxia */}
      <group position={[0, -1.1, -3]}>
        <mesh>
          <cylinderGeometry args={[0.6, 0.7, 0.8, 16]} />
          <meshStandardMaterial color="#0a0a14" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.05, 24]} />
          <meshStandardMaterial color="#001122" emissive="#003366" emissiveIntensity={2} transparent opacity={0.8} />
        </mesh>
        {/* Mini galáxia */}
        <mesh position={[0, 0.6, 0]}>
          <torusGeometry args={[0.3, 0.04, 6, 32]} />
          <meshStandardMaterial color="#0044aa" emissive="#0066ff" emissiveIntensity={2} transparent opacity={0.7} />
        </mesh>
        <pointLight position={[0, 0.8, 0]} color="#0066ff" intensity={1.5} distance={3} />
      </group>

      {/* Portal de volta */}
      <Teleporter position={[0, 1, 6]} targetSpace="hub" label="Voltar à Nave" color="#aa44ff" />
    </group>
  )
}
