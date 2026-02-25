import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { keyState, usePlayerMovement } from '../../hooks/usePlayerMovement'

const SPEED = 6
const SPRINT_MULTIPLIER = 1.8

export function PlayerController() {
  const { camera } = useThree()
  const { jumpVelocityRef, onGroundRef, FLOOR_Y, JUMP_FORCE, GRAVITY } = usePlayerMovement()
  const prevSpaceRef = useRef(false)

  useFrame((_, delta) => {
    const speed = (keyState.shift ? SPEED * SPRINT_MULTIPLIER : SPEED) * delta

    // Movement direction from camera yaw only (not pitch) — FPS style
    const yaw = camera.rotation.y
    const fwd   = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw))
    const right = new THREE.Vector3( Math.cos(yaw), 0, -Math.sin(yaw))

    if (keyState.w) camera.position.addScaledVector(fwd,    speed)
    if (keyState.s) camera.position.addScaledVector(fwd,   -speed)
    if (keyState.a) camera.position.addScaledVector(right, -speed)
    if (keyState.d) camera.position.addScaledVector(right,  speed)

    // Jump
    if (keyState.space && !prevSpaceRef.current && onGroundRef.current) {
      jumpVelocityRef.current = JUMP_FORCE
      onGroundRef.current = false
    }
    prevSpaceRef.current = keyState.space

    if (!onGroundRef.current) {
      camera.position.y += jumpVelocityRef.current * delta
      jumpVelocityRef.current -= GRAVITY * delta
      if (camera.position.y <= FLOOR_Y) {
        camera.position.y = FLOOR_Y
        jumpVelocityRef.current = 0
        onGroundRef.current = true
      }
    }
  })

  return null
}
