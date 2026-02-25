import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
import { MEDIAPIPE_WASM_URL, HAND_LANDMARKER_MODEL_URL } from './constants'

let instance: HandLandmarker | null = null
let loadingPromise: Promise<HandLandmarker> | null = null

const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

export async function getHandLandmarker(): Promise<HandLandmarker> {
  if (instance) return instance
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL)

    const options = {
      runningMode: 'VIDEO' as const,
      numHands: 2,
      // Thresholds mais baixos = mais sensitivo, melhora detecção em mobile
      minHandDetectionConfidence: isMobile ? 0.4 : 0.5,
      minHandPresenceConfidence:  isMobile ? 0.4 : 0.5,
      minTrackingConfidence:      isMobile ? 0.4 : 0.5,
    }

    // Tenta GPU primeiro; fallback para CPU em mobile ou se GPU não suportado
    try {
      instance = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: HAND_LANDMARKER_MODEL_URL, delegate: 'GPU' },
        ...options,
      })
      console.info('[HandLandmarker] delegate: GPU')
    } catch {
      console.warn('[HandLandmarker] GPU falhou, usando CPU')
      instance = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: HAND_LANDMARKER_MODEL_URL, delegate: 'CPU' },
        ...options,
      })
    }

    return instance
  })()

  return loadingPromise
}

export function isHandLandmarkerReady() {
  return instance !== null
}
