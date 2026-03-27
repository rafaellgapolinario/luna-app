'use client'
import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { AppShell } from '@/components/AppShell'

interface Habit {
  id: string; nome: string; emoji: string; frequencia: string
  streak_atual: number; streak_maximo: number; meta_dias: number; ativo: boolean
}

const EMOJIS = ['⭐','💪','🧘','📚','🏃','💧','🥗','😴','✍️','🎯','🧹','💊','🌿','🎵','🙏']
const HOJE = new Date().toISOString().split('T')[0]

function getMes() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}

export default function HabitsPage() {
  const { userDbId, showToast } = useStore(s => ({ userDbId: s.userDbId, showToast: s.showToast }))
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<Record<string, string[]>>({}) // habitId -> datas concluídas
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ nome: '', emoji: '⭐', meta_dias: 30, frequencia: 'diario' })
  const [saving, setSaving] = useState(false)
  const [checking, setChecking] = useState<string|null>(null)

  async function loadHabits() {
    if (!userDbId) return
    setLoading(true)
    const res = await fetch(`/api/habits?user_id=${userDbId}`)
    const data = await res.json()
    const hs: Habit[] = Array.isArray(data) ? data : []
    setHabits(hs)

    // Carregar logs do mês para cada hábito
    const mes = getMes()
    const allLogs: Record<string,string[]> = {}
    await Promise.all(hs.map(async h => {
      const r = await fetch(`/api/habits/log?habit_id=${h.id}&mes=${mes}`)
      const d = await r.json()
      allLogs[h.id] = Array.isArray(d) ? d : []
    }))
    setLogs(allLogs)
    setLoading(false)
  }

  useEffect(() => { loadHabits() }, [userDbId])

  async function checkIn(habit: Habit) {
    if (checking) return
    const jaFeito = logs[habit.id]?.includes(HOJE)
    if (jaFeito) { showToast('Já concluído hoje! 🎉'); return }
    setChecking(habit.id)
    const res = await fetch('/api/habits/log', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habit_id: habit.id, user_id: userDbId, data: HOJE })
    })
    const { streak } = await res.json()
    setLogs(prev => ({ ...prev, [habit.id]: [...(prev[habit.id]||[]), HOJE] }))
    setHabits(prev => prev.map(h => h.id===habit.id ? { ...h, streak_atual: streak } : h))
    showToast(`🔥 Streak: ${streak} dia${streak>1?'s':''}!`)
    setChecking(null)
  }

  async function addHabit() {
    if (!form.nome || !userDbId) { showToast('Digite o nome do hábito'); return }
    setSaving(true)
    const res = await fetch('/api/habits', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userDbId, ...form })
    })
    if (res.ok) {
      showToast('✅ Hábito criado!')
      setShowAdd(false)
      setForm({ nome: '', emoji: '⭐', meta_dias: 30, frequencia: 'diario' })
      loadHabits()
    } else showToast('Erro ao criar')
    setSaving(false)
  }

  async function deleteHabit(id: string) {
    await fetch(`/api/habits?id=${id}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ ativo: false }) })
    setHabits(hs => hs.filter(h => h.id !== id))
    showToast('Hábito removido')
  }

  // Gerar calendário do mês (últimos 7 dias)
  function getLast7Days() {
    return Array.from({length:7}, (_,i) => {
      const d = new Date(); d.setDate(d.getDate()-6+i)
      return d.toISOString().split('T')[0]
    })
  }
  const last7 = getLast7Days()
  const diasSemana = ['D','S','T','Q','Q','S','S']

  const totalStreak = habits.reduce((s,h) => s + h.streak_atual, 0)
  const completedHoje = habits.filter(h => logs[h.id]?.includes(HOJE)).length

  return (
    <AppShell>
      <div style={{ flex:1, overflowY:'auto', padding:'24px 28px 40px' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
          <div>
            <div style={{ fontFamily:'Syne', fontSize:22, fontWeight:800 }}>🎯 Hábitos</div>
            <div style={{ fontSize:13, color:'var(--text2)', marginTop:4 }}>{completedHoje}/{habits.length} concluídos hoje</div>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} style={{ padding:'8px 16px', background:'var(--accent)', border:'none', borderRadius:99, fontSize:12, color:'#fff', cursor:'pointer', fontWeight:700 }}>
            + Novo hábito
          </button>
        </div>

        {/* Stats rápidos */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
          {[
            { label:'Hábitos ativos', value: habits.length, icon:'📋' },
            { label:'Concluídos hoje', value: completedHoje, icon:'✅' },
            { label:'Total de streaks', value: totalStreak, icon:'🔥' },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'16px 20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:11, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.8 }}>{label}</span>
                <span style={{ fontSize:18 }}>{icon}</span>
              </div>
              <div style={{ fontFamily:'Syne', fontSize:28, fontWeight:800 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Formulário add */}
        {showAdd && (
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--radius)', padding:20, marginBottom:20 }}>
            <div style={{ fontFamily:'Syne', fontSize:15, fontWeight:700, marginBottom:14 }}>Novo hábito</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:8, marginBottom:12 }}>
              <input value={form.nome} onChange={e => setForm(f=>({...f,nome:e.target.value}))} placeholder="Nome do hábito..." className="input-field" />
              <select value={form.emoji} onChange={e => setForm(f=>({...f,emoji:e.target.value}))} className="input-field" style={{ width:70, fontSize:20, textAlign:'center' }}>
                {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
              <select value={form.frequencia} onChange={e => setForm(f=>({...f,frequencia:e.target.value}))} className="input-field">
                <option value="diario">Diário</option>
                <option value="semanal">Semanal</option>
              </select>
              <input value={form.meta_dias} onChange={e => setForm(f=>({...f,meta_dias:parseInt(e.target.value)||30}))} type="number" placeholder="Meta (dias)" className="input-field" />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={addHabit} disabled={saving} className="btn-primary" style={{ flex:1 }}>{saving?'Criando...':'Criar hábito'}</button>
              <button onClick={() => setShowAdd(false)} style={{ flex:1, background:'transparent', border:'1px solid var(--border)', borderRadius:8, padding:10, cursor:'pointer', color:'var(--text2)', fontSize:13 }}>Cancelar</button>
            </div>
          </div>
        )}

        {/* Lista de hábitos */}
        {loading && <div style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>Carregando...</div>}

        {!loading && habits.length === 0 && (
          <div style={{ textAlign:'center', padding:60, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🎯</div>
            <div style={{ fontSize:16, fontWeight:600, marginBottom:6 }}>Nenhum hábito ainda</div>
            <div style={{ fontSize:13, color:'var(--text2)' }}>Clique em "+ Novo hábito" para começar</div>
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {habits.map(habit => {
            const feito = logs[habit.id]?.includes(HOJE)
            const pct = Math.min(100, Math.round((habit.streak_atual/habit.meta_dias)*100))
            return (
              <div key={habit.id} style={{ background:'var(--bg2)', border:`1px solid ${feito?'rgba(34,211,160,0.3)':'var(--border)'}`, borderRadius:'var(--radius)', padding:'16px 20px', transition:'border 0.2s' }}>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  {/* Emoji + check */}
                  <button onClick={() => checkIn(habit)} disabled={!!checking} style={{
                    width:52, height:52, borderRadius:14, flexShrink:0, cursor: feito?'default':'pointer',
                    background: feito ? 'rgba(34,211,160,0.15)' : 'var(--bg3)',
                    border: `2px solid ${feito ? 'var(--green)' : 'var(--border2)'}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:24, transition:'all 0.2s',
                    opacity: checking===habit.id ? 0.6 : 1,
                  }}>
                    {feito ? '✅' : habit.emoji}
                  </button>

                  {/* Info */}
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:15, fontWeight:600 }}>{habit.nome}</span>
                      {feito && <span style={{ fontSize:10, background:'rgba(34,211,160,0.15)', color:'var(--green)', border:'1px solid rgba(34,211,160,0.25)', borderRadius:99, padding:'2px 8px', fontWeight:700 }}>✓ Feito hoje</span>}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <span style={{ fontSize:12, color:'var(--text3)' }}>🔥 {habit.streak_atual} dias</span>
                      <span style={{ fontSize:12, color:'var(--text3)' }}>🏆 Recorde: {habit.streak_maximo}</span>
                      <span style={{ fontSize:12, color:'var(--text3)' }}>Meta: {habit.meta_dias}d</span>
                    </div>
                    {/* Barra de progresso */}
                    <div style={{ marginTop:8 }}>
                      <div style={{ height:4, background:'var(--bg3)', borderRadius:99, overflow:'hidden' }}>
                        <div style={{ height:'100%', background:feito?'var(--green)':'var(--accent)', borderRadius:99, width:`${pct}%`, transition:'width 0.5s' }} />
                      </div>
                    </div>
                  </div>

                  {/* Calendário 7 dias */}
                  <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                    {last7.map((dia, i) => {
                      const concluido = logs[habit.id]?.includes(dia)
                      const ehHoje = dia === HOJE
                      return (
                        <div key={dia} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                          <div style={{ fontSize:9, color:'var(--text3)' }}>{diasSemana[new Date(dia+'T12:00').getDay()]}</div>
                          <div style={{
                            width:22, height:22, borderRadius:6,
                            background: concluido ? 'var(--green)' : ehHoje ? 'var(--bg3)' : 'var(--bg3)',
                            border: ehHoje ? '1px solid var(--border2)' : '1px solid transparent',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:10,
                          }}>
                            {concluido ? '✓' : ''}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Delete */}
                  <button onClick={() => deleteHabit(habit.id)} style={{ background:'transparent', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:14, padding:'4px 6px', borderRadius:6, flexShrink:0 }}>✕</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
