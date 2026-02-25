import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/** Cockpit interno de uma nave — quadro ao redor da janela para imersão */
export function SpaceshipCockpit() {
  const lightRef = useRef<THREE.PointLight>(null)

  // Pulsar a luz dos instrumentos
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 0.4 + Math.sin(state.clock.elapsedTime * 1.2) * 0.1
    }
  })

  const panelMat = (
    <meshStandardMaterial color="#0a0a10" roughness={0.8} metalness={0.6} />
  )

  return (
    <group>
      {/* Painel esquerdo */}
      <mesh position={[-5.5, 1, 2]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[2, 4, 0.2]} />
        {panelMat}
      </mesh>
      {/* Painel direito */}
      <mesh position={[5.5, 1, 2]} rotation={[0, -0.4, 0]}>
        <boxGeometry args={[2, 4, 0.2]} />
        {panelMat}
      </mesh>
      {/* Painel superior */}
      <mesh position={[0, 4.2, 1.5]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[14, 1.2, 0.2]} />
        {panelMat}
      </mesh>
      {/* Dashboard inferior */}
      <mesh position={[0, -1.5, 3.5]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[10, 1.5, 0.3]} />
        {panelMat}
      </mesh>

      {/* Luzes de instrumento */}
      <pointLight ref={lightRef} position={[0, -0.8, 3.5]} color="#00ff88" intensity={0.5} distance={5} />

      {/* Indicadores de luz coloridos no dashboard */}
      {[-3, -1.5, 0, 1.5, 3].map((x, i) => (
        <mesh key={i} position={[x, -1.4, 3.3]}>
          <boxGeometry args={[0.25, 0.12, 0.05]} />
          <meshStandardMaterial
            color={['#ff4444', '#ffaa00', '#00ff88', '#4488ff', '#ff44ff'][i]}
            emissive={['#ff2222', '#ff8800', '#00cc66', '#2266cc', '#cc22cc'][i]}
            emissiveIntensity={1.5}
          />
        </mesh>
      ))}

      {/* Janela/moldura do cockpit — torus quadrado aproximado */}
      <mesh position={[0, 1.5, 0.5]}>
        <torusGeometry args={[5.2, 0.18, 6, 4]} />
        <meshStandardMaterial color="#111122" roughness={0.7} metalness={0.8} />
      </mesh>
    </group>
  )
}
