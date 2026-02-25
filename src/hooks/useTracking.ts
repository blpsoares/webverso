import { useEffect, useState } from 'react'
import { orchestrator } from '../tracking/TrackingOrchestrator'

type TrackingStatus = 'idle' | 'loading' | 'ready' | 'error'

interface UseTrackingResult {
  status: TrackingStatus
  error: string | null
  startTracking: (video: HTMLVideoElement) => void
  stopTracking: () => void
}

export function useTracking(): UseTrackingResult {
  const [status, setStatus] = useState<TrackingStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      orchestrator.stop()
    }
  }, [])

  const startTracking = async (video: HTMLVideoElement) => {
    setStatus('loading')
    try {
      await orchestrator.init(video)
      setStatus('ready')
      orchestrator.start()
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Erro ao inicializar tracking')
    }
  }

  const stopTracking = () => {
    orchestrator.stop()
    setStatus('idle')
  }

  return { status, error, startTracking, stopTracking }
}
