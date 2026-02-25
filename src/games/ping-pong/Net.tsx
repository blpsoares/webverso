import { RigidBody } from '@react-three/rapier'

export function Net() {
  return (
    <RigidBody type="fixed" colliders="cuboid" name="net">
      {/* Net post */}
      <mesh position={[0, 0.085, 0]}>
        <boxGeometry args={[0.02, 0.17, 1.6]} />
        <meshStandardMaterial color="#cccccc" transparent opacity={0.8} />
      </mesh>
      {/* Net mesh visual */}
      <mesh position={[0, 0.085, 0]}>
        <boxGeometry args={[0.005, 0.15, 1.52]} />
        <meshStandardMaterial color="white" wireframe />
      </mesh>
    </RigidBody>
  )
}
