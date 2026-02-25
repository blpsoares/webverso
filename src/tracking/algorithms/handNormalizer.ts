import type { HandPosition3D } from '../../types/tracking'
import { EMAFilter3D } from './smoothing'

// Alpha menor = mais suave porém com mais lag. 0.12 dá boa suavidade sem atraso excessivo.
const leftFilter  = new EMAFilter3D(0.12)
const rightFilter = new EMAFilter3D(0.12)

export function normalizeHandPosition(
  landmarks: { x: number; y: number; z: number }[],
  handedness: 'Left' | 'Right',
): HandPosition3D {
  const wrist = landmarks[0]

  const x = (1 - wrist.x - 0.5) * 4
  const y = -(wrist.y - 0.5) * 3
  const z = wrist.z * -5

  const filter = handedness === 'Left' ? leftFilter : rightFilter
  return filter.update(x, y, z)
}

export function resetHandFilters() {
  leftFilter.reset()
  rightFilter.reset()
}
