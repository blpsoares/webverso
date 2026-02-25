import { useSceneStore } from '../../store/sceneStore'

const skyColors: Record<string, string> = {
  hub: '#0a0a1a',
  pingpong: '#0d1a0d',
  airplane: '#1a3a6e',
}

export function Environment() {
  const { activeSpace } = useSceneStore()
  const color = skyColors[activeSpace] ?? '#0a0a1a'

  return (
    <>
      <color attach="background" args={[color]} />
      <fog attach="fog" args={[color, 20, 100]} />

      {/* Ambient light */}
      <ambientLight intensity={0.4} />

      {/* Main directional light */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Fill light */}
      <directionalLight position={[-10, 10, -10]} intensity={0.3} color="#8888ff" />

      {/* Point lights for ambiance */}
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#6644ff" distance={20} />
    </>
  )
}
