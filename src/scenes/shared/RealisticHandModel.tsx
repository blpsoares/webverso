import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useTrackingStore } from '../../store/trackingStore'
import { landmarkToWorld } from '../../tracking/algorithms/landmarkUtils'

interface RealisticHandModelProps {
  side: 'left' | 'right'
}

const SKIN_COLOR = 0xffb8a3 // Mais realista
const NAIL_COLOR = 0xffc0a0

// Finger chains: [tip, dip, pip, mcp, cmc]
const FINGER_CHAINS = {
  thumb: [[4, 3, 2, 1]],
  index: [[8, 7, 6, 5]],
  middle: [[12, 11, 10, 9]],
  ring: [[16, 15, 14, 13]],
  pinky: [[20, 19, 18, 17]],
}

export function RealisticHandModel({ side }: RealisticHandModelProps) {
  const { camera } = useThree()
  const handLandmarks = useTrackingStore(s => s.handLandmarks)
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    const landmarks = handLandmarks[side]
    if (!landmarks || landmarks.length < 21 || !groupRef.current) return

    // Clear previous geometry
    while (groupRef.current.children.length > 0) {
      groupRef.current.remove(groupRef.current.children[0])
    }

    // === PALM ===
    const wristPos = landmarkToWorld(landmarks[0], camera.matrixWorld)
    const middleBase = landmarkToWorld(landmarks[9], camera.matrixWorld)

    // Palm size
    const palmGeom = new THREE.BoxGeometry(0.075, 0.08, 0.095)
    const palmMat = new THREE.MeshStandardMaterial({
      color: SKIN_COLOR,
      roughness: 0.4,
      metalness: 0.02,
    })
    const palm = new THREE.Mesh(palmGeom, palmMat)
    palm.position.copy(wristPos).lerp(middleBase, 0.3) // Center between wrist and middle
    palm.castShadow = true
    palm.receiveShadow = true
    groupRef.current.add(palm)

    // === DRAW FINGERS ===
    const fingerMat = new THREE.MeshStandardMaterial({
      color: SKIN_COLOR,
      roughness: 0.4,
      metalness: 0.02,
    })

    Object.entries(FINGER_CHAINS).forEach(([fingerName, chains]) => {
      chains.forEach(chain => {
        // Draw each segment (bone) as cylinder
        for (let i = 0; i < chain.length - 1; i++) {
          const idxA = chain[i]
          const idxB = chain[i + 1]
          const posA = landmarkToWorld(landmarks[idxA], camera.matrixWorld)
          const posB = landmarkToWorld(landmarks[idxB], camera.matrixWorld)

          // Segment geometry
          const mid = posA.clone().add(posB).multiplyScalar(0.5)
          const dist = posA.distanceTo(posB)
          const radius = fingerName === 'thumb' ? 0.008 : 0.009

          const segGeom = new THREE.CylinderGeometry(radius, radius * 0.9, dist, 8)
          const seg = new THREE.Mesh(segGeom, fingerMat)

          // Position and orient
          seg.position.copy(mid)
          seg.lookAt(posB)
          seg.rotateX(Math.PI / 2) // Adjust for cylinder orientation
          seg.castShadow = true
          seg.receiveShadow = true
          groupRef.current!.add(seg)

          // Joint sphere
          const jointGeom = new THREE.SphereGeometry(radius * 1.3, 8, 8)
          const jointMat = new THREE.MeshStandardMaterial({
            color: SKIN_COLOR,
            roughness: 0.45,
          })
          const joint = new THREE.Mesh(jointGeom, jointMat)
          joint.position.copy(posB)
          joint.castShadow = true
          joint.receiveShadow = true
          groupRef.current!.add(joint)
        }

        // Fingertip nail
        const tipPos = landmarkToWorld(landmarks[chain[0]], camera.matrixWorld)
        const nailGeom = new THREE.SphereGeometry(0.009, 8, 8)
        const nailMat = new THREE.MeshStandardMaterial({
          color: NAIL_COLOR,
          roughness: 0.35,
          metalness: 0.1,
        })
        const nail = new THREE.Mesh(nailGeom, nailMat)
        nail.position.copy(tipPos)
        nail.castShadow = true
        nail.receiveShadow = true
        groupRef.current!.add(nail)
      })
    })

    // === WRIST BAND (visual indicator) ===
    const wristGeom = new THREE.TorusGeometry(0.035, 0.005, 8, 16)
    const wristMat = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.6,
      metalness: 0.3,
    })
    const wristBand = new THREE.Mesh(wristGeom, wristMat)
    wristBand.position.copy(wristPos)
    wristBand.rotation.x = Math.PI / 2
    wristBand.castShadow = true
    wristBand.receiveShadow = true
    groupRef.current.add(wristBand)
  })

  return <group ref={groupRef} />
}
