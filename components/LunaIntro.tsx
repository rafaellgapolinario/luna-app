'use client'
import { useEffect, useRef, useState } from 'react'

interface LunaIntroProps {
  userName?: string
  onDone?: () => void
  onFinish?: () => void
}

export default function LunaIntro({ userName, onDone, onFinish }: LunaIntroProps) {
  const voicePlayedRef = useRef(false)
  const [done, setDone] = useState(false)

  function handleFinish() {
    if (done) return
    setDone(true)
    if (onDone) onDone()
    else if (onFinish) onFinish()
  }

  useEffect(() => {
    if (!voicePlayedRef.current) {
      voicePlayedRef.current = true
      playVoice(userName)
    }
    // Auto-avançar após 4 segundos se o audio nao disparar o callback
    const timer = setTimeout(handleFinish, 4500)
    return () => clearTimeout(timer)
  }, [])

  async function playVoice(name?: string) {
    try {
      const hour = new Date().getHours()
      const greeting = hour >= 5 && hour < 12 ? 'Bom dia' : hour >= 12 && hour < 18 ? 'Boa tarde' : 'Boa noite'
      const text = name
        ? greeting + ', ' + name + '! Bem-vindo ao LUNA.'
        : greeting + '! Bem-vindo ao LUNA.'
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      if (res.ok) {
        const ct = res.headers.get('content-type') || ''
        let url
        if (ct.includes('audio')) {
          url = URL.createObjectURL(await res.blob())
        } else {
          const d = await res.json()
          url = 'data:audio/mpeg;base64,' + d.audio
        }
        const audio = new Audio(url)
        audio.onended = handleFinish
        audio.play().catch(() => {})
      }
    } catch (e) { console.log('TTS:', e) }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999, cursor: 'pointer',
        background: '#0a0a0f',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28,
      }}
      onClick={handleFinish}
    >
      {/* Glow de fundo */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 400,
        background: 'radial-gradient(ellipse, rgba(124,109,250,0.2) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo pulsando */}
      <div style={{
        width: 130, height: 130, borderRadius: '50%', overflow: 'hidden', position: 'relative',
        boxShadow: '0 0 50px rgba(124,109,250,0.7), 0 0 100px rgba(124,109,250,0.3)',
        animation: 'lunaPulse 2s ease-in-out infinite',
        zIndex: 1,
      }}>
        <img src="/luna-logo.png" alt="LUNA" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Nome */}
      <div style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 52,
        letterSpacing: -2, zIndex: 1,
        background: 'linear-gradient(135deg, #c084fc, #818cf8, #60a5fa)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        LUNA
      </div>

      {/* Indicador de audio */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', zIndex: 1 }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{
            width: 4, height: 20, borderRadius: 4, background: '#a78bfa',
            animation: `lunaBar 1s ease-in-out ${i * 0.12}s infinite`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes lunaPulse {
          0%,100%{box-shadow:0 0 50px rgba(124,109,250,0.7),0 0 100px rgba(124,109,250,0.3)}
          50%{box-shadow:0 0 80px rgba(124,109,250,1),0 0 160px rgba(124,109,250,0.5)}
        }
        @keyframes lunaBar {
          0%,100%{transform:scaleY(0.4);opacity:0.4}
          50%{transform:scaleY(1);opacity:1}
        }
      `}</style>
    </div>
  )
}
