import { create } from 'zustand'
import type { HeadOrientation, HandPosition3D } from '../types/tracking'

interface HandScreenPos {
  x: number // 0-1, 0 = esquerda do frame original (não espelhado)
  y: number // 0-1, 0 = topo
}

interface HandLandmarks {
  x: number
  y: number
  z: number
}

interface TrackingState {
  headOrientation: HeadOrientation
  handPositions: { left: HandPosition3D | null; right: HandPosition3D | null }
  // Posição normalizada do pulso na imagem (para raycasting) — já espelhada (1-x)
  handScreenPositions: { left: HandScreenPos | null; right: HandScreenPos | null }
  // 21 landmarks (normalized, x mirrored) for each hand
  handLandmarks: { left: HandLandmarks[]; right: HandLandmarks[] }
  mediaStream: MediaStream | null
  isTracking: boolean
  faceDetected: boolean
  handsDetected: number
  handTrackingEnabled: boolean // Toggle para ativar/desativar hand tracking

  setHeadOrientation: (orientation: HeadOrientation) => void
  setHandPositions: (positions: { left: HandPosition3D | null; right: HandPosition3D | null }) => void
  setHandScreenPositions: (positions: { left: HandScreenPos | null; right: HandScreenPos | null }) => void
  setHandLandmarks: (landmarks: { left?: HandLandmarks[]; right?: HandLandmarks[] }) => void
  setMediaStream: (stream: MediaStream | null) => void
  setIsTracking: (value: boolean) => void
  setFaceDetected: (value: boolean) => void
  setHandsDetected: (count: number) => void
  setHandTrackingEnabled: (enabled: boolean) => void
}

export const useTrackingStore = create<TrackingState>()((set) => ({
  headOrientation: { pitch: 0, yaw: 0, roll: 0 },
  handPositions: { left: null, right: null },
  handScreenPositions: { left: null, right: null },
  handLandmarks: { left: [], right: [] },
  mediaStream: null,
  isTracking: false,
  faceDetected: false,
  handsDetected: 0,
  handTrackingEnabled: true,

  setHeadOrientation: (orientation) => set({ headOrientation: orientation }),
  setHandPositions: (positions) => set({ handPositions: positions }),
  setHandScreenPositions: (positions) => set({ handScreenPositions: positions }),
  setHandLandmarks: (landmarks) => set((state) => ({
    handLandmarks: {
      left: landmarks.left ?? state.handLandmarks.left,
      right: landmarks.right ?? state.handLandmarks.right,
    },
  })),
  setMediaStream: (stream) => set({ mediaStream: stream }),
  setIsTracking: (value) => set({ isTracking: value }),
  setFaceDetected: (value) => set({ faceDetected: value }),
  setHandsDetected: (count) => set({ handsDetected: count }),
  setHandTrackingEnabled: (enabled) => set({ handTrackingEnabled: enabled }),
}))
