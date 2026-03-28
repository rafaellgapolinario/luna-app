'use client'
import { useEffect, useRef, useState } from 'react'

interface LunaIntroProps {
  userName?: string
  onDone?: () => void
  onFinish?: () => void
}

const VIDEO_URL = 'https://hqlwolczdlsarvmtncke.supabase.co/storage/v1/object/public/luna-assets/luna-intro.mp4'

export default function LunaIntro({ userName, onDone, onFinish }: LunaIntroProps) {
  const voicePlayedRef = useRef(false)
  const [videoError, setVideoError] = useState(false)
  const doneCalled = useRef(false)

  function handleFinish() {
    if (doneCalled.current) return
    doneCalled.current = true
    if (onDone) onDone()
    else if (onFinish) onFinish()
  }

  useEffect(() => {
    if (!voicePlayedRef.current) {
      voicePlayedRef.current = true
      playVoice(userName)
    }
    const timer = setTimeout(handleFinish, 8000)
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
        new Audio(url).play().catch(() => {})
      }
    } catch (e) { console.log('TTS:', e) }
  }

  if (videoError) {
    return (
      <div
        onClick={handleFinish}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999, cursor: 'pointer',
          background: '#0a0a0f',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28,
        }}
      >
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 400, background: 'radial-gradient(ellipse, rgba(124,109,250,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ width: 130, height: 130, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 50px rgba(124,109,250,0.7)', animation: 'lunaPulse 2s ease-in-out infinite', zIndex: 1 }}>
          <img src="/luna-logo.png" alt="LUNA" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 52, letterSpacing: -2, zIndex: 1, background: 'linear-gradient(135deg, #c084fc, #818cf8, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LUNA</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', zIndex: 1 }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{ width: 4, height: 20, borderRadius: 4, background: '#a78bfa', animation: `lunaBar 1s ease-in-out ${i * 0.12}s infinite` }} />
          ))}
        </div>
        <style>{`
          @keyframes lunaPulse { 0%,100%{box-shadow:0 0 50px rgba(124,109,250,0.7)} 50%{box-shadow:0 0 80px rgba(124,109,250,1)} }
          @keyframes lunaBar { 0%,100%{transform:scaleY(0.4);opacity:0.4} 50%{transform:scaleY(1);opacity:1} }
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
        src={VIDEO_URL}
        autoPlay
        playsInline
        onEnded={handleFinish}
        onError={() => setVideoError(true)}
        style={{ width: '100vw', height: '100vh', objectFit: 'cover', display: 'block' }}
      />
    </div>
  )
}
