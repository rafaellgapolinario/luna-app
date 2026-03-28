'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { t } from '@/lib/translations'
import { AppShell } from '@/components/AppShell'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { lang, userProfile, geminiKey, setSettings, setLang, logout, showToast } = useStore(s => ({
    lang: s.lang, userProfile: s.userProfile, geminiKey: s.geminiKey,
    setSettings: s.setSettings, setLang: s.setLang,
    logout: s.logout, showToast: s.showToast,
  }))
  const router = useRouter()
  const [gkVal, setGkVal] = useState(geminiKey)

  function saveGemini() {
    setSettings({ geminiKey: gkVal.trim() })
    showToast('Gemini API salva!')
  }

  function handleLogout() {
    logout()
    router.replace('/login')
  }

  return (
    <AppShell>
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 24, marginBottom: 8 }}>
          {t(lang, 'settings_title')}
        </h1>
        <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 32 }}>
          Gerencie suas preferencias e integracoes.
        </p>

        {/* Perfil */}
        <div style={{ marginBottom: 12, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text3)', textTransform: 'uppercase' }}>Perfil</div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          {userProfile?.picture && (
            <img src={userProfile.picture} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{userProfile?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>{userProfile?.email}</div>
          </div>
        </div>

        {/* Idioma */}
        <div style={{ marginBottom: 12, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text3)', textTransform: 'uppercase' }}>Idioma</div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['pt','en','es'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)',
                background: lang === l ? 'var(--accent)' : 'var(--bg3)',
                color: lang === l ? '#fff' : 'var(--text2)',
                fontWeight: 600, cursor: 'pointer', fontSize: 13,
              }}>
                {l === 'pt' ? 'Portugues' : l === 'en' ? 'English' : 'Espanol'}
              </button>
            ))}
          </div>
        </div>

        {/* Gemini API */}
        <div style={{ marginBottom: 12, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text3)', textTransform: 'uppercase' }}>Gemini API (opcional)</div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10, lineHeight: 1.6 }}>
            Use sua propria chave Gemini para mensagens ilimitadas. Obtenha em{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--accent2)' }}>aistudio.google.com</a>
          </div>
          <input
            className="input-field"
            placeholder="AIza..."
            value={gkVal}
            onChange={e => setGkVal(e.target.value)}
            style={{ marginBottom: 10 }}
          />
          <button className="btn-primary" onClick={saveGemini}>
            Salvar chave Gemini
          </button>
        </div>

        {/* Logout */}
        <div style={{ marginBottom: 12, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text3)', textTransform: 'uppercase' }}>Sessao</div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <button
            onClick={handleLogout}
            style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
          >
            Sair da conta
          </button>
        </div>
      </div>
    </AppShell>
  )
}
