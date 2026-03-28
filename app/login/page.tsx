'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import LunaIntro from '@/components/LunaIntro'

declare global {
  interface Window {
    google: any
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
const SCOPES = 'openid email profile https://www.googleapis.com/auth/calendar'

export default function LoginPage() {
  const router = useRouter()
  const { accessToken, setAuth, showToast } = useStore(s => ({
    accessToken: s.accessToken,
    setAuth: s.setAuth,
    showToast: s.showToast,
  }))
  const [showIntro, setShowIntro] = useState(false)
  const [introName, setIntroName] = useState('')

  useEffect(() => {
    if (accessToken && !showIntro) router.replace('/luna')
  }, [accessToken, router, showIntro])

  useEffect(() => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    document.head.appendChild(s)
    return () => { if (document.head.contains(s)) document.head.removeChild(s) }
  }, [])

  async function startLogin() {
    if (!window.google) { showToast('Aguarde...'); setTimeout(startLogin, 1000); return }
    window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID, scope: SCOPES,
      callback: async (resp: any) => {
        if (resp.error) { showToast('Erro: ' + resp.error); return }
        try {
          const pr = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: 'Bearer ' + resp.access_token }
          })
          const profile = await pr.json()
          const authRes = await fetch('/api/auth', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ googleId: profile.sub, nome: profile.name, email: profile.email, avatar: profile.picture }),
          })
          const authData = await authRes.json()
          setAuth(resp.access_token, profile, authData.id)
          setIntroName(profile.given_name || profile.name || '')
          showToast('Bem-vindo!')
          setShowIntro(true)
        } catch { showToast('Erro de conexao') }
      },
    }).requestAccessToken({ prompt: 'consent' })
  }

  function handleIntroDone() {
    setShowIntro(false)
    router.replace('/luna')
  }

  return (
    <>
      {showIntro && (
        <LunaIntro
          userName={introName}
          onDone={handleIntroDone}
          onFinish={handleIntroDone}
        />
      )}
      <div style={{ minHeight: '100dvh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, background: 'radial-gradient(ellipse, rgba(124,109,250,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: 300, height: 300, background: 'radial-gradient(ellipse, rgba(96,165,250,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ width: '100%', maxWidth: 420, margin: '0 16px', background: 'rgba(19,19,26,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(124,109,250,0.2)', borderRadius: 24, padding: '48px 40px', boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 40px 80px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 40 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(124,109,250,0.4)', boxShadow: '0 0 30px rgba(124,109,250,0.5)' }}>
              <img src="/luna-logo.png" alt="LUNA" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, letterSpacing: -0.5, textAlign: 'center', background: 'linear-gradient(135deg,#c084fc,#818cf8,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LUNA</h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 6 }}>Seu assistente inteligente de tarefas. IA + Agenda + WhatsApp integrados.</p>
            </div>
          </div>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 28 }} />
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 16 }}>Entre com sua conta Google</p>
          <button onClick={startLogin} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14px 24px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Entrar com Google
          </button>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>Ao entrar, voce autoriza o LUNA a acessar<br/>sua agenda Google. Seus dados sao protegidos.</p>
        </div>
      </div>
    </>
  )
}
