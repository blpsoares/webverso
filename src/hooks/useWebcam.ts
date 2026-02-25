import { useEffect, useRef, useState } from 'react'
import { useTrackingStore } from '../store/trackingStore'

interface UseWebcamResult {
  videoRef: React.RefObject<HTMLVideoElement>
  stream: MediaStream | null
  error: string | null
  isReady: boolean
}

export function useWebcam(): UseWebcamResult {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let mounted = true
    let mediaStream: MediaStream | null = null

    async function init() {
      try {
        const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width:  { ideal: isMobile ? 640  : 1280 },
            height: { ideal: isMobile ? 480  : 720  },
            facingMode: 'user',
          },
        })

        if (!mounted) {
          mediaStream.getTracks().forEach((t) => t.stop())
          return
        }

        const video = videoRef.current
        if (!video) return

        video.srcObject = mediaStream

        // Aguarda o vídeo estar com dados suficientes (HAVE_ENOUGH_DATA = 4)
        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => {
            video
              .play()
              .then(() => {
                // Espera o primeiro frame real estar disponível
                const waitForData = () => {
                  if (video.readyState >= 4) {
                    resolve()
                  } else {
                    requestAnimationFrame(waitForData)
                  }
                }
                waitForData()
              })
              .catch(reject)
          }
          video.onerror = () => reject(new Error('Erro no elemento de vídeo'))
        })

        if (mounted) {
          setStream(mediaStream)
          setIsReady(true)
          useTrackingStore.getState().setMediaStream(mediaStream)
        }
      } catch (err) {
        if (mounted) {
          const msg =
            err instanceof Error
              ? err.message
              : 'Erro ao acessar a câmera. Verifique as permissões.'
          console.error('[Webcam]', err)
          setError(msg)
        }
      }
    }

    init()

    return () => {
      mounted = false
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  return { videoRef, stream, error, isReady }
}
