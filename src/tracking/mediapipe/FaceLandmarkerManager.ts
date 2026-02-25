import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision'
import { MEDIAPIPE_WASM_URL, FACE_LANDMARKER_MODEL_URL } from './constants'

let instance: FaceLandmarker | null = null
let loadingPromise: Promise<FaceLandmarker> | null = null

const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

export async function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (instance) return instance
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL)

    const options = {
      runningMode: 'VIDEO' as const,
      numFaces: 1,
      minFaceDetectionConfidence: isMobile ? 0.4 : 0.5,
      minFacePresenceConfidence:  isMobile ? 0.4 : 0.5,
      minTrackingConfidence:      isMobile ? 0.4 : 0.5,
      outputFacialTransformationMatrixes: true,
    }

    try {
      instance = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: FACE_LANDMARKER_MODEL_URL, delegate: 'GPU' },
        ...options,
      })
      console.info('[FaceLandmarker] delegate: GPU')
    } catch {
      console.warn('[FaceLandmarker] GPU falhou, usando CPU')
      instance = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: FACE_LANDMARKER_MODEL_URL, delegate: 'CPU' },
        ...options,
      })
    }

    return instance
  })()

  return loadingPromise
}

export function isFaceLandmarkerReady() {
  return instance !== null
}
