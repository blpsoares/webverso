import { useEffect, useRef, useState } from 'react'
import { useTrackingStore } from '../store/trackingStore'

interface Pos { x: number; y: number }

export function CameraPreview() {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const { mediaStream } = useTrackingStore()

  // Estado de drag
  const [pos, setPos]         = useState<Pos>({ x: 16, y: 80 })
  const [size, setSize]       = useState(220)  // largura em px
  const dragging  = useRef(false)
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !mediaStream) return
    video.srcObject = mediaStream
    video.play().catch(() => {})
    return () => { video.srcObject = null }
  }, [mediaStream])

  // Mouse drag
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: pos.x, oy: pos.y }
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current || !dragStart.current) return
      setPos({
        x: dragStart.current.ox + (e.clientX - dragStart.current.mx),
        y: dragStart.current.oy + (e.clientY - dragStart.current.my),
      })
    }
    const onUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  // Touch drag
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    dragging.current = true
    dragStart.current = { mx: t.clientX, my: t.clientY, ox: pos.x, oy: pos.y }
  }

  useEffect(() => {
    const onMove = (e: TouchEvent) => {
      if (!dragging.current || !dragStart.current) return
      const t = e.touches[0]
      setPos({
        x: dragStart.current.ox + (t.clientX - dragStart.current.mx),
        y: dragStart.current.oy + (t.clientY - dragStart.current.my),
      })
    }
    const onEnd = () => { dragging.current = false }
    window.addEventListener('touchmove', onMove)
    window.addEventListener('touchend', onEnd)
    return () => {
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
  }, [])

  const height = Math.round(size * 0.5625) // 16:9

  return (
    <div
      className="absolute select-none transition-transform duration-200 hover:scale-105"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex: 55,
        width: size,
      }}
    >
      {/* Sombra decorativa */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-transparent rounded-xl blur-xl -z-10"
        style={{ width: size, height: height + 40 }}
      />

      {/* Container */}
      <div className="rounded-xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-slate-900/60 to-black/80 backdrop-blur-sm shadow-2xl">
        {/* Barra de drag + controles */}
        <div
          className="flex items-center justify-between bg-gradient-to-r from-cyan-600/30 to-blue-600/30 px-3 py-2 cursor-grab active:cursor-grabbing border-b border-cyan-500/20 hover:bg-gradient-to-r hover:from-cyan-600/40 hover:to-blue-600/40 transition-colors"
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          <div className="flex items-center gap-2">
            <span className="text-cyan-300 text-xs font-bold">📹 CÂMERA AO VIVO</span>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <div className="flex gap-1">
            <button
              className="bg-slate-700/50 hover:bg-cyan-600/50 text-cyan-300 text-xs px-2 py-1 rounded transition-colors border border-cyan-500/20"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setSize((s) => Math.max(120, s - 40))}
              title="Diminuir"
            >
              −
            </button>
            <button
              className="bg-slate-700/50 hover:bg-cyan-600/50 text-cyan-300 text-xs px-2 py-1 rounded transition-colors border border-cyan-500/20"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setSize((s) => Math.min(480, s + 40))}
              title="Aumentar"
            >
              +
            </button>
          </div>
        </div>

        {/* Vídeo espelhado horizontalmente */}
        <video
          ref={videoRef}
          width={size}
          height={height}
          style={{
            width: size,
            height,
            display: 'block',
            transform: 'scaleX(-1)',
            objectFit: 'cover',
            background: '#000',
          }}
          playsInline
          muted
          autoPlay
        />

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-2">
          <p className="text-cyan-300 text-xs font-bold">Arraste para mover</p>
        </div>
      </div>
    </div>
  )
}
