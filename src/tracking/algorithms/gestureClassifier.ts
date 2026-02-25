import type { GestureType } from '../../types/tracking'
import { HAND_LANDMARK_INDICES as LM } from '../mediapipe/constants'

interface Landmark {
  x: number
  y: number
  z: number
}

function dist2D(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Retorna true se o dedo está estendido.
 * MediaPipe Y: 0 = topo, 1 = base → ponta estendida = TIP.y < PIP.y
 */
function isFingerExtended(lm: Landmark[], tip: number, pip: number): boolean {
  return lm[tip].y < lm[pip].y
}

export function classifyGesture(lm: Landmark[]): GestureType {
  if (lm.length < 21) return 'NONE'

  const thumbTip  = lm[LM.THUMB_TIP]
  const indexTip  = lm[LM.INDEX_TIP]

  // PINCH: distância 2D aumentada para ser detectável em diferentes distâncias da câmera
  // Threshold 0.10 = ~10% da largura da imagem → confortável sem ser acidental
  const pinchDist = dist2D(thumbTip, indexTip)
  if (pinchDist < 0.10) return 'PINCH'

  const indexExt  = isFingerExtended(lm, LM.INDEX_TIP,  LM.INDEX_PIP)
  const middleExt = isFingerExtended(lm, LM.MIDDLE_TIP, LM.MIDDLE_PIP)
  const ringExt   = isFingerExtended(lm, LM.RING_TIP,   LM.RING_PIP)
  const pinkyExt  = isFingerExtended(lm, LM.PINKY_TIP,  LM.PINKY_PIP)

  // OPEN_PALM: todos os 4 dedos estendidos
  if (indexExt && middleExt && ringExt && pinkyExt) return 'OPEN_PALM'

  // POINTING: só o indicador estendido
  if (indexExt && !middleExt && !ringExt && !pinkyExt) return 'POINTING'

  // CLOSED_FIST: todos dobrados
  if (!indexExt && !middleExt && !ringExt && !pinkyExt) return 'CLOSED_FIST'

  return 'NONE'
}

// Estado de debounce por lado
const debounceState: Record<'left' | 'right', { gesture: GestureType; count: number }> = {
  left:  { gesture: 'NONE', count: 0 },
  right: { gesture: 'NONE', count: 0 },
}

const DEBOUNCE_FRAMES = 3

export function classifyGestureDebounced(
  landmarks: Landmark[],
  side: 'left' | 'right',
  confirmedCallback: (gesture: GestureType) => void,
): void {
  const raw   = classifyGesture(landmarks)
  const state = debounceState[side]

  if (raw === state.gesture) {
    state.count++
    if (state.count >= DEBOUNCE_FRAMES) {
      confirmedCallback(raw)
    }
  } else {
    state.gesture = raw
    state.count   = 1
  }
}

export function resetGestureDebounce() {
  debounceState.left  = { gesture: 'NONE', count: 0 }
  debounceState.right = { gesture: 'NONE', count: 0 }
}
