import { useGestureStore } from '../store/gestureStore'
import type { GestureType } from '../types/tracking'

const gestureEmoji: Record<GestureType, string> = {
  NONE: '',
  PINCH: '🤏',
  OPEN_PALM: '🖐',
  CLOSED_FIST: '✊',
  POINTING: '👆',
  WAVE: '👋',
  TWO_HAND_PINCH: '🤏🤏',
}

const gestureLabel: Record<GestureType, string> = {
  NONE: '',
  PINCH: 'Pinch',
  OPEN_PALM: 'Palma aberta',
  CLOSED_FIST: 'Punho',
  POINTING: 'Apontando',
  WAVE: 'Acenar',
  TWO_HAND_PINCH: 'Zoom',
}

export function GestureIndicator() {
  const { leftGesture, rightGesture } = useGestureStore()

  const hasGesture = leftGesture !== 'NONE' || rightGesture !== 'NONE'

  if (!hasGesture) return null

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4" style={{ zIndex: 50 }}>
      {leftGesture !== 'NONE' && (
        <div className="bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 flex items-center gap-2">
          <span className="text-lg">{gestureEmoji[leftGesture]}</span>
          <span className="text-sm font-medium">Esq: {gestureLabel[leftGesture]}</span>
        </div>
      )}
      {rightGesture !== 'NONE' && (
        <div className="bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 flex items-center gap-2">
          <span className="text-lg">{gestureEmoji[rightGesture]}</span>
          <span className="text-sm font-medium">Dir: {gestureLabel[rightGesture]}</span>
        </div>
      )}
    </div>
  )
}
