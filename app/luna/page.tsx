'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useStore } from '@/lib/store'
import { AppShell } from '@/components/AppShell'

type S = 'idle' | 'listening' | 'thinking' | 'speaking'

function cleanTTS(t: string) {
  return t.replace(/\*\*(.*?)\*\*/g, '$1').replace(/#{1,6}\s/g, '')
    .replace(/[\u{1F300}-\u{1FFFF}\u2600-\u27BF]/gu, '').substring(0, 350)
}

const COL = { idle: '#7c6dfa', listening: '#f87171', thinking: '#f59e0b', speaking: '#22d3a0' }

function uid() { return Math.random().toString(36).slice(2) }
function tstr() { return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }

interface Msg { id: string; role: 'user' | 'luna'; text: string; time: string }

export default function LUNAPage() {
  const { lang, userProfile, geminiKey, calendarEvents, accessToken, showToast, addMessage, chatHistory, userDbId } = useStore(s => ({
    lang: s.lang, userProfile: s.userProfile, geminiKey: s.geminiKey,
    calendarEvents: s.calendarEvents, accessToken: s.accessToken,
    showToast: s.showToast, addMessage: s.addMessage, chatHistory: s.chatHistory, userDbId: s.userDbId,
  }))

  const [s, setS] = useState<S>('idle')
  const [msgs, setMsgs] = useState<Msg[]>([{ id: uid(), role: 'luna', time: tstr(), text: 'Ola' + (userProfile ? ', ' + (userProfile.given_name || userProfile.name) : '') + '! Pressione o botao do microfone ou Espaco para falar.' }])
  const [input, setInput] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  const sRef = useRef<S>('idle')
  const recRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasSentRef = useRef(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    sRef.current = s
  }, [s])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const speak = useCallback(async (text: string) => {
    const clean = cleanTTS(text)
    if (!clean) return
    setS('speaking')
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.onended = () => { URL.revokeObjectURL(url); if (sRef.current === 'speaking') setS('idle') }
        audio.onerror = () => { URL.revokeObjectURL(url); if (sRef.current === 'speaking') setS('idle') }
        await audio.play()
        return
      }
    } catch (e) { console.error('ElevenLabs TTS error:', e) }
    // Fallback: Web Speech API
    window.speechSynthesis?.cancel()
    const utt = new SpeechSynthesisUtterance(clean)
    utt.lang = lang === 'en' ? 'en-US' : 'pt-BR'
    utt.rate = 1.05
    utt.onend = () => { if (sRef.current === 'speaking') setS('idle') }
    window.speechSynthesis?.speak(utt)
  }, [lang])

  const addMsg = useCallback((role: 'user' | 'luna', text: string) => {
    const msg: Msg = { id: uid(), role, time: tstr(), text }
    setMsgs(prev => [...prev, msg])
    addMessage({ role: role === 'luna' ? 'assistant' : 'user', content: text })
    return msg
  }, [addMessage])

  const sendToLuna = useCallback(async (text: string) => {
    if (!text.trim()) return
    addMsg('user', text)
    setS('thinking')

    try {
      const cal = calendarEvents.slice(0, 8).map(e => `${e.summary} (${e.start.dateTime || e.start.date})`).join(', ')
      const history = chatHistory.slice(-10).map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatHistory.slice(-8).map(m => ({ role: m.role, content: m.content })), { role: 'user', content: text }],
          lang, userName: userProfile?.given_name || userProfile?.name || '',
          calendarContext: cal, geminiKey, accessToken,
          userId: userDbId,
          voiceMode: false,
        })
      })

      let fullText = ''
      let data: { reply?: string; eventCreated?: boolean; noteCreated?: boolean } = {}

      const ct = res.headers.get('content-type') || ''
      if (ct.includes('text/event-stream')) {
        const reader = res.body?.getReader()
        const decoder = new TextDecoder()
        while (reader) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          for (const line of chunk.split('\n')) {
            if (line.startsWith('data: ')) {
              try {
                const obj = JSON.parse(line.slice(6))
                if (obj.text) fullText += obj.text
                if (obj.done) data = obj
              } catch { /* */ }
            }
          }
        }
        if (!fullText) data = { reply: 'Nao consegui processar.' }
        else data = { reply: fullText, ...data }
      } else {
        try { data = await res.json() } catch { data = { reply: 'Nao consegui processar.' } }
      }

      const reply: string = data.reply || 'Nao consegui processar.'
      let tag = ''
      if (data.noteCreated) tag = '[OK] Salvo!'
      if (data.eventCreated) tag = '[OK] Evento criado!'

      addMsg('luna', (tag ? tag + ' ' : '') + reply)
      setS('idle')
      speak(reply)
      if (tag) showToast(tag)
    } catch (e) {
      addMsg('luna', 'Erro de conexao.')
      setS('idle')
    }
  }, [lang, userProfile, geminiKey, calendarEvents, accessToken, chatHistory, addMsg, speak, showToast])


  // Mic usa Web Speech API diretamente - sem servidor
  const startMic = useCallback(() => {
    if (sRef.current !== 'idle') return
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      addMsg('luna', 'Reconhecimento de voz nao suportado. Use Chrome.')
      return
    }
    const recog = new SR()
    recog.lang = lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'pt-BR'
    recog.continuous = false
    recog.interimResults = false
    recog.maxAlternatives = 1
    recog.onstart = () => setS('listening')
    recog.onresult = (e: any) => {
      const text = e.results[0]?.[0]?.transcript?.trim() || ''
      if (text) sendToLuna(text)
      else setS('idle')
    }
    recog.onspeechend = () => recog.stop()
    recog.onerror = (e: any) => {
      console.error('SpeechRecognition error:', e.error)
      if (e.error === 'not-allowed') addMsg('luna', 'Permita o microfone nas configuracoes do navegador.')
      setS('idle')
    }
    recog.onend = () => { if (sRef.current === 'listening') setS('idle') }
    recog.start()
    recRef.current = recog as any
  }, [lang, sendToLuna, addMsg])

  const stopMic = useCallback(() => {
    if (recRef.current) { (recRef.current as any).stop?.(); recRef.current = null }
    if (sRef.current === 'listening') setS('idle')
  }, [])

, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        if (!hasSentRef.current) {
          hasSentRef.current = true
          if (sRef.current === 'idle') startMic()
          else if (sRef.current === 'listening') stopMic()
        }
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') hasSentRef.current = false
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKeyUp)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKeyUp) }
  }, [startMic, stopMic])

  async function handleSend() {
    if (!input.trim()) return
    const text = input.trim()
    setInput('')
    await sendToLuna(text)
  }

  const col = (COL as Record<string, string>)[s] || '#7c6dfa'
  const isActive = s !== 'idle'
  let statusLabel = 'Pronto'
  if (s === 'listening') statusLabel = 'Ouvindo...'
  if (s === 'thinking') statusLabel = 'Processando...'
  if (s === 'speaking') statusLabel = 'LUNA falando...'

  const quickBtns = [
    ['Agenda', 'O que tenho na agenda hoje?'],
    ['Anota', 'Anota: '],
    ['Tarefa', 'Cria tarefa: '],
    ['Lembrete', 'Me lembra de '],
    ['Semana', 'Resumo da minha semana'],
  ]

  return (
    <AppShell>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)', overflow: 'hidden', position: 'relative' }}>

        {/* Ambient glow */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 60% 40% at 50% 50%,${col}0e 0%,transparent 70%)`, transition: 'background 0.5s', zIndex: 0 }} />

        {/* JARVIS EFFECT - efeito visual quando mic ativo */}
        {(s === 'listening' || s === 'thinking' || s === 'speaking') && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 40 }}>
            <div style={{ position: 'relative', width: 280, height: 280 }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid ' + (s==='listening'?'rgba(248,113,113,0.7)':s==='thinking'?'rgba(245,158,11,0.7)':'rgba(34,211,160,0.7)'), animation: 'jR1 2s ease-in-out infinite' }} />
              <div style={{ position: 'absolute', inset: 20, borderRadius: '50%', border: '1px solid ' + (s==='listening'?'rgba(248,113,113,0.4)':s==='thinking'?'rgba(245,158,11,0.4)':'rgba(34,211,160,0.4)'), animation: 'jR2 2s ease-in-out infinite 0.25s' }} />
              <div style={{ position: 'absolute', inset: 40, borderRadius: '50%', border: '1px solid ' + (s==='listening'?'rgba(248,113,113,0.25)':s==='thinking'?'rgba(245,158,11,0.25)':'rgba(34,211,160,0.25)'), animation: 'jR1 2s ease-in-out infinite 0.5s' }} />
              <div style={{ position: 'absolute', inset: 60, borderRadius: '50%', border: '1px solid ' + (s==='listening'?'rgba(248,113,113,0.15)':s==='thinking'?'rgba(245,158,11,0.15)':'rgba(34,211,160,0.15)'), animation: 'jR2 2.5s ease-in-out infinite 0.75s' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'radial-gradient(circle, ' + (s==='listening'?'rgba(248,113,113,0.25)':s==='thinking'?'rgba(245,158,11,0.25)':'rgba(34,211,160,0.25)') + ' 0%, transparent 70%)', animation: 'jCore 1.5s ease-in-out infinite', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 36 }}>
                    {[0,1,2,3,4,5,6].map(i => (
                      <div key={i} style={{ width: 3, borderRadius: 99, background: s==='listening'?'#f87171':s==='thinking'?'#f59e0b':'#22d3a0', animation: 'jBar 0.9s ease-in-out ' + (i*0.1) + 's infinite' }} />
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ position: 'absolute', bottom: -44, left: '50%', transform: 'translateX(-50%)', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: s==='listening'?'#f87171':s==='thinking'?'#f59e0b':'#22d3a0', whiteSpace: 'nowrap' }}>
                {s==='listening'?'Ouvindo...':s==='thinking'?'Processando...':'LUNA falando...'}
              </div>
            </div>
            <style>{`
              @keyframes jR1 { 0%,100%{transform:scale(1);opacity:0.7} 50%{transform:scale(1.1);opacity:1} }
              @keyframes jR2 { 0%,100%{transform:scale(1.05);opacity:0.5} 50%{transform:scale(0.95);opacity:0.9} }
              @keyframes jCore { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
              @keyframes jBar { 0%,100%{height:6px;opacity:0.3} 50%{height:32px;opacity:1} }
            `}</style>
          </div>
        )}

        {/* Header */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, zIndex: 1, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: col, boxShadow: `0 0 8px ${col}` }} />
            <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, letterSpacing: 0.5 }}>LUNA - Assistente</span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text2)', background: 'var(--surface)', padding: '3px 10px', borderRadius: 99, border: '1px solid var(--border)' }}>
            {statusLabel}
          </span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, zIndex: 1 }}>
          {msgs.map(msg => (
            <div key={msg.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: msg.role === 'luna' ? `radial-gradient(circle at 38% 38%,${col},${col}88)` : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, border: '1px solid var(--border)', boxShadow: msg.role === 'luna' ? `0 0 12px ${col}44` : 'none' }}>
                {msg.role === 'luna' ? '' : (userProfile?.given_name?.[0] || 'U')}
              </div>
              <div style={{ maxWidth: '72%' }}>
                <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {msg.role === 'luna' ? 'LUNA' : (userProfile?.given_name || 'Voce')}  {msg.time}
                </div>
                <div style={{ background: msg.role === 'luna' ? 'var(--surface)' : `${col}22`, border: `1px solid ${msg.role === 'luna' ? 'var(--border)' : col + '44'}`, borderRadius: msg.role === 'luna' ? '4px 16px 16px 16px' : '16px 4px 16px 16px', padding: '10px 14px', fontSize: 14, lineHeight: 1.6, color: 'var(--text)' }}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {s === 'thinking' && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `radial-gradient(circle,${col},${col}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}></div>
              <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px 16px 16px 16px' }}>
                {[0, 120, 240].map((d, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: col, animation: `bounce 1s ${d}ms infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick buttons */}
        <div style={{ padding: '8px 16px 4px', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0, zIndex: 1 }}>
          {quickBtns.map(([label, val]) => (
            <button key={label} onClick={() => { setInput(val); inputRef.current?.focus() }} style={{ whiteSpace: 'nowrap', padding: '5px 12px', borderRadius: 99, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>
              {label}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div style={{ padding: '12px 16px 16px', display: 'flex', gap: 10, alignItems: 'center', borderTop: '1px solid var(--border)', flexShrink: 0, zIndex: 1 }}>
          {/* Mic button */}
          <button
            onClick={() => s === 'listening' ? stopMic() : startMic()}
            style={{ width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: s === 'listening' ? '#f87171' : s === 'speaking' ? col : 'var(--surface)', boxShadow: isActive ? `0 0 20px ${col}66` : 'none', transition: 'all 0.2s' }}
          >
            {s === 'listening' ? '' : ''}
          </button>

          {/* Text input */}
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Digite ou pressione Espaco para falar..."
            style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', color: 'var(--text)', fontSize: 14, outline: 'none', minWidth: 0 }}
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || s === 'thinking'}
            style={{ width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: input.trim() ? 'pointer' : 'default', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: input.trim() ? `linear-gradient(135deg,${col},${col}aa)` : 'var(--surface)', opacity: input.trim() ? 1 : 0.4, transition: 'all 0.2s' }}
          >
            
          </button>
        </div>

        <style>{`
          @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
          @media (max-width: 768px) {
            input { font-size: 16px !important; }
          }
        `}</style>
      </div>
    </AppShell>
  )
}
