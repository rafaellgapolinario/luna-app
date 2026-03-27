'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

export default function AppRedirect() {
  const router = useRouter()
  const accessToken = useStore(s => s.accessToken)

  useEffect(() => {
    if (accessToken) {
      router.replace('/luna')
    } else {
      router.replace('/login')
    }
  }, [accessToken, router])

  return (
    <div style={{ display: 'flex', height: '100dvh', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(124,109,250,0.3)', borderTopColor: '#7c6dfa', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{"@keyframes spin { to { transform: rotate(360deg) } }"}</style>
    </div>
  )
}
