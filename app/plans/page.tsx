'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { AppShell } from '@/components/AppShell'

type PlanId = 'free' | 'pro' | 'business'
type BillingCycle = 'monthly' | 'annual'

const PLANS = [
  {
    id: 'free' as PlanId,
    name: 'Gratuito',
    desc: 'Para experimentar Luna',
    monthly: 0,
    annual: 0,
    color: '#55556a',
    features: [
      { ok: true,  text: 'Chat com IA (20 mensagens/dia)' },
      { ok: true,  text: 'Google Calendar (somente leitura)' },
      { ok: true,  text: '3 habitos ativos' },
      { ok: true,  text: 'Controle financeiro basico' },
      { ok: false, text: 'WhatsApp integrado' },
      { ok: false, text: 'Automacoes' },
      { ok: false, text: 'Notas IA ilimitadas' },
    ],
    cta: 'Comecar gratis',
  },
  {
    id: 'pro' as PlanId,
    name: 'Pro',
    desc: 'Para quem quer o maximo',
    monthly: 29.9,
    annual: 239,
    color: '#7c6dfa',
    highlight: true,
    features: [
      { ok: true, text: 'Chat com IA ilimitado' },
      { ok: true, text: 'Google Calendar completo' },
      { ok: true, text: 'Habitos ilimitados + streaks' },
      { ok: true, text: 'Financas com relatorios' },
      { ok: true, text: 'WhatsApp integrado' },
      { ok: true, text: 'Automacoes Se -> Entao' },
      { ok: true, text: 'Notas com IA' },
      { ok: true, text: 'Suporte prioritario' },
    ],
    cta: 'Assinar Pro',
  },
  {
    id: 'business' as PlanId,
    name: 'Business',
    desc: 'Para times e empresas',
    monthly: 97,
    annual: 779,
    color: '#f59e0b',
    features: [
      { ok: true, text: 'Tudo do Pro' },
      { ok: true, text: 'Multi-usuarios' },
      { ok: true, text: 'Dashboard de equipe' },
      { ok: true, text: 'Integracao CRM' },
      { ok: true, text: 'Automacoes avancadas' },
      { ok: true, text: 'Suporte dedicado' },
      { ok: true, text: 'SLA garantido' },
    ],
    cta: 'Falar com vendas',
  },
]

