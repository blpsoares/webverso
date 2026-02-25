import type { HandLandmarker, FaceLandmarker } from '@mediapipe/tasks-vision'
import { getHandLandmarker } from './mediapipe/HandLandmarkerManager'
import { getFaceLandmarker } from './mediapipe/FaceLandmarkerManager'
import { processHeadMatrix } from './algorithms/headOrientation'
import { classifyGestureDebounced } from './algorithms/gestureClassifier'
import { normalizeHandPosition } from './algorithms/handNormalizer'
import { useTrackingStore } from '../store/trackingStore'
import { useGestureStore } from '../store/gestureStore'
import type { GestureType } from '../types/tracking'

export class TrackingOrchestrator {
  private videoElement: HTMLVideoElement | null = null
  private running = false
  private lastHandCallMs = -1
  private lastFaceCallMs = -1
  // Mobile usa framerate menor para não sobrecarregar
  private readonly isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  private get HAND_INTERVAL_MS() { return this.isMobile ? 66 : 33 }  // mobile 15fps, desktop 30fps
  private get FACE_INTERVAL_MS()  { return this.isMobile ? 50 : 16 }  // mobile 20fps, desktop 60fps
  private animFrameId: number | null = null
  private handLandmarker: HandLandmarker | null = null
  private faceLandmarker: FaceLandmarker | null = null

  // MediaPipe requer timestamps estritamente crescentes — usamos performance.now()
  // separados para cada detector para evitar colisões entre face e mãos.
  private lastFaceTimestamp = -1
  private lastHandTimestamp = -1

  async init(video: HTMLVideoElement) {
    this.videoElement = video
    const [hand, face] = await Promise.all([getHandLandmarker(), getFaceLandmarker()])
    this.handLandmarker = hand
    this.faceLandmarker = face
  }

  start() {
    if (this.running) return
    this.running = true
    this.lastFaceTimestamp = -1
    this.lastHandTimestamp = -1
    this.loop()
    useTrackingStore.getState().setIsTracking(true)
  }

