'use client'
import { useEffect, useRef, useState } from 'react'

interface LunaIntroProps {
  userName?: string
  onDone?: () => void
  onFinish?: () => void
}

export default function LunaIntro({ userName, onDone, onFinish }: LunaIntroProps) {
  const voicePlayedRef = useRef(false)
  const [videoError, setVideoError] = useState(false)

  function handleFinish() {
    if (onDone) onDone()
    else if (onFinish) onFinish()
  }

  useEffect(() => {
    if (!voicePlayedRef.current) {
      voicePlayedRef.current = true
      playVoice(userName)
    }
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
        new Audio(url).play().catch(() => {})
      }
    } catch (e) { console.log('TTS:', e) }
  }

  // Fallback animado quando o video nao carrega
  if (videoError) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999, cursor: 'pointer',
          background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(124,109,250,0.25) 0%, #0a0a0f 70%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24,
        }}
        onClick={handleFinish}
      >
        <div style={{
          width: 120, height: 120, borderRadius: '50%', overflow: 'hidden',
          boxShadow: '0 0 60px rgba(124,109,250,0.6), 0 0 120px rgba(124,109,250,0.2)',
          animation: 'lunaPulse 2s ease-in-out infinite',
        }}>
          <img src="/luna-logo.png" alt="LUNA" width={120} height={120} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        </div>
        <div style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 48, letterSpacing: -2,
          background: 'linear-gradient(135deg, #c084fc, #818cf8, #60a5fa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>LUNA</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: '50%', background: '#a78bfa',
              animation: `lunaWave 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
        <style>{`
          @keyframes lunaPulse {
            0%,100%{box-shadow:0 0 60px rgba(124,109,250,0.6),0 0 120px rgba(124,109,250,0.2)}
            50%{box-shadow:0 0 80px rgba(124,109,250,0.9),0 0 160px rgba(124,109,250,0.35)}
          }
          @keyframes lunaWave {
            0%,100%{transform:scaleY(0.5);opacity:0.5}
            50%{transform:scaleY(1.8);opacity:1}
          }
        `}</style>
      </div>
    )
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000', cursor: 'pointer' }}
      onClick={handleFinish}
    >
      <video
        src="/luna-intro.mp4"
        autoPlay
        playsInline
        onEnded={handleFinish}
        onError={() => setVideoError(true)}
        style={{ width: '100vw', height: '100vh', objectFit: 'cover', display: 'block' }}
      />
    </div>
  )
}
