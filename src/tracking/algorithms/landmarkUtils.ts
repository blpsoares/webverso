import * as THREE from 'three'

// Scale constants for hand → camera-local space
const SCALE_X = 1.2
const SCALE_Y = 1.0
const SCALE_Z = 0.35
const DEPTH_OFFSET = 0.55  // meters in front of camera

/**
 * Converts a MediaPipe landmark (mirrored x, 0-1 normalized) to world space.
 * Landmark must have x already mirrored (1 - original_x).
 */
export function landmarkToWorld(
  lm: { x: number; y: number; z: number },
  cameraMatrixWorld: THREE.Matrix4,
): THREE.Vector3 {
  const local = new THREE.Vector3(
    (lm.x - 0.5) * SCALE_X,
    -(lm.y - 0.5) * SCALE_Y,
    lm.z * SCALE_Z - DEPTH_OFFSET,
  )
  return local.applyMatrix4(cameraMatrixWorld)
}

export function wristWorldPosition(
  landmarks: { x: number; y: number; z: number }[],
  cameraMatrixWorld: THREE.Matrix4,
): THREE.Vector3 {
  return landmarkToWorld(landmarks[0], cameraMatrixWorld)
}
