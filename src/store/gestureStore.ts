import { create } from 'zustand'
import type { GestureType } from '../types/tracking'

interface GestureState {
  leftGesture: GestureType
  rightGesture: GestureType
  twoHandPinchDistance: number | null

  setLeftGesture: (gesture: GestureType) => void
  setRightGesture: (gesture: GestureType) => void
  setTwoHandPinchDistance: (distance: number | null) => void
}

export const useGestureStore = create<GestureState>()((set) => ({
  leftGesture: 'NONE',
  rightGesture: 'NONE',
  twoHandPinchDistance: null,

  setLeftGesture: (gesture) => set({ leftGesture: gesture }),
  setRightGesture: (gesture) => set({ rightGesture: gesture }),
  setTwoHandPinchDistance: (distance) => set({ twoHandPinchDistance: distance }),
}))
