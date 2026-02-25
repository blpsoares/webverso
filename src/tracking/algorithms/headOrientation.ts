import type { HeadOrientation } from '../../types/tracking'
import { EMAFilterAngles } from './smoothing'

const filter = new EMAFilterAngles(0.2)

// Baseline salvo em valores RAW (antes do filtro), para subtrair corretamente
let baselinePitch = 0
let baselineYaw = 0
let baselineRoll = 0
let calibrated = false

// Último raw para calibração imediata quando chamada do botão
let lastRawPitch = 0
let lastRawYaw = 0
let lastRawRoll = 0

/**
 * Extrai Euler angles de uma matriz 4x4 column-major (formato OpenGL/MediaPipe)
 * Layout column-major:
 *   m[0]  m[4]  m[8]   m[12]
 *   m[1]  m[5]  m[9]   m[13]
 *   m[2]  m[6]  m[10]  m[14]
 *   m[3]  m[7]  m[11]  m[15]
 */
export function matrixToEuler(m: number[]): { pitch: number; yaw: number; roll: number } {
  // R[row][col] em column-major: R[row][col] = m[col*4 + row]
  // R[0][0]=m[0], R[1][0]=m[1], R[2][0]=m[2]
  // R[0][1]=m[4], R[1][1]=m[5], R[2][1]=m[6]
  // R[0][2]=m[8], R[1][2]=m[9], R[2][2]=m[10]
  //
  // Convenção YXZ (FPS camera):
  //   yaw   = atan2(-R[2][0], R[0][0]) = atan2(-m[8],  m[0])
  //   pitch = asin(R[1][0])            = asin(m[1])   -- ou atan2 para mais estabilidade
  //   roll  = atan2(-R[1][2], R[1][1]) = atan2(-m[9], m[5])

  const yaw = Math.atan2(-m[8], m[0])
  // Usa atan2 com denominador para evitar gimbal lock
  const pitch = Math.atan2(m[9], m[5])
  const roll = Math.atan2(-m[6], m[10])

  return { pitch, yaw, roll }
}

export function processHeadMatrix(data: { data: number[] } | null): HeadOrientation | null {
  if (!data || !data.data || data.data.length < 16) return null

  const raw = matrixToEuler(data.data)

  // Salva raw para calibração imediata
  lastRawPitch = raw.pitch
  lastRawYaw = raw.yaw
  lastRawRoll = raw.roll

  const adjusted = {
    pitch: raw.pitch - baselinePitch,
    yaw: raw.yaw - baselineYaw,
    roll: raw.roll - baselineRoll,
  }

  return filter.update(adjusted.pitch, adjusted.yaw, adjusted.roll)
}

/**
 * Calibra usando o último valor RAW capturado (não filtrado).
 * Deve ser chamado enquanto o usuário olha reto para a câmera.
 */
export function calibrateHeadNow() {
  baselinePitch = lastRawPitch
  baselineYaw = lastRawYaw
  baselineRoll = lastRawRoll
  calibrated = true
  filter.reset()
}

/**
 * @deprecated Use calibrateHeadNow() — este recebe orientação filtrada o que gera offset
 */
export function calibrateHead(_orientation: HeadOrientation) {
  calibrateHeadNow()
}

export function resetCalibration() {
  calibrated = false
  baselinePitch = 0
  baselineYaw = 0
  baselineRoll = 0
  filter.reset()
}

export function isCalibrated() {
  return calibrated
}
