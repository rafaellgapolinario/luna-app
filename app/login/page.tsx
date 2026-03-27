'use client'
import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { t } from '@/lib/translations'
import { Toast } from '@/components/Toast'
import LunaIntro from '@/components/LunaIntro'

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
const SCOPES    = 'https://www.googleapis.com/auth/calendar openid email profile'

declare global { interface Window { google: any } }

export default function LoginPage() {
  const { lang, accessToken, setAuth, showToast } = useStore(s => ({
    lang: s.lang, accessToken: s.accessToken, setAuth: s.setAuth, showToast: s.showToast,
  }))
  const router = useRouter()
  const [showIntro, setShowIntro] = useState(false)
  const [introName, setIntroName] = useState('')

  useEffect(() => {
    if (accessToken) router.replace('/app')
  }, [accessToken, router])

  useEffect(() => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true; s.defer = true
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
            headers: { Authorization: `Bearer ${resp.access_token}` }
          })
          const profile = await pr.json()
          const authRes = await fetch('/api/auth', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ googleId: profile.sub, nome: profile.name, email: profile.email, avatar: profile.picture }),
          })
          const authData = await authRes.json()
          setAuth(resp.access_token, profile, authData.id)
          setIntroName(profile.given_name || profile.name || '')
          showToast(t(lang, 'logged_in'))
          setShowIntro(true)
        } catch { showToast(t(lang, 'err_connect')) }
      },
    }).requestAccessToken({ prompt: 'consent' })
  }

  return (
    <>
      {showIntro && <LunaIntro onDone={() => { setShowIntro(false); router.replace('/app') }} userName={introName} />}

      <div style={{ minHeight: '100dvh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif" }}>

        {/* Glow background */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, background: 'radial-gradient(ellipse, rgba(124,109,250,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: 300, height: 300, background: 'radial-gradient(ellipse, rgba(96,165,250,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Card central */}
        <div style={{
          width: '100%', maxWidth: 420, margin: '0 16px',
          background: 'rgba(19,19,26,0.85)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(124,109,250,0.2)',
          borderRadius: 24, padding: '48px 40px',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 40px 80px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
        }}>

          {/* Logo */}
          <div style={{
            width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', marginBottom: 24,
            boxShadow: '0 0 40px rgba(124,109,250,0.5), 0 0 80px rgba(124,109,250,0.2)',
            border: '2px solid rgba(124,109,250,0.4)',
          }}>
            <img src="/luna-logo.png" alt="LUNA" width={96} height={96} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
          </div>

          {/* Nome */}
          <div style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36,
            letterSpacing: -1.5, marginBottom: 8,
            background: 'linear-gradient(135deg, #c084fc, #818cf8, #60a5fa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            LUNA
          </div>

          {/* Tagline */}
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 1.6, marginBottom: 40, maxWidth: 300 }}>
            Seu assistente inteligente de tarefas. IA + Agenda + WhatsApp integrados.
          </div>

          {/* Divider */}
          <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 32 }} />

          {/* Titulo login */}
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 16, letterSpacing: 0.3 }}>
            Entre com sua conta Google
          </div>

          {/* Botao Google */}
          <button
            onClick={startLogin}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12, padding: '14px 20px', cursor: 'pointer',
              fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 15, color: '#f0f0f8',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,109,250,0.15)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(124,109,250,0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Entrar com Google
          </button>

          {/* Nota rodape */}
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 20, lineHeight: 1.7 }}>
            Ao entrar, voce autoriza o LUNA a acessar<br />sua agenda Google. Seus dados sao protegidos.
          </div>
        </div>
      </div>
      <Toast />
    </>
  )
}
