'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [billingAnnual, setBillingAnnual] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const features = [
    { icon: '😙️', label: 'Assistente por voz e texto', desc: 'Fale ou escreva para Luna. Ela entende linguagem natural e executa tudo automaticamente.' },
    { icon: '📅', label: 'Google Calendar integrado', desc: 'Sincronizacao em tempo real. Veja eventos, crie compromissos e receba resumos do seu dia.' },
    { icon: '⚡', label: 'Habitos e metas', desc: 'Acompanhe streaks, configure lembretes e veja seu progresso com insights personalizados.' },
    { icon: '💸', label: 'Controle financeiro', desc: 'Registre receitas e gastos por categoria. Visualize saldo e identifique padroes.' },
    { icon: '💬', label: 'WhatsApp integrado', desc: 'Converse com Luna pelo WhatsApp. Sem abrir o app, ela esta onde voce ja esta.' },
    { icon: '🔁', label: 'Automacoes Se-Entao', desc: 'Configure regras que funcionam sozinhas. "Se chegar segunda, me manda o resumo da semana."' },
  ]

  const plans = [
    {
      name: 'Free',
      monthly: 0,
      annualTotal: 0,
      desc: 'Para comecar a usar Luna',
      features: ['Chat IA (50 msgs/dia)', 'Google Calendar integrado', 'Dashboard de produtividade', '3 habitos simultaneos'],
      off: ['Voz neural', 'Chat IA ilimitado', 'Controle financeiro', 'WhatsApp automatico', 'Automacoes'],
      cta: 'Comecar gratis',
      accent: false,
      highlight: '',
    },
    {
      name: 'Pro',
      monthly: 29.9,
      annualTotal: 239,
      desc: 'Para quem quer o maximo',
      badge: 'Mais popular',
      features: ['Chat IA ilimitado', 'Google Calendar completo', 'Habitos ilimitados + streaks', 'Controle financeiro completo', 'Voz neural (Azure TTS)', 'WhatsApp automatico', '10 automacoes', 'Suporte prioritario'],
      off: [],
      cta: 'Assinar Pro',
      accent: true,
      highlight: '',
    },
    {
      name: 'Business',
      monthly: 97,
      annualTotal: 779,
      desc: 'Para times e empresas',
      features: ['Tudo do Pro', 'Multi-usuario (ate 10 pessoas)', 'Automacoes ilimitadas', 'API access (REST)', 'Relatorios avancados', 'Suporte prioritario 24h'],
      off: [],
      cta: 'Assinar Business',
      accent: false,
      highlight: '#f59e0b',
    },
  ]

  const faqs = [
    { q: 'Funciona no celular?', a: 'Sim. Luna e um PWA — voce instala direto do navegador no celular. Tambem tem integracao nativa com WhatsApp.' },
    { q: 'Preciso conectar o Google Calendar?', a: 'Nao e obrigatorio, mas recomendado. Sem ele, Luna ainda funciona para IA, habitos e financas.' },
    { q: 'Como funciona o WhatsApp?', a: 'Voce conecta seu numero ao Luna uma vez so. Depois passa a conversar com Luna pelo proprio WhatsApp normalmente.' },
    { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Sem multa, sem fidelidade. Cancele quando quiser pelo painel de configuracoes.' },
    { q: 'Meus dados sao seguros?', a: 'Sim. Todos os dados sao criptografados. Nunca vendemos ou compartilhamos suas informacoes.' },
  ]

  function getPrice(monthly: number, annualTotal: number) {
    if (monthly === 0) return 'Gratis'
    if (billingAnnual) return 'R$' + Math.round(annualTotal / 12)
    return 'R$' + monthly.toFixed(0)
  }

  function getSavings(monthly: number, annualTotal: number) {
    if (!billingAnnual || monthly === 0) return null
    const saving = Math.round((1 - (annualTotal / 12) / monthly) * 100)
    return 'R$' + annualTotal + '/ano — economize ' + saving + '%'
  }

  return (
    <div style={{ background: '#0a0a0f', color: '#f0f0f8', fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .hero-btns { flex-direction: column !important; align-items: stretch !important; width: 100% !important; }
          .hero-btns a { text-align: center !important; justify-content: center !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .plans-grid { grid-template-columns: 1fr !important; }
          .nav-inner { padding: 0 16px !important; }
          .hero-section { padding: 90px 16px 60px !important; }
          .section-pad { padding: 60px 16px !important; }
          .faq-section { padding: 60px 16px !important; }
          .cta-section { padding: 60px 16px 80px !important; }
          .footer-inner { padding: 24px 16px !important; flex-direction: column !important; align-items: center !important; }
          .hero-video { border-radius: 12px !important; }
          .plan-card { padding: 24px 20px !important; }
        }
        @media (max-width: 480px) {
          .hero-title { font-size: 28px !important; letter-spacing: -0.5px !important; }
          .cta-title { font-size: 26px !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64, background: scrolled ? 'rgba(10,10,15,0.95)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent', transition: 'all 0.3s ease' }}>
        <div className="nav-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c6dfa,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 16 }}>🌙</span>
            </div>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18 }}>LUNA</span>
          </div>
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {['Recursos', 'Precos', 'FAQ'].map(item => (
              <a key={item} href={'#' + item.toLowerCase()} style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>{item}</a>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/login" style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '8px 12px' }}>Entrar</Link>
            <Link href="/login" style={{ fontSize: 13, fontFamily: 'Syne', fontWeight: 700, background: 'linear-gradient(135deg,#7c6dfa,#a78bfa)', color: '#fff', textDecoration: 'none', padding: '9px 16px', borderRadius: 10, whiteSpace: 'nowrap' }}>Comecar gratis</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-section" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 40px 80px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, background: 'radial-gradient(ellipse,rgba(124,109,250,0.12) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,109,250,0.12)', border: '1px solid rgba(124,109,250,0.3)', borderRadius: 99, padding: '6px 16px', marginBottom: 32 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3a0', boxShadow: '0 0 6px #22d3a0' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#a78bfa', letterSpacing: 0.5 }}>Assistente pessoal com IA</span>
        </div>

        {/* VIDEO YOUTUBE */}
        <div className="hero-video" style={{ width: '100%', maxWidth: 900, marginBottom: 48, position: 'relative', zIndex: 1, borderRadius: 20, overflow: 'hidden', boxShadow: '0 0 0 1px rgba(124,109,250,0.2), 0 40px 80px rgba(0,0,0,0.5)', aspectRatio: '16/9' }}>
          <iframe
            src="https://www.youtube.com/embed/7QmJEq5j9rQ?rel=0&modestbranding=1"
            title="LUNA"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          />
        </div>

        <h1 className="hero-title" style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 'clamp(32px,5vw,60px)', lineHeight: 1.05, letterSpacing: -1, marginBottom: 24, maxWidth: 800, background: 'linear-gradient(135deg,#f0f0f8 30%,rgba(167,139,250,0.8))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Sua vida organizada.<br />Sem esforco.
        </h1>

        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', maxWidth: 520, lineHeight: 1.7, marginBottom: 40 }}>
          Luna integra agenda, habitos, financas e WhatsApp em um assistente inteligente que organiza tudo por voce.
        </p>

        <div className="hero-btns" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 500, width: '100%' }}>
          <Link href="/login" style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, background: 'linear-gradient(135deg,#7c6dfa,#a78bfa)', color: '#fff', textDecoration: 'none', padding: '14px 32px', borderRadius: 12, boxShadow: '0 0 30px rgba(124,109,250,0.4)', display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' }}>
            Comecar gratis →
          </Link>
          <a href="#recursos" style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 15, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '14px 28px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', flex: 1, textAlign: 'center' }}>
            Ver como funciona
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Gratuito para comecar', 'Google Calendar integrado', 'WhatsApp nativo'].map(label => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#22d3a0" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="recursos" className="section-pad" style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#7c6dfa', textTransform: 'uppercase', marginBottom: 12 }}>Recursos</div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 'clamp(24px,4vw,44px)', letterSpacing: -0.5, marginBottom: 12 }}>Tudo que voce precisa, em um so lugar</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', maxWidth: 480, margin: '0 auto' }}>Luna nao e mais um app de produtividade — e o unico que voce vai precisar.</p>
        </div>
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {features.map(({ icon, label, desc }) => (
            <div key={label} style={{ background: 'rgba(19,19,26,0.6)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px 20px' }}>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{icon}</div>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="precos" className="section-pad" style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#7c6dfa', textTransform: 'uppercase', marginBottom: 12 }}>Precos</div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 'clamp(24px,4vw,44px)', letterSpacing: -0.5, marginBottom: 24 }}>Simples e transparente</h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 99, padding: '4px 6px' }}>
            {['Mensal', 'Anual (-30%)'].map((opt, idx) => (
              <button key={opt} onClick={() => setBillingAnnual(idx === 1)} style={{ background: (idx === 1) === billingAnnual ? '#7c6dfa' : 'transparent', color: (idx === 1) === billingAnnual ? '#fff' : 'rgba(255,255,255,0.4)', border: 'none', borderRadius: 99, padding: '7px 16px', fontFamily: 'Syne', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {plans.map((plan) => {
            const savings = getSavings(plan.monthly, plan.annualTotal)
            return (
              <div key={plan.name} className="plan-card" style={{ background: plan.accent ? 'rgba(124,109,250,0.08)' : 'rgba(19,19,26,0.6)', border: plan.accent ? '1px solid rgba(124,109,250,0.4)' : plan.highlight ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '28px 24px', position: 'relative' }}>
                {plan.badge && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#7c6dfa', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 99, whiteSpace: 'nowrap' }}>{plan.badge}</div>}
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>{plan.desc}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: savings ? 8 : 24 }}>
                  <span style={{ fontFamily: 'Syne', fontSize: 40, fontWeight: 800, letterSpacing: -2, color: plan.highlight || '#f0f0f8' }}>
                    {getPrice(plan.monthly, plan.annualTotal)}
                  </span>
                  {plan.monthly > 0 && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>/mes</span>}
                </div>
                {savings && <div style={{ fontSize: 11, color: '#22d3a0', marginBottom: 16 }}>{savings}</div>}
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#22d3a0" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </div>
                ))}
                {plan.off.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13, color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through' }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.2)" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    {f}
                  </div>
                ))}
                <Link href="/login" style={{ display: 'block', textAlign: 'center', marginTop: 24, fontFamily: 'Syne', fontWeight: 700, fontSize: 14, background: plan.accent ? 'linear-gradient(135deg,#7c6dfa,#a78bfa)' : plan.highlight ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.07)', color: plan.highlight ? '#f59e0b' : '#fff', textDecoration: 'none', padding: '12px', borderRadius: 10, border: plan.accent ? 'none' : plan.highlight ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.12)', boxShadow: plan.accent ? '0 0 24px rgba(124,109,250,0.35)' : 'none' }}>
                  {plan.cta}
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="faq-section" style={{ padding: '80px 40px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#7c6dfa', textTransform: 'uppercase', marginBottom: 12 }}>FAQ</div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 'clamp(24px,4vw,36px)', letterSpacing: -0.5 }}>Duvidas frequentes</h2>
        </div>
        {faqs.map(({ q, a }) => (
          <div key={q} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '22px 0' }}>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{q}</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{a}</div>
          </div>
        ))}
      </section>

      {/* CTA FINAL */}
      <section className="cta-section" style={{ padding: '80px 40px 120px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse,rgba(124,109,250,0.15) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <h2 className="cta-title" style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 'clamp(28px,5vw,52px)', letterSpacing: -1.5, marginBottom: 16 }}>Comece hoje, de graca.</h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', marginBottom: 40, maxWidth: 420, margin: '0 auto 40px' }}>Sem cartao de credito. Em 30 segundos voce ja esta usando Luna.</p>
        <Link href="/login" style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17, background: 'linear-gradient(135deg,#7c6dfa,#a78bfa)', color: '#fff', textDecoration: 'none', padding: '16px 40px', borderRadius: 14, boxShadow: '0 0 40px rgba(124,109,250,0.45)', display: 'inline-block' }}>
          Criar conta gratis →
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="footer-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#7c6dfa,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 12 }}>🌙</span>
            </div>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 15 }}>LUNA</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', marginLeft: 8 }}>© 2025</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link href="/privacy" style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Privacidade</Link>
            <Link href="/terms" style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Termos</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
