'use client'
import { useState, useEffect, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { AppShell } from '@/components/AppShell'

interface Transaction {
  id: string; tipo: 'gasto' | 'receita'; valor: number
  descricao: string; categoria: string; data: string
}

const CATS = ['alimentação','transporte','saúde','lazer','moradia','educação','roupa','outro']
const CAT_EMOJI: Record<string,string> = { alimentação:'🍔',transporte:'🚗',saúde:'💊',lazer:'🎬',moradia:'🏠',educação:'📚',roupa:'👕',outro:'📦',receita:'💰' }
const CAT_COLOR: Record<string,string> = { alimentação:'#f97316',transporte:'#3b82f6',saúde:'#22d3a0',lazer:'#a78bfa',moradia:'#f59e0b',educação:'#06b6d4',roupa:'#ec4899',outro:'#6b7280',receita:'#22d3a0' }

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function getMesAtual() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}

export default function FinancePage() {
  const { userDbId, showToast } = useStore(s => ({ userDbId: s.userDbId, showToast: s.showToast }))
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [mes, setMes] = useState(getMesAtual)
  const [showAdd, setShowAdd] = useState(false)
  const [filterTipo, setFilterTipo] = useState<'todos'|'gasto'|'receita'>('todos')
  const [form, setForm] = useState({ tipo: 'gasto', valor: '', descricao: '', categoria: 'alimentação', data: new Date().toISOString().split('T')[0] })
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!userDbId) return
    setLoading(true)
    const res = await fetch(`/api/finances?user_id=${userDbId}&mes=${mes}`)
    const data = await res.json()
    setTransactions(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [userDbId, mes])

  const totalReceitas = useMemo(() => transactions.filter(t => t.tipo === 'receita').reduce((s,t) => s + Number(t.valor), 0), [transactions])
  const totalGastos = useMemo(() => transactions.filter(t => t.tipo === 'gasto').reduce((s,t) => s + Number(t.valor), 0), [transactions])
  const saldo = totalReceitas - totalGastos

  const porCategoria = useMemo(() => {
    const map: Record<string,number> = {}
    transactions.filter(t => t.tipo === 'gasto').forEach(t => { map[t.categoria] = (map[t.categoria]||0) + Number(t.valor) })
    return Object.entries(map).sort((a,b) => b[1]-a[1])
  }, [transactions])

  // Dados para gráfico de barras mensais (últimos 6 meses)
  const chartData = useMemo(() => {
    const hoje = new Date()
    return Array.from({length:6}, (_,i) => {
      const d = new Date(hoje.getFullYear(), hoje.getMonth()-5+i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      return { mes: MESES[d.getMonth()], key }
    })
  }, [])

  const filtradas = filterTipo === 'todos' ? transactions : transactions.filter(t => t.tipo === filterTipo)

  async function addTransaction() {
    if (!form.descricao || !form.valor || !userDbId) { showToast('Preencha todos os campos'); return }
    setSaving(true)
    const body = { user_id: userDbId, tipo: form.tipo, valor: parseFloat(form.valor), descricao: form.descricao, categoria: form.tipo === 'receita' ? 'receita' : form.categoria, data: form.data }
    const res = await fetch('/api/finances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      showToast(`${form.tipo === 'receita' ? '💰' : '💸'} Registrado!`)
      setShowAdd(false)
      setForm({ tipo: 'gasto', valor: '', descricao: '', categoria: 'alimentação', data: new Date().toISOString().split('T')[0] })
      load()
    } else showToast('Erro ao salvar')
    setSaving(false)
  }

  async function deleteTransaction(id: string) {
    await fetch(`/api/finances?id=${id}`, { method: 'DELETE' })
    setTransactions(ts => ts.filter(t => t.id !== id))
    showToast('Removido')
  }

  const orcamento = 3000
  const pctOrcamento = Math.min(100, Math.round((totalGastos/orcamento)*100))

  return (
    <AppShell>
      <div style={{ flex:1, overflowY:'auto', padding:'24px 28px 40px' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
          <div>
            <div style={{ fontFamily:'Syne', fontSize:22, fontWeight:800 }}>💸 Finanças</div>
            <div style={{ fontSize:13, color:'var(--text2)', marginTop:4 }}>
              {MESES[parseInt(mes.split('-')[1])-1]} {mes.split('-')[0]} · {transactions.length} transações
            </div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {/* Seletor de mês */}
            <select value={mes} onChange={e => setMes(e.target.value)} className="input-field" style={{ fontSize:12, padding:'6px 10px', height:36 }}>
              {Array.from({length:12},(_,i) => {
                const d = new Date(); d.setMonth(d.getMonth()-11+i)
                const v = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
                return <option key={v} value={v}>{MESES[d.getMonth()]} {d.getFullYear()}</option>
              })}
            </select>
            <button onClick={() => setShowAdd(!showAdd)} style={{ padding:'8px 16px', background:'var(--accent)', border:'none', borderRadius:99, fontSize:12, color:'#fff', cursor:'pointer', fontWeight:700 }}>
              + Nova
            </button>
          </div>
        </div>

        {/* Cards de resumo */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
          {[
            { label:'Receitas', value:totalReceitas, color:'var(--green)', prefix:'+', icon:'📈' },
            { label:'Gastos', value:totalGastos, color:'var(--red)', prefix:'-', icon:'📉' },
            { label:'Saldo', value:Math.abs(saldo), color:saldo>=0?'var(--green)':'var(--red)', prefix:saldo>=0?'+':'-', icon:'💳' },
          ].map(({ label, value, color, prefix, icon }) => (
            <div key={label} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'18px 20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <span style={{ fontSize:11, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.8 }}>{label}</span>
                <span style={{ fontSize:18 }}>{icon}</span>
              </div>
              <div style={{ fontFamily:'Syne', fontSize:24, fontWeight:800, color }}>{prefix}R$ {value.toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Barra de orçamento */}
        <div style={{ background:'var(--bg2)', border:`1px solid ${pctOrcamento>90?'rgba(248,113,113,0.3)':'var(--border)'}`, borderRadius:'var(--radius)', padding:'14px 20px', marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontSize:13, fontWeight:600 }}>🎯 Orçamento mensal</span>
            <span style={{ fontSize:12, color:pctOrcamento>90?'var(--red)':'var(--text2)', fontWeight:600 }}>
              R$ {totalGastos.toFixed(0)} / R$ {orcamento.toLocaleString('pt-BR')} ({pctOrcamento}%)
            </span>
          </div>
          <div style={{ height:8, background:'var(--bg3)', borderRadius:99, overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:99, background:pctOrcamento>90?'var(--red)':pctOrcamento>70?'var(--amber)':'var(--green)', width:`${pctOrcamento}%`, transition:'width 0.5s ease' }} />
          </div>
          {pctOrcamento>90 && <div style={{ fontSize:11, color:'var(--red)', marginTop:6 }}>⚠️ Atenção! Você atingiu {pctOrcamento}% do orçamento</div>}
        </div>

        {/* Grid principal */}
        <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:20 }}>

          {/* Coluna esquerda - categorias */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.2, color:'var(--text3)', textTransform:'uppercase', marginBottom:10 }}>Gastos por categoria</div>
              <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'12px 14px' }}>
                {porCategoria.length === 0 && <div style={{ fontSize:13, color:'var(--text3)', textAlign:'center', padding:'20px 0' }}>Nenhum gasto ainda</div>}
                {porCategoria.map(([cat, val]) => (
                  <div key={cat} style={{ marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:13 }}>{CAT_EMOJI[cat]||'📦'} {cat}</span>
                      <span style={{ fontSize:12, fontWeight:600, color:'var(--text2)' }}>R$ {val.toFixed(2)}</span>
                    </div>
                    <div style={{ height:5, background:'var(--bg3)', borderRadius:99, overflow:'hidden' }}>
                      <div style={{ height:'100%', background:CAT_COLOR[cat]||'#6b7280', borderRadius:99, width:`${Math.min(100,(val/totalGastos)*100)}%`, transition:'width 0.5s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo rápido */}
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'14px' }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.2, color:'var(--text3)', textTransform:'uppercase', marginBottom:12 }}>Resumo</div>
              {[
                { label:'Maior gasto', value: transactions.filter(t=>t.tipo==='gasto').sort((a,b)=>Number(b.valor)-Number(a.valor))[0] },
                { label:'Maior receita', value: transactions.filter(t=>t.tipo==='receita').sort((a,b)=>Number(b.valor)-Number(a.valor))[0] },
              ].map(({ label, value: t }) => (
                <div key={label} style={{ marginBottom:10 }}>
                  <div style={{ fontSize:11, color:'var(--text3)', marginBottom:2 }}>{label}</div>
                  {t ? (
                    <div style={{ fontSize:13, fontWeight:600 }}>{t.descricao} — <span style={{ color: t.tipo==='receita'?'var(--green)':'var(--red)' }}>R$ {Number(t.valor).toFixed(2)}</span></div>
                  ) : <div style={{ fontSize:12, color:'var(--text3)' }}>—</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Coluna direita - transações */}
          <div>
            {/* Formulário add */}
            {showAdd && (
              <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--radius)', padding:16, marginBottom:14 }}>
                <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                  {(['gasto','receita'] as const).map(tipo => (
                    <button key={tipo} onClick={() => setForm(f => ({...f, tipo}))} style={{ flex:1, padding:'8px 0', borderRadius:8, border:`1px solid ${form.tipo===tipo?(tipo==='gasto'?'var(--red)':'var(--green)'):'var(--border)'}`, background:form.tipo===tipo?(tipo==='gasto'?'rgba(248,113,113,0.1)':'rgba(34,211,160,0.1)'):'transparent', color:form.tipo===tipo?(tipo==='gasto'?'var(--red)':'var(--green)'):'var(--text3)', cursor:'pointer', fontSize:13, fontWeight:600 }}>
                      {tipo==='gasto'?'💸 Gasto':'💰 Receita'}
                    </button>
                  ))}
                </div>
                <input value={form.descricao} onChange={e => setForm(f=>({...f,descricao:e.target.value}))} placeholder="Descrição..." className="input-field" style={{ width:'100%', marginBottom:8 }} />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:10 }}>
                  <input value={form.valor} onChange={e => setForm(f=>({...f,valor:e.target.value}))} placeholder="Valor R$" type="number" className="input-field" />
                  {form.tipo==='gasto' && (
                    <select value={form.categoria} onChange={e => setForm(f=>({...f,categoria:e.target.value}))} className="input-field">
                      {CATS.map(c => <option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>)}
                    </select>
                  )}
                  <input value={form.data} onChange={e => setForm(f=>({...f,data:e.target.value}))} type="date" className="input-field" />
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={addTransaction} disabled={saving} className="btn-primary" style={{ flex:1 }}>{saving?'Salvando...':'Salvar'}</button>
                  <button onClick={() => setShowAdd(false)} style={{ flex:1, background:'transparent', border:'1px solid var(--border)', borderRadius:8, padding:10, cursor:'pointer', color:'var(--text2)', fontSize:13 }}>Cancelar</button>
                </div>
              </div>
            )}

            {/* Filtros */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.2, color:'var(--text3)', textTransform:'uppercase' }}>Transações</div>
              <div style={{ display:'flex', gap:6 }}>
                {(['todos','gasto','receita'] as const).map(f => (
                  <button key={f} onClick={() => setFilterTipo(f)} style={{ padding:'4px 12px', borderRadius:99, border:`1px solid ${filterTipo===f?'var(--accent)':'var(--border)'}`, background:filterTipo===f?'rgba(124,109,250,0.1)':'transparent', color:filterTipo===f?'var(--accent2)':'var(--text3)', cursor:'pointer', fontSize:11, fontWeight:filterTipo===f?600:400 }}>{f}</button>
                ))}
              </div>
            </div>

            {/* Lista */}
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)' }}>
              {loading && <div style={{ padding:24, textAlign:'center', color:'var(--text3)', fontSize:13 }}>Carregando...</div>}
              {!loading && filtradas.length === 0 && (
                <div style={{ padding:32, textAlign:'center' }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>💳</div>
                  <div style={{ fontSize:14, color:'var(--text2)', fontWeight:500 }}>Nenhuma transação</div>
                  <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>Clique em "+ Nova" para adicionar</div>
                </div>
              )}
              {filtradas.map((t, i) => (
                <div key={t.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:i<filtradas.length-1?'1px solid var(--border)':'none' }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:`${CAT_COLOR[t.categoria]||'#6b7280'}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                    {CAT_EMOJI[t.categoria]||'📦'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.descricao}</div>
                    <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{t.categoria} · {new Date(t.data+'T12:00:00').toLocaleDateString('pt-BR')}</div>
                  </div>
                  <div style={{ fontFamily:'Syne', fontSize:15, fontWeight:700, color:t.tipo==='receita'?'var(--green)':'var(--red)', flexShrink:0 }}>
                    {t.tipo==='receita'?'+':'-'}R$ {Number(t.valor).toFixed(2)}
                  </div>
                  <button onClick={() => deleteTransaction(t.id)} style={{ background:'transparent', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:14, padding:'4px 6px', borderRadius:6, flexShrink:0 }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
