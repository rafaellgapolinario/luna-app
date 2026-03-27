'use client'
import { useRef, useEffect } from 'react'

interface Props {
  onDone: () => void
  userName?: string
}

export function LunaIntro({ onDone, userName }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const voicePlayed = useRef(false)
  const opacity = useRef(1)

  async function playWelcomeVoice() {
    if (voicePlayed.current) return
    voicePlayed.current = true
    try {
      const nome = userName ? `, ${userName}` : ''
      const texto = `Bem-vindo a LUNA${nome}. Seu assistente inteligente esta pronto para te ajudar.`
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: texto }),
      })
      if (res.ok) {
        const ct = res.headers.get('content-type') || ''
        let blob: Blob
        if (ct.includes('audio')) {
          blob = new Blob([await res.arrayBuffer()], { type: 'audio/mpeg' })
        } else {
          const { audioBase64 } = await res.json()
          if (!audioBase64) return
          const binary = atob(audioBase64)
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
          blob = new Blob([bytes], { type: 'audio/mp3' })
        }
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.onended = () => URL.revokeObjectURL(url)
        audio.play().catch(() => {})
      }
    } catch {}
  }

  function dismiss() {
    const el = document.getElementById('luna-intro-overlay')
    if (el) el.style.opacity = '0'
    setTimeout(onDone, 600)
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Tocar voz imediatamente (não esperar o vídeo)
    playWelcomeVoice()

    const fallback = setTimeout(dismiss, 10000)
    const handleEnd = () => { clearTimeout(fallback); dismiss() }

    video.addEventListener('ended', handleEnd)
    video.play().catch(() => {
      clearTimeout(fallback)
      setTimeout(dismiss, 4000)
    })

    return () => {
      clearTimeout(fallback)
      video.removeEventListener('ended', handleEnd)
    }
  }, [])

  return (
    <div
      id="luna-intro-overlay"
      onClick={dismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: 1, transition: 'opacity 0.6s ease',
        cursor: 'pointer',
      }}
    >
      <video
        ref={videoRef}
        src="/luna-intro.mp4"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        muted={false}
        playsInline
        preload="auto"
      />
      <div style={{
        position: 'absolute', top: 32, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        pointerEvents: 'none',
      }}>
        <img src="/luna-logo.png" alt="LUNA" width={52} height={52} style={{ borderRadius: '50%', boxShadow: '0 0 30px rgba(167,139,250,0.6)' }} />
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, letterSpacing: -0.5, background: 'linear-gradient(135deg, #c084fc, #818cf8, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LUNA</div>
      </div>
      <div style={{ position: 'absolute', bottom: 24, right: 24, fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'DM Sans, sans-serif' }}>
        Toque para pular
      </div>
    </div>
  )
}
