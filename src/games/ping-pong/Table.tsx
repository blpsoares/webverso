import { RigidBody } from '@react-three/rapier'

const TABLE_WIDTH = 2.74
const TABLE_LENGTH = 1.525
const TABLE_HEIGHT = 0.04
const TABLE_Y = 0

export function Table() {
  return (
    <group>
      {/* Table surface */}
      <RigidBody type="fixed" colliders="cuboid" name="table">
        <mesh position={[0, TABLE_Y, 0]} receiveShadow>
          <boxGeometry args={[TABLE_WIDTH, TABLE_HEIGHT, TABLE_LENGTH]} />
          <meshStandardMaterial color="#1a5c1a" roughness={0.8} />
        </mesh>
        {/* White border lines */}
        <mesh position={[0, TABLE_Y + TABLE_HEIGHT / 2 + 0.001, 0]}>
          <boxGeometry args={[TABLE_WIDTH, 0.002, 0.02]} />
          <meshStandardMaterial color="white" />
        </mesh>
        {/* Side lines */}
        <mesh position={[TABLE_WIDTH / 2 - 0.01, TABLE_Y + TABLE_HEIGHT / 2 + 0.001, 0]}>
          <boxGeometry args={[0.02, 0.002, TABLE_LENGTH]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[-(TABLE_WIDTH / 2 - 0.01), TABLE_Y + TABLE_HEIGHT / 2 + 0.001, 0]}>
          <boxGeometry args={[0.02, 0.002, TABLE_LENGTH]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </RigidBody>

      {/* Table legs */}
      {[
        [TABLE_WIDTH / 2 - 0.1, TABLE_Y - 0.38, TABLE_LENGTH / 2 - 0.1],
        [-(TABLE_WIDTH / 2 - 0.1), TABLE_Y - 0.38, TABLE_LENGTH / 2 - 0.1],
        [TABLE_WIDTH / 2 - 0.1, TABLE_Y - 0.38, -(TABLE_LENGTH / 2 - 0.1)],
        [-(TABLE_WIDTH / 2 - 0.1), TABLE_Y - 0.38, -(TABLE_LENGTH / 2 - 0.1)],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.05, 0.76, 0.05]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}
    </group>
  )
}
