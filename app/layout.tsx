import React from 'react'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { StoreProvider } from '@/lib/store'

export const metadata: Metadata = {
  title: 'LUNA — Assistente de Tarefas',
  description: 'IA + Agenda + WhatsApp integrados',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'LUNA' },
  verification: {
    google: 'eOVhnV2JUeHSCE2iLmOJz4z-KE4GP5r1Ya75l6-dJ7A',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0 }}>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  )
}
