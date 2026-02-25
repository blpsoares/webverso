import { useEffect, useRef } from 'react'
import { useTrackingStore } from '../store/trackingStore'
import { useGestureStore } from '../store/gestureStore'

interface TrackingOverlayProps {
  visible?: boolean
}

export function TrackingOverlay({ visible = false }: TrackingOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { headOrientation, handPositions, faceDetected, handsDetected } = useTrackingStore()
  const { leftGesture, rightGesture } = useGestureStore()

  useEffect(() => {
    if (!visible) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.7)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Head info
    ctx.fillStyle = faceDetected ? '#00ff88' : '#ff4444'
    ctx.font = '14px monospace'
    ctx.fillText(`Face: ${faceDetected ? 'DETECTED' : 'NOT FOUND'}`, 10, 25)
    ctx.fillText(`Pitch: ${headOrientation.pitch.toFixed(3)}`, 10, 45)
    ctx.fillText(`Yaw:   ${headOrientation.yaw.toFixed(3)}`, 10, 65)
    ctx.fillText(`Roll:  ${headOrientation.roll.toFixed(3)}`, 10, 85)

    // Hand info
    ctx.fillStyle = '#00aaff'
    ctx.fillText(`Mãos: ${handsDetected}`, 10, 115)
    ctx.fillText(`Esq: ${leftGesture}`, 10, 135)
    ctx.fillText(`Dir: ${rightGesture}`, 10, 155)

    if (handPositions.left) {
      const lp = handPositions.left
      ctx.fillText(`L: (${lp.x.toFixed(2)}, ${lp.y.toFixed(2)}, ${lp.z.toFixed(2)})`, 10, 175)
    }
    if (handPositions.right) {
      const rp = handPositions.right
      ctx.fillText(`R: (${rp.x.toFixed(2)}, ${rp.y.toFixed(2)}, ${rp.z.toFixed(2)})`, 10, 195)
    }

    // Head orientation compass
    const cx = canvas.width - 80
    const cy = 80
    const r = 60

    ctx.strokeStyle = '#444'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()

    ctx.strokeStyle = '#00ff88'
    ctx.lineWidth = 3
    const ex = cx + Math.sin(headOrientation.yaw) * r
    const ey = cy - Math.cos(headOrientation.yaw) * r
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(ex, ey)
    ctx.stroke()

    ctx.fillStyle = '#00ff88'
    ctx.font = '12px monospace'
    ctx.fillText('N', cx - 4, cy - r - 5)

  }, [visible, headOrientation, handPositions, faceDetected, handsDetected, leftGesture, rightGesture])

  if (!visible) return null

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={220}
      className="absolute top-4 left-4 rounded-lg opacity-90 pointer-events-none"
      style={{ zIndex: 50 }}
    />
  )
}
