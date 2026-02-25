import { useMemo } from 'react'
import * as THREE from 'three'
import { createNoise2D } from 'simplex-noise'

const TERRAIN_SIZE = 500
const TERRAIN_SEGMENTS = 128

export function Terrain() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS)
    const noise2D = createNoise2D()

    const positions = geo.attributes.position
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const z = positions.getY(i)

      const scale1 = 0.005
      const scale2 = 0.02
      const scale3 = 0.08

      const height =
        noise2D(x * scale1, z * scale1) * 15 +
        noise2D(x * scale2, z * scale2) * 5 +
        noise2D(x * scale3, z * scale3) * 1.5

      positions.setZ(i, height)
    }

    geo.rotateX(-Math.PI / 2)
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <mesh geometry={geometry} receiveShadow position={[0, -20, 0]}>
      <meshStandardMaterial
        color="#2d5a1b"
        roughness={0.9}
        metalness={0}
        wireframe={false}
      />
    </mesh>
  )
}
