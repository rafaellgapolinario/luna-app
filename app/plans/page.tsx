'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { AppShell } from '@/components/AppShell'

const PLANS = [
  { id:'free', name:'Gratuito', desc:'Para experimentar Luna', monthly:0, annual:0, highlight:false, cta:'Gratuito',
    features:['Chat com IA (20 mensagens/dia)','Google Calendar (somente leitura)','3 habitos ativos','Controle financeiro basico'],
    locked:['WhatsApp integrado','Automacoes','Notas IA ilimitadas'] },
  { id:'pro', name:'Pro', desc:'Para quem quer o maximo', monthly:29.9, annual:239, highlight:true, cta:'Assinar Pro',
    features:['Chat com IA ilimitado','Google Calendar completo','Habitos ilimitados + streaks','Financas com relatorios','WhatsApp integrado','Automacoes Se -> Entao','Notas com IA','Suporte prioritario'],
    locked:[] },
  { id:'business', name:'Business', desc:'Para times e empresas', monthly:97, annual:779, highlight:false, cta:'Assinar Business',
    features:['Tudo do Pro','Multi-usuarios','Dashboard de equipe','Automacoes avancadas','Suporte dedicado','SLA garantido'],
    locked:[] },
] as const

export default function PlansPage() {
  const { userProfile, currentPlan, showToast } = useStore(s => ({ userProfile: s.userProfile, currentPlan: s.currentPlan, showToast: s.showToast }))
  const [annual, setAnnual] = useState(false)
  const [loading, setLoading] = useState<string|null>(null)

  async function handleCheckout(plan: (typeof PLANS)[number]) {
    if (plan.id === 'free' || plan.id === currentPlan) { if (plan.id === currentPlan) showToast('Voce ja esta neste plano!'); return }
    setLoading(plan.id)
    try {
      const checkoutPrice = annual && plan.annual ? plan.annual : plan.monthly
      const res = await fetch('/api/checkout/mp', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ planId: plan.id, planName: plan.name, price: checkoutPrice, userEmail: userProfile?.email || '' }) })
      const data = await res.json()
      if (data.demo || data.error) { showToast('Configure MP_ACCESS_TOKEN no Vercel para ativar pagamentos'); setLoading(null); return }
      const url = data.init_point || data.sandbox_init_point
      if (url) window.open(url, '_blank'); else showToast('Erro ao iniciar pagamento')
    } catch { showToast('Erro de conexao') }
    setLoading(null)
  }

  return (
    <AppShell>
      <div style={{ flex:1, overflowY:'auto', padding:'32px 24px 48px' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <h1 style={{ fontFamily:'Syne', fontWeight:800, fontSize:32, marginBottom:8 }}>Escolha seu plano</h1>
          <p style={{ color:'var(--text3)', fontSize:15, marginBottom:28 }}>Cancele quando quiser. Sem fidelidade.</p>
          <div style={{ display:'inline-flex', alignItems:'center', gap:12, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:99, padding:'6px 16px' }}>
            <span style={{ fontSize:13, fontWeight:600, color:!annual?'var(--text)':'var(--text3)' }}>Mensal</span>
            <button onClick={() => setAnnual(!annual)} style={{ width:44, height:24, borderRadius:12, border:'none', cursor:'pointer', background:annual?'var(--accent)':'rgba(255,255,255,0.15)', position:'relative', transition:'background 0.2s' }}>
              <div style={{ width:18, height:18, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left:annual?23:3, transition:'left 0.2s' }} />
            </button>
            <span style={{ fontSize:13, fontWeight:600, color:annual?'var(--text)':'var(--text3)' }}>Anual <span style={{ background:'rgba(34,211,160,0.15)', color:'#22d3a0', borderRadius:6, padding:'2px 6px', fontSize:11, fontWeight:700 }}>-30%</span></span>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20, maxWidth:1000, margin:'0 auto' }}>
          {PLANS.map(plan => {
            const isCurrent = plan.id === currentPlan
            const dp = annual && plan.annual ? (plan.annual/12).toFixed(2).replace('.',',') : plan.monthly>0 ? plan.monthly.toFixed(2).replace('.',',') : null
            return (
              <div key={plan.id} style={{ background:plan.highlight?'linear-gradient(145deg,rgba(124,109,250,0.15),rgba(124,109,250,0.05))':'var(--bg2)', border:plan.highlight?'1px solid rgba(124,109,250,0.4)':'1px solid var(--border)', borderRadius:20, padding:'32px 28px', position:'relative' }}>
                {plan.highlight && <div style={{ position:'absolute', top:-14, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg,#7c6dfa,#a78bfa)', borderRadius:99, padding:'4px 16px', fontSize:12, fontWeight:700, whiteSpace:'nowrap', color:'#fff' }}>Mais popular</div>}
                {isCurrent && <div style={{ position:'absolute', top:16, right:16, background:'rgba(34,211,160,0.15)', color:'#22d3a0', borderRadius:99, padding:'3px 10px', fontSize:11, fontWeight:700 }}>Plano atual</div>}
                <h3 style={{ fontFamily:'Syne', fontWeight:800, fontSize:22, marginBottom:4 }}>{plan.name}</h3>
                <p style={{ color:'var(--text3)', fontSize:13, marginBottom:20 }}>{plan.desc}</p>
                <div style={{ marginBottom:24 }}>
                  {dp===null ? <div style={{ fontFamily:'Syne', fontWeight:800, fontSize:42, letterSpacing:-2 }}>Gratis</div> : <div><div style={{ fontFamily:'Syne', fontWeight:800, fontSize:38, letterSpacing:-2 }}>R${dp}<span style={{ fontSize:14, fontWeight:400, color:'var(--text3)' }}>/mes</span></div>{annual&&plan.annual>0&&<div style={{ fontSize:12, color:'#22d3a0', marginTop:4 }}>R${plan.annual}/ano</div>}</div>}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
                  {plan.features.map(f => <div key={f} style={{ display:'flex', gap:10, fontSize:14 }}><span style={{ color:'#22d3a0', flexShrink:0, fontWeight:700 }}>v</span><span style={{ color:'var(--text2)' }}>{f}</span></div>)}
                  {plan.locked.map(f => <div key={f} style={{ display:'flex', gap:10, fontSize:14 }}><span style={{ color:'var(--text3)', flexShrink:0 }}>x</span><span style={{ color:'var(--text3)', textDecoration:'line-through' }}>{f}</span></div>)}
                </div>
                <button onClick={() => handleCheckout(plan)} disabled={loading===plan.id||isCurrent||plan.id==='free'} style={{ width:'100%', padding:'14px', borderRadius:12, border:plan.highlight?'none':'1px solid var(--border)', background:isCurrent?'rgba(34,211,160,0.1)':plan.id==='free'?'rgba(255,255,255,0.04)':plan.highlight?'linear-gradient(135deg,#7c6dfa,#a78bfa)':'rgba(255,255,255,0.06)', color:isCurrent?'#22d3a0':'#fff', fontWeight:700, fontSize:15, cursor:isCurrent||plan.id==='free'?'default':'pointer', opacity:loading===plan.id?0.7:1 }}>
                  {loading===plan.id?'Aguarde...':isCurrent?'Plano atual':plan.id==='free'?'Gratuito':plan.cta+' via Mercado Pago'}
                </button>
              </div>
            )
          })}
        </div>
        <div style={{ textAlign:'center', padding:'20px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:16, maxWidth:600, margin:'40px auto 0' }}>
          <div style={{ fontSize:13, color:'var(--text3)', lineHeight:1.7 }}>Pagamento 100% seguro via <strong style={{ color:'#009ee3' }}>Mercado Pago</strong>. Cartao de credito, debito, PIX e boleto. Garantia de 14 dias.</div>
        </div>
      </div>
    </AppShell>
  )
}