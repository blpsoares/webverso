/**
 * Exponential Moving Average filter
 * alpha: smoothing factor (0 = very smooth, 1 = no smoothing)
 */
export function ema(current: number, previous: number, alpha: number): number {
  return alpha * current + (1 - alpha) * previous
}

export class EMAFilter3D {
  private alpha: number
  private px = 0
  private py = 0
  private pz = 0
  private initialized = false

  constructor(alpha = 0.2) {
    this.alpha = alpha
  }

  update(x: number, y: number, z: number): { x: number; y: number; z: number } {
    if (!this.initialized) {
      this.px = x
      this.py = y
      this.pz = z
      this.initialized = true
      return { x, y, z }
    }

    this.px = ema(x, this.px, this.alpha)
    this.py = ema(y, this.py, this.alpha)
    this.pz = ema(z, this.pz, this.alpha)

    return { x: this.px, y: this.py, z: this.pz }
  }

  reset() {
    this.initialized = false
  }
}

export class EMAFilterAngles {
  private alpha: number
  private pitch = 0
  private yaw = 0
  private roll = 0
  private initialized = false

  constructor(alpha = 0.2) {
    this.alpha = alpha
  }

  update(pitch: number, yaw: number, roll: number): { pitch: number; yaw: number; roll: number } {
    if (!this.initialized) {
      this.pitch = pitch
      this.yaw = yaw
      this.roll = roll
      this.initialized = true
      return { pitch, yaw, roll }
    }

    this.pitch = ema(pitch, this.pitch, this.alpha)
    this.yaw = ema(yaw, this.yaw, this.alpha)
    this.roll = ema(roll, this.roll, this.alpha)

    return { pitch: this.pitch, yaw: this.yaw, roll: this.roll }
  }

  reset() {
    this.initialized = false
  }
}
