import { Text } from '@react-three/drei'
import { useGameStore } from '../../store/gameStore'

export function ScoreBoard() {
  const { pingPongScore } = useGameStore()

  return (
    <group position={[0, 2.5, -1]}>
      {/* Background panel */}
      <mesh>
        <boxGeometry args={[3, 0.8, 0.05]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>

      {/* Score text */}
      <Text
        position={[0, 0, 0.03]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {pingPongScore.left} : {pingPongScore.right}
      </Text>

      {/* Player labels */}
      <Text
        position={[-1.2, 0, 0.03]}
        fontSize={0.15}
        color="#ff8888"
        anchorX="center"
        anchorY="middle"
      >
        ESQUERDA
      </Text>
      <Text
        position={[1.2, 0, 0.03]}
        fontSize={0.15}
        color="#8888ff"
        anchorX="center"
        anchorY="middle"
      >
        DIREITA
      </Text>
    </group>
  )
}
