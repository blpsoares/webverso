import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useTrackingStore } from '../../store/trackingStore'
import { landmarkToWorld } from '../../tracking/algorithms/landmarkUtils'

interface HandModelProps {
  side: 'left' | 'right'
}

// MediaPipe hand landmark connections (21 joints)
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [0, 9], [9, 10], [10, 11], [11, 12], // Middle
  [0, 13], [13, 14], [14, 15], [15, 16], // Ring
  [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [5, 9], [9, 13], [13, 17], // Palm base
]

const JOINT_COLORS = [
  0xff6b6b, // 0: Wrist
  0xff4444, 0xff3333, 0xff2222, 0xff1111, // Thumb
  0x4488ff, 0x3377ff, 0x2266ff, 0x1155ff, // Index
  0x44ff44, 0x33ff33, 0x22ff22, 0x11ff11, // Middle
  0xffaa00, 0xff9900, 0xff8800, 0xff7700, // Ring
  0xff00ff, 0xee00ee, 0xdd00dd, 0xcc00cc, // Pinky
]

export function HandModel({ side }: HandModelProps) {
  const { camera } = useThree()
  const handLandmarks = useTrackingStore(s => s.handLandmarks)

  const { points, lines } = useMemo(() => {
    const pts = new THREE.BufferGeometry()
    const posArray = new Float32Array(21 * 3)
    const colorArray = new Float32Array(21 * 3)

    for (let i = 0; i < 21; i++) {
      posArray[i * 3] = 0
      posArray[i * 3 + 1] = 0
      posArray[i * 3 + 2] = 0

      const rgb = JOINT_COLORS[i]
      colorArray[i * 3] = ((rgb >> 16) & 255) / 255
      colorArray[i * 3 + 1] = ((rgb >> 8) & 255) / 255
      colorArray[i * 3 + 2] = (rgb & 255) / 255
    }

    pts.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
    pts.setAttribute('color', new THREE.BufferAttribute(colorArray, 3))

    const linesGeom = new THREE.BufferGeometry()
    const linePositions = new Float32Array(HAND_CONNECTIONS.length * 2 * 3)
    HAND_CONNECTIONS.forEach((conn, i) => {
      linePositions[i * 6] = 0
      linePositions[i * 6 + 1] = 0
      linePositions[i * 6 + 2] = 0
      linePositions[i * 6 + 3] = 0
      linePositions[i * 6 + 4] = 0
      linePositions[i * 6 + 5] = 0
    })
    linesGeom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))

    return {
      points: pts,
      lines: linesGeom,
    }
  }, [])

  useFrame(() => {
    const landmarks = handLandmarks[side]
    if (!landmarks || landmarks.length < 21) return

    const posAttr = points.getAttribute('position') as THREE.BufferAttribute
    const posArray = posAttr.array as Float32Array

    for (let i = 0; i < 21; i++) {
      const lm = landmarks[i]
      const worldPos = landmarkToWorld(lm, camera.matrixWorld)

      posArray[i * 3] = worldPos.x
      posArray[i * 3 + 1] = worldPos.y
      posArray[i * 3 + 2] = worldPos.z
    }
    posAttr.needsUpdate = true

    const lineAttr = lines.getAttribute('position') as THREE.BufferAttribute
    const lineArray = lineAttr.array as Float32Array

    HAND_CONNECTIONS.forEach((conn, i) => {
      const lm1 = landmarks[conn[0]]
      const lm2 = landmarks[conn[1]]
      const p1 = landmarkToWorld(lm1, camera.matrixWorld)
      const p2 = landmarkToWorld(lm2, camera.matrixWorld)

      lineArray[i * 6] = p1.x
      lineArray[i * 6 + 1] = p1.y
      lineArray[i * 6 + 2] = p1.z
      lineArray[i * 6 + 3] = p2.x
      lineArray[i * 6 + 4] = p2.y
      lineArray[i * 6 + 5] = p2.z
    })
    lineAttr.needsUpdate = true
  })

  return (
    <group>
      <points geometry={points}>
        <pointsMaterial size={0.04} vertexColors toneMapped={false} />
      </points>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color={side === 'left' ? 0x4488ff : 0xff6b6b} linewidth={2} />
      </lineSegments>
    </group>
  )
}
