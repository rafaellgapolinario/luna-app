'use client'
import React, { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar }   from './Sidebar'
import { Topbar }    from './Topbar'
import { BottomNav } from './BottomNav'
import { Toast }     from './Toast'
export function AppShell({ children }: { children: React.ReactNode }) {
  const accessToken = useStore(s => s.accessToken)
  const router   = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && !accessToken && pathname !== '/login') {
      router.replace('/login')
    }
  }, [mounted, accessToken, pathname, router])

  // Show spinner until hydrated
  if (!mounted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: 'var(--bg)', flexDirection: 'column', gap: 16 }}>
        <img src="/luna-logo.png" alt="LUNA" width={48} height={48} style={{ objectFit: "contain", borderRadius: "50%" }} />
        <div className="spinner animate-spin-slow" />
      </div>
    )
  }

  // Not logged in — let redirect happen
  if (!accessToken && pathname !== '/login') return null

  // Login page has its own layout
  if (pathname === '/login') return <>{children}<Toast /></>

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden' }}>
      <div className="sidebar-desktop"><Sidebar /></div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar />
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
        {/* Footer com links legais - necessário para verificação Google OAuth */}
        <div style={{ textAlign: 'center', padding: '4px 0', fontSize: 10, color: 'var(--text3)', flexShrink: 0, borderTop: '1px solid var(--border)' }}>
          <a href="/privacy" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Política de Privacidade</a>
          {' · '}
          <a href="/terms" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Termos de Uso</a>
        </div>
        <BottomNav />
      </div>
      <Toast />

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .bottom-nav-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
