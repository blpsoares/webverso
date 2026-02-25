import { useEffect } from 'react'
import { useWebcam } from '../hooks/useWebcam'
import { useTracking } from '../hooks/useTracking'

interface WebcamFeedProps {
  onReady?: () => void
  onError?: (error: string) => void
}

export function WebcamFeed({ onReady, onError }: WebcamFeedProps) {
  const { videoRef, isReady, error } = useWebcam()
  const { startTracking } = useTracking()

  useEffect(() => {
    if (isReady && videoRef.current) {
      startTracking(videoRef.current)
      onReady?.()
    }
  }, [isReady]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (error) {
      onError?.(error)
    }
  }, [error]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <video
      ref={videoRef}
      style={{ display: 'none' }}
      playsInline
      muted
      width={1280}
      height={720}
    />
  )
}
