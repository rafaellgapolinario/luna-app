'use client'
import { useEffect, useRef } from 'react'

interface LunaIntroProps {
  userName?: string
  onDone?: () => void
  onFinish?: () => void
}

export default function LunaIntro({ userName, onDone, onFinish }: LunaIntroProps) {
  const voicePlayedRef = useRef(false)

  useEffect(() => {
    if (!voicePlayedRef.current) {
      voicePlayedRef.current = true
      playVoice(userName)
    }
    const timer = setTimeout(() => { (onDone ?? onFinish)?.() }, 6000)
    return () => clearTimeout(timer)
  }, [])

  async function playVoice(name?: string) {
    try {
      const hour = new Date().getHours()
      const greeting = hour >= 5 && hour < 12 ? 'Bom dia' : hour >= 12 && hour < 18 ? 'Boa tarde' : 'Boa noite'
      const text = name
        ? `${greeting}! Bem-vindo Ã  LUNA, ${name}. Seu assistente inteligente estÃ¡ pronto.`
        : `${greeting}! Bem-vindo Ã  LUNA. Seu assistente inteligente estÃ¡ pronto.`

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      if (res.ok) {
        const ct = res.headers.get('content-type') || ''
        let url: string
        if (ct.includes('audio')) {
          url = URL.createObjectURL(await res.blob())
        } else {
          const d = await res.json()
          url = 'data:audio/mpeg;base64,' + d.audio
        }
        new Audio(url).play().catch(() => {})
      }
    } catch (e) { console.log('TTS:', e) }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0a0a1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
      onClick={onFinish}
    >
      <video
        src="/luna-intro.mp4"
        autoPlay
        playsInline
        onEnded={() => (onDone ?? onFinish)?.()
        style={{ maxWidth: '100%', maxHeight: '80vh' }}
      />
      <p style={{ color: '#a78bfa', marginTop: 16, fontSize: 14, opacity: 0.7 }}>Clique para continuar</p>
    </div>
  )
}
