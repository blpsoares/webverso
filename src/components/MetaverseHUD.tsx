import { useState } from 'react'
import { useTrackingStore } from '../store/trackingStore'
import { useSceneStore } from '../store/sceneStore'
import { useGameStore } from '../store/gameStore'
import { TrackingOverlay } from './TrackingOverlay'
import { GestureIndicator } from './GestureIndicator'
import { SpaceSelector } from './SpaceSelector'
import { CameraPreview } from './CameraPreview'
import { GestureTrainer } from './GestureTrainer'
import { calibrateHeadNow } from '../tracking/algorithms/headOrientation'

interface ControlButtonProps {
  icon: string
  label: string
  onClick: () => void
  active?: boolean
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  title?: string
}

function ControlButton({ icon, label, onClick, active = false, variant = 'secondary', title }: ControlButtonProps) {
  const baseStyle = 'group relative px-3 py-2 rounded-lg border backdrop-blur transition-all duration-200 text-xs font-medium flex items-center gap-2 hover:scale-105'
  const variants = {
    primary: active ? 'bg-blue-500/20 border-blue-400/50 text-blue-300' : 'bg-blue-900/10 border-blue-400/20 text-blue-300/70 hover:bg-blue-900/20 hover:border-blue-400/40',
    secondary: active ? 'bg-slate-600/20 border-slate-400/50 text-slate-200' : 'bg-slate-900/20 border-slate-400/20 text-slate-300 hover:bg-slate-800/30 hover:border-slate-400/40',
    success: 'bg-emerald-900/20 border-emerald-400/30 text-emerald-300 hover:bg-emerald-900/30 hover:border-emerald-400/50',
    warning: 'bg-amber-900/20 border-amber-400/30 text-amber-300 hover:bg-amber-900/30 hover:border-amber-400/50',
    danger: 'bg-red-900/20 border-red-400/30 text-red-300 hover:bg-red-900/30 hover:border-red-400/50',
  }

  return (
    <button
      onClick={onClick}
      title={title}
      className={`${baseStyle} ${variants[variant]}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity" />
    </button>
  )
}

export function MetaverseHUD() {
  const { faceDetected, handsDetected, handTrackingEnabled, setHandTrackingEnabled } = useTrackingStore()
  const { activeSpace } = useSceneStore()
  const { pingPongScore, airplaneRingsPassed } = useGameStore()

  const [showDebug, setShowDebug] = useState(false)
  const [showSpaceSelector, setShowSpaceSelector] = useState(false)
  const [showCamera, setShowCamera] = useState(true)
  const [showTrainer, setShowTrainer] = useState(false)

  const spaceNames: Record<string, string> = { hub: '🚀 Arena', deathstar: '⚫ Reator' }

  return (
    <>
      {/* Top-left: Space & Status Panel */}
      <div className="absolute top-4 left-4 pointer-events-auto" style={{ zIndex: 40 }}>
        <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/60 backdrop-blur-md rounded-xl border border-slate-600/30 p-4 shadow-2xl">
          {/* Header */}
          <div className="mb-4 pb-3 border-b border-slate-600/20">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Espaço Atual</p>
            <p className="text-lg font-bold text-white">{spaceNames[activeSpace]}</p>
          </div>

          {/* Status Indicators */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${faceDetected ? 'bg-emerald-500/20 border border-emerald-400/50' : 'bg-red-500/20 border border-red-400/50'}`}>
                <div className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                <span className={`text-xs font-medium ${faceDetected ? 'text-emerald-300' : 'text-red-300'}`}>
                  {faceDetected ? '👤 Face OK' : '👤 Aguardando...'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${handsDetected > 0 ? 'bg-cyan-500/20 border border-cyan-400/50' : 'bg-slate-600/20 border border-slate-400/30'}`}>
                <div className={`w-2 h-2 rounded-full ${handsDetected > 0 ? 'bg-cyan-400 animate-pulse' : 'bg-slate-400'}`} />
                <span className={`text-xs font-medium ${handsDetected > 0 ? 'text-cyan-300' : 'text-slate-400'}`}>
                  👐 {handsDetected > 0 ? `${handsDetected} Mão(s)` : 'Sem mãos'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom-right: Control Panel */}
      <div className="absolute bottom-4 right-4 pointer-events-auto" style={{ zIndex: 40 }}>
        <div className="flex flex-col gap-3">
          {/* Primary controls */}
          <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/60 backdrop-blur-md rounded-xl border border-slate-600/30 p-3 shadow-2xl space-y-2">
            <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Controles</div>

            <ControlButton
              icon="📹"
              label={showCamera ? 'Câmera ON' : 'Câmera OFF'}
              onClick={() => setShowCamera(!showCamera)}
              active={showCamera}
              variant="primary"
            />

            <ControlButton
              icon={handTrackingEnabled ? '✋' : '🖱️'}
              label={handTrackingEnabled ? 'Mãos: ON' : 'Mãos: OFF'}
              onClick={() => setHandTrackingEnabled(!handTrackingEnabled)}
              active={handTrackingEnabled}
              variant="primary"
              title={handTrackingEnabled ? 'Modo rastreamento de mãos' : 'Modo mouse'}
            />

            <ControlButton
              icon="🎯"
              label="Calibrar"
              onClick={() => calibrateHeadNow()}
              variant="warning"
              title="Olhe reto para a câmera"
            />
          </div>

          {/* Secondary controls */}
          <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/60 backdrop-blur-md rounded-xl border border-slate-600/30 p-3 shadow-2xl space-y-2">
            <ControlButton
              icon="🌍"
              label="Espaços"
              onClick={() => setShowSpaceSelector(!showSpaceSelector)}
              active={showSpaceSelector}
              variant="secondary"
            />

            <ControlButton
              icon="🧠"
              label="Gestos"
              onClick={() => setShowTrainer(!showTrainer)}
              active={showTrainer}
              variant="success"
            />

            <ControlButton
              icon="🔧"
              label="Debug"
              onClick={() => setShowDebug(!showDebug)}
              active={showDebug}
              variant="secondary"
            />
          </div>
        </div>
      </div>

      {/* Overlays */}
      <TrackingOverlay visible={showDebug} />
      <GestureIndicator />
      {showSpaceSelector && <SpaceSelector onClose={() => setShowSpaceSelector(false)} />}
      {showCamera && <CameraPreview />}
      <GestureTrainer isOpen={showTrainer} onClose={() => setShowTrainer(false)} />
    </>
  )
}