export default function PlansPage() {
  const { currentPlan, userProfile } = useStore(s => ({
    currentPlan: s.currentPlan, userProfile: s.userProfile,
  }))
  const [billing, setBilling] = useState<BillingCycle>('monthly')
  const [loading, setLoading] = useState<PlanId | null>(null)
  const [checkout, setCheckout] = useState<PlanId | null>(null)

  async function handleSubscribe(planId: PlanId) {
    const plan = PLANS.find(p => p.id === planId)
    if (!plan || plan.monthly === 0) return
    setLoading(planId)
    try {
      const res = await fetch('/api/payments/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billing,
          email: userProfile?.email,
          name: userProfile?.name,
        }),
      })
      const data = await res.json()
      if (data.init_point) {
        window.open(data.init_point, '_blank')
      } else if (data.error) {
        // Sem chave MP configurada — modo demo
        setCheckout(planId)
      }
    } catch {
      setCheckout(planId)
    } finally {
      setLoading(null)
    }
  }

  const price = (plan: typeof PLANS[0]) => {
    if (plan.monthly === 0) return 'Gratis'
    if (billing === 'annual') return 'R$ ' + (plan.annual / 12).toFixed(2).replace('.', ',') + '/mes'
    return 'R$ ' + String(plan.monthly).replace('.', ',') + '/mes'
  }

  return (
    <AppShell>
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px 48px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(24px,4vw,36px)', marginBottom: 8 }}>
            Escolha seu plano
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 15, marginBottom: 24 }}>
            Sem cartao de credito para comecar. Cancele quando quiser.
          </p>
          {/* Toggle mensal/anual */}
          <div style={{ display: 'inline-flex', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, gap: 4 }}>
            {(['monthly', 'annual'] as const).map(b => (
              <button key={b} onClick={() => setBilling(b)} style={{
                padding: '8px 20px', borderRadius: 8, border: 'none',
                background: billing === b ? 'var(--accent)' : 'transparent',
                color: billing === b ? '#fff' : 'var(--text2)',
                fontWeight: 600, cursor: 'pointer', fontSize: 13, transition: 'all 0.2s',
              }}>
                {b === 'monthly' ? 'Mensal' : 'Anual'}{b === 'annual' ? ' (-30%)' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 1000, margin: '0 auto' }}>
          {PLANS.map(plan => {
            const isCurrent = currentPlan === plan.id
            return (
              <div key={plan.id} style={{
                background: plan.highlight ? 'linear-gradient(145deg,rgba(124,109,250,0.12),rgba(124,109,250,0.04))' : 'var(--bg2)',
                border: plan.highlight ? '2px solid rgba(124,109,250,0.4)' : '1px solid var(--border)',
                borderRadius: 16, padding: '28px 24px', position: 'relative',
              }}>
                {plan.highlight && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#7c6dfa,#a78bfa)', borderRadius: 99, padding: '3px 14px', fontSize: 11, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                    Mais popular
                  </div>
                )}
                {isCurrent && (
                  <div style={{ position: 'absolute', top: -12, right: 16, background: '#22d3a0', borderRadius: 99, padding: '3px 12px', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                    Plano atual
                  </div>
                )}
                <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>{plan.name}</h2>
                <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 20 }}>{plan.desc}</p>
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 36, letterSpacing: -1, marginBottom: 4 }}>
                  {plan.monthly === 0 ? 'Gratis' : price(plan)}
                </div>
                {billing === 'annual' && plan.annual > 0 && (
                  <div style={{ fontSize: 12, color: '#22d3a0', marginBottom: 20 }}>R$ {plan.annual}/ano — 2 meses gratis</div>
                )}
                <div style={{ marginBottom: 24, marginTop: billing === 'annual' && plan.annual > 0 ? 0 : 20 }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 14 }}>
                      <span style={{ color: f.ok ? '#22d3a0' : 'var(--text3)', flexShrink: 0, fontWeight: 700 }}>
                        {f.ok ? '✓' : '✗'}
                      </span>
                      <span style={{ color: f.ok ? 'var(--text)' : 'var(--text3)', textDecoration: f.ok ? 'none' : 'line-through' }}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => plan.monthly === 0 ? null : handleSubscribe(plan.id)}
                  disabled={isCurrent || plan.monthly === 0 || loading === plan.id}
                  style={{
                    width: '100%', padding: '13px 0', borderRadius: 10, border: 'none',
                    background: isCurrent ? 'rgba(34,211,160,0.15)' : plan.highlight ? 'linear-gradient(135deg,#7c6dfa,#a78bfa)' : 'var(--bg3)',
                    color: isCurrent ? '#22d3a0' : plan.monthly === 0 ? 'var(--text2)' : '#fff',
                    fontFamily: 'Syne', fontWeight: 700, fontSize: 15,
                    cursor: isCurrent || plan.monthly === 0 ? 'default' : 'pointer',
                    opacity: loading === plan.id ? 0.7 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {loading === plan.id ? 'Aguarde...' : isCurrent ? 'Plano atual' : plan.cta}
                </button>
              </div>
            )
          })}
        </div>

        {/* Modal de checkout - aparece quando MP nao esta configurado */}
        {checkout && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
          }} onClick={() => setCheckout(null)}>
            <div onClick={e => e.stopPropagation()} style={{
              background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 20, padding: '40px 32px',
              maxWidth: 420, width: '100%', textAlign: 'center',
            }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>💳</div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>
                {PLANS.find(p => p.id === checkout)?.name}
              </h2>
              <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                Para ativar pagamentos reais, configure sua chave do Mercado Pago no painel do Vercel:<br />
                <code style={{ background: 'var(--bg3)', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>MP_ACCESS_TOKEN</code>
              </p>
              <div style={{ background: 'rgba(0,158,227,0.1)', border: '1px solid rgba(0,158,227,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#009ee3' }}>
                Plano ativado em modo demo por enquanto.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setCheckout(null)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text2)', fontWeight: 600, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={() => {
                  setCheckout(null)
                }} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: '#009ee3', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Garantia */}
        <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--text3)', fontSize: 13 }}>
          🛡️ Garantia de 14 dias — nao gostou? Devolvemos 100%.
        </div>
      </div>
    </AppShell>
  )
}