  stop() {
    this.running = false
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId)
      this.animFrameId = null
    }
    useTrackingStore.getState().setIsTracking(false)
  }

  private loop = () => {
    if (!this.running || !this.videoElement) return

    const now = performance.now()
    const video = this.videoElement

    // Aguarda o vídeo estar com frames disponíveis (HAVE_ENOUGH_DATA = 4)
    if (video.readyState < 4 || video.paused || video.ended) {
      this.animFrameId = requestAnimationFrame(this.loop)
      return
    }

    // Face tracking @60fps
    if (now - this.lastFaceCallMs >= this.FACE_INTERVAL_MS) {
      this.processFace(now)
      this.lastFaceCallMs = now
    }

    // Hand tracking @30fps
    if (now - this.lastHandCallMs >= this.HAND_INTERVAL_MS) {
      this.processHands(now)
      this.lastHandCallMs = now
    }

    this.animFrameId = requestAnimationFrame(this.loop)
  }

  private processFace(now: number) {
    if (!this.faceLandmarker || !this.videoElement) return

    // Garante timestamp estritamente crescente
    const timestamp = Math.max(now, this.lastFaceTimestamp + 1)
    this.lastFaceTimestamp = timestamp

    try {
      const result = this.faceLandmarker.detectForVideo(this.videoElement, timestamp)
      const { setHeadOrientation, setFaceDetected } = useTrackingStore.getState()

      if (result.facialTransformationMatrixes && result.facialTransformationMatrixes.length > 0) {
        const matrix = result.facialTransformationMatrixes[0]
        const orientation = processHeadMatrix(matrix)
        if (orientation) {
          setHeadOrientation(orientation)
          setFaceDetected(true)
        }
      } else {
        setFaceDetected(false)
      }
    } catch (err) {
      console.warn('[FaceTracking]', err)
    }
  }

  private processHands(now: number) {
    if (!this.handLandmarker || !this.videoElement) return

    // Garante timestamp estritamente crescente
    const timestamp = Math.max(now, this.lastHandTimestamp + 1)
    this.lastHandTimestamp = timestamp

    try {
      const result = this.handLandmarker.detectForVideo(this.videoElement, timestamp)
      const { setHandPositions, setHandsDetected } = useTrackingStore.getState()
      const { setLeftGesture, setRightGesture, setTwoHandPinchDistance } =
        useGestureStore.getState()

      const handCount = result.landmarks?.length ?? 0
      setHandsDetected(handCount)

      // Sem mãos: zera posições e gestos
      if (handCount === 0) {
        setHandPositions({ left: null, right: null })
        useTrackingStore.getState().setHandScreenPositions({ left: null, right: null })
        setLeftGesture('NONE')
        setRightGesture('NONE')
        setTwoHandPinchDistance(null)
        return
      }

      const positions: {
        left: { x: number; y: number; z: number } | null
        right: { x: number; y: number; z: number } | null
      } = { left: null, right: null }

      const screenPositions: {
        left: { x: number; y: number } | null
        right: { x: number; y: number } | null
      } = { left: null, right: null }

      const confirmedGestures: { left: GestureType | null; right: GestureType | null } = {
        left: null,
        right: null,
      }

      for (let i = 0; i < handCount; i++) {
        const landmarks = result.landmarks[i]
        const handednessData = result.handednesses[i]

        // MediaPipe retorna handedness espelhado (câmera frontal).
        // "Right" do MediaPipe = mão direita do usuário.
        const mpHandedness =
          handednessData && handednessData[0]
            ? (handednessData[0].categoryName as 'Left' | 'Right')
            : 'Right'

        // Mapeia corretamente para a cena 3D
        const side: 'left' | 'right' = mpHandedness === 'Right' ? 'right' : 'left'

        positions[side] = normalizeHandPosition(landmarks, mpHandedness)

        // Posição 2D espelhada do pulso para raycasting (x: 0=esq, 1=dir na visão espelhada)
        const wrist = landmarks[0]
        screenPositions[side] = { x: 1 - wrist.x, y: wrist.y }

        // Store normalized landmarks (x mirrored for screen space)
        const normalizedLandmarks = landmarks.map(lm => ({
          x: 1 - lm.x,
          y: lm.y,
          z: lm.z,
        }))

        classifyGestureDebounced(landmarks, side, (gesture) => {
          confirmedGestures[side] = gesture
        })

        // Update handLandmarks in store
        useTrackingStore.getState().setHandLandmarks({
          [side === 'left' ? 'left' : 'right']: normalizedLandmarks,
        } as any)
      }

      setHandPositions(positions)
      useTrackingStore.getState().setHandScreenPositions(screenPositions)

      // Só atualiza o gesto se foi confirmado pelo debounce; preserva o anterior caso contrário
      if (confirmedGestures.left !== null) setLeftGesture(confirmedGestures.left)
      if (confirmedGestures.right !== null) setRightGesture(confirmedGestures.right)

      // Se a mão sumiu, zera o gesto daquele lado
      if (!positions.left) setLeftGesture('NONE')
      if (!positions.right) setRightGesture('NONE')

      // TWO_HAND_PINCH
      if (
        positions.left &&
        positions.right &&
        confirmedGestures.left === 'PINCH' &&
        confirmedGestures.right === 'PINCH'
      ) {
        const dx = positions.left.x - positions.right.x
        const dy = positions.left.y - positions.right.y
        const dz = positions.left.z - positions.right.z
        setTwoHandPinchDistance(Math.sqrt(dx * dx + dy * dy + dz * dz))
      } else {
        setTwoHandPinchDistance(null)
      }
    } catch (err) {
      console.warn('[HandTracking]', err)
    }
  }
}

export const orchestrator = new TrackingOrchestrator()
