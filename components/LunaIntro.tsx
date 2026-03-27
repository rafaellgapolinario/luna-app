'use client'
import { useState, useRef, useEffect } from 'react'

interface Props {
  onDone: () => void
}

export function LunaIntro({ onDone }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleEnd = () => {
      // Fade out
      setOpacity(0)
      setTimeout(onDone, 600)
    }

    // Se o vídeo não carregar em 3s, skip
    const fallback = setTimeout(() => {
      setOpacity(0)
      setTimeout(onDone, 600)
    }, 8000)

    video.addEventListener('ended', handleEnd)
    video.play().catch(() => {
      clearTimeout(fallback)
      onDone()
    })

    return () => {
      clearTimeout(fallback)
      video.removeEventListener('ended', handleEnd)
    }
  }, [onDone])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity, transition: 'opacity 0.6s ease',
        cursor: 'pointer',
      }}
      onClick={() => { setOpacity(0); setTimeout(onDone, 600) }}
    >
      <video
        ref={videoRef}
        src="/luna-intro.mp4"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        muted={false}
        playsInline
        preload="auto"
      />
      {/* Skip hint */}
      <div style={{
        position: 'absolute', bottom: 32, right: 32,
        fontSize: 12, color: 'rgba(255,255,255,0.4)',
        fontFamily: 'DM Sans, sans-serif', letterSpacing: 0.5,
      }}>
        Toque para pular
      </div>
    </div>
  )
}
