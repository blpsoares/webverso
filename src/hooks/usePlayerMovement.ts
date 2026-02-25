import { useEffect, useRef } from 'react'

export interface KeyState {
  w: boolean; a: boolean; s: boolean; d: boolean
  space: boolean; shift: boolean
}

// Singleton key state (accessed imperatively in useFrame, avoids re-renders)
export const keyState: KeyState = { w: false, a: false, s: false, d: false, space: false, shift: false }

export function usePlayerMovement() {
  const jumpVelocityRef = useRef(0)
  const onGroundRef = useRef(true)
  const FLOOR_Y = 1.6
  const JUMP_FORCE = 6
  const GRAVITY = 14

  useEffect(() => {
    const map: Record<string, keyof KeyState> = {
      'w': 'w', 'a': 'a', 's': 's', 'd': 'd',
      ' ': 'space', 'shift': 'shift',
      'arrowup': 'w', 'arrowdown': 's', 'arrowleft': 'a', 'arrowright': 'd',
    }
    const down = (e: KeyboardEvent) => {
      const k = map[e.key.toLowerCase()]
      if (k) { keyState[k] = true; e.preventDefault() }
    }
    const up = (e: KeyboardEvent) => {
      const k = map[e.key.toLowerCase()]
      if (k) keyState[k] = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  return { jumpVelocityRef, onGroundRef, FLOOR_Y, JUMP_FORCE, GRAVITY }
}
