import { useState, useRef } from 'react'
import { WebcamFeed } from './components/WebcamFeed'
import { MetaverseCanvas } from './scenes/MetaverseCanvas'
import { MetaverseHUD } from './components/MetaverseHUD'
import { LoadingScreen } from './components/LoadingScreen'

type AppState = 'loading' | 'ready' | 'error'

const LOADING_MESSAGES = [
  'Acessando câmera...',
  'Carregando modelos MediaPipe...',
  'Inicializando Hand Landmarker...',
  'Inicializando Face Landmarker...',
  'Quase pronto...',
]

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(5)
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedRef = useRef(false)

  const handleWebcamReady = () => {
    if (startedRef.current) return
    startedRef.current = true

    // Anima o progresso enquanto os modelos MediaPipe carregam (~3-6s)
    let progress = 20
    let msgIdx = 1

    intervalRef.current = setInterval(() => {
      progress += 8 + Math.random() * 8
      msgIdx = Math.min(LOADING_MESSAGES.length - 1, Math.floor((progress / 100) * LOADING_MESSAGES.length))

      if (progress >= 95) {
        progress = 95
        if (intervalRef.current) clearInterval(intervalRef.current)
      }

      setLoadingProgress(Math.min(95, Math.round(progress)))
      setLoadingMsgIdx(msgIdx)
    }, 400)

    // Aguarda o tempo real de carregamento dos modelos
    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setLoadingProgress(100)
      setTimeout(() => setAppState('ready'), 300)
    }, 5000)
  }

  const handleWebcamError = (err: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setError(err)
    setAppState('error')
  }

  return (
    <div className="relative w-full h-full">
      {/* Webcam oculta + inicialização do tracking */}
      <WebcamFeed onReady={handleWebcamReady} onError={handleWebcamError} />

      {appState === 'loading' && (
        <LoadingScreen
          progress={loadingProgress}
          message={LOADING_MESSAGES[loadingMsgIdx]}
        />
      )}

      {appState === 'error' && <LoadingScreen error={error} />}

      {appState === 'ready' && (
        <>
          <MetaverseCanvas />
          <MetaverseHUD />
        </>
      )}
    </div>
  )
}
