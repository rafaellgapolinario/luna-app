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
  const { lang, userProfile, geminiKey, calendarEvents, accessToken, showToast, addMessage, chatHistory } = useStore(s => ({
    lang: s.lang, userProfile: s.userProfile, geminiKey: s.geminiKey,
    calendarEvents: s.calendarEvents, accessToken: s.accessToken,
    showToast: s.showToast, addMessage: s.addMessage, chatHistory: s.chatHistory,
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

  const speak = useCallback((text: string) => {
    window.speechSynthesis?.cancel()
    const clean = cleanTTS(text)
    const utt = new SpeechSynthesisUtterance(clean)
    utt.lang = lang === 'en' ? 'en-US' : 'pt-BR'
    utt.rate = 1.05
    utt.onend = () => { if (sRef.current === 'speaking') setS('idle') }
    synthRef.current = utt
    setS('speaking')
    window.speechSynthesis.speak(utt)
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
          message: text, lang, userProfile, geminiKey,
          calendarSummary: cal, accessToken,
          history,
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
      if (tag) showToast(tag, 'success')
    } catch (e) {
      addMsg('luna', 'Erro de conexao.')
      setS('idle')
    }
  }, [lang, userProfile, geminiKey, calendarEvents, accessToken, chatHistory, addMsg, speak, showToast])

  const startMic = useCallback(async () => {
    if (sRef.current !== 'idle') return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const rec = new MediaRecorder(stream)
      rec.ondataavailable = e => chunksRef.current.push(e.data)
      rec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        if (blob.size < 1000) { setS('idle'); return }
        setS('thinking')
        const fd = new FormData()
        fd.append('audio', blob, 'audio.webm')
        fd.append('lang', lang)
        try {
          const res = await fetch('/api/stt', { method: 'POST', body: fd })
          const d = await res.json()
          if (d.text) await sendToLuna(d.text)
          else setS('idle')
        } catch { setS('idle') }
      }
      recRef.current = rec
      rec.start()
      setS('listening')
    } catch {
      addMsg('luna', 'Permita o microfone: clique no cadeado na barra de endereco.')
    }
  }, [lang, sendToLuna, addMsg])

  const stopMic = useCallback(() => {
    if (recRef.current && recRef.current.state === 'recording') {
      recRef.current.stop()
    }
  }, [])

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
                {msg.role === 'luna' ? '🌙' : (userProfile?.given_name?.[0] || 'U')}
              </div>
              <div style={{ maxWidth: '72%' }}>
                <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {msg.role === 'luna' ? 'LUNA' : (userProfile?.given_name || 'Voce')} · {msg.time}
                </div>
                <div style={{ background: msg.role === 'luna' ? 'var(--surface)' : `${col}22`, border: `1px solid ${msg.role === 'luna' ? 'var(--border)' : col + '44'}`, borderRadius: msg.role === 'luna' ? '4px 16px 16px 16px' : '16px 4px 16px 16px', padding: '10px 14px', fontSize: 14, lineHeight: 1.6, color: 'var(--text)' }}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {s === 'thinking' && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `radial-gradient(circle,${col},${col}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🌙</div>
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
            {s === 'listening' ? '⏹' : '🎙️'}
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
            ➤
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
