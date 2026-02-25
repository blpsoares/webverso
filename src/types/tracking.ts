export interface HeadOrientation {
  pitch: number
  yaw: number
  roll: number
}

export interface HandLandmark {
  x: number
  y: number
  z: number
}

export interface HandData {
  landmarks: HandLandmark[]
  worldLandmarks: HandLandmark[]
  handedness: 'Left' | 'Right'
  score: number
}

export type GestureType =
  | 'NONE'
  | 'PINCH'
  | 'OPEN_PALM'
  | 'CLOSED_FIST'
  | 'POINTING'
  | 'WAVE'
  | 'TWO_HAND_PINCH'

export interface HandGesture {
  left: GestureType
  right: GestureType
}

export interface HandPosition3D {
  x: number
  y: number
  z: number
}
