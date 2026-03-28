'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [billingAnnual, setBillingAnnual] = useState(true)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const features = [
    {
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      ),
      label: 'Assistente por voz e texto',
      desc: 'Fale ou escreva para Luna. Ela interpreta linguagem natural e executa — cria eventos, registra gastos, marca hábitos.',
      color: '#7c6dfa',
      bg: 'rgba(124,109,250,0.1)',
    },
    {
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      label: 'Google Calendar integrado',
      desc: 'Sincronização em tempo real com seu Google Calendar. Veja eventos, crie compromissos e receba resumos do seu dia.',
      color: '#22d3a0',
      bg: 'rgba(34,211,160,0.1)',
    },
    {
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
      label: 'Hábitos e metas',
      desc: 'Acompanhe streaks, configure lembretes e veja seu progresso. Luna te motiva com insights personalizados.',
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.1)',
    },
    {
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      label: 'Controle financeiro',
      desc: 'Registre receitas e gastos por categoria. Visualize seu saldo, identifique padrões e tome decisões mais inteligentes.',
      color: '#f87171',
      bg: 'rgba(248,113,113,0.1)',
    },
    {
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      label: 'WhatsApp integrado',
      desc: 'Converse com Luna diretamente pelo WhatsApp. Sem abrir o app — ela está onde você já está.',
      color: '#25D366',
      bg: 'rgba(37,211,102,0.1)',
    },
    {
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
        </svg>
      ),
      label: 'Automações Se → Então',
      desc: 'Configure regras que funcionam sozinhas. "Se chegar segunda, me manda o resumo da semana pelo WhatsApp."',
      color: '#a78bfa',
      bg: 'rgba(167,139,250,0.1)',
    },
  ]

  const plans = [
    {
      name: 'Gratuito',
      price: 0,
      desc: 'Para experimentar Luna',
      features: [
        'Chat com IA (20 mensagens/dia)',
        'Google Calendar (somente leitura)',
        '3 hábitos ativos',
        'Controle financeiro básico',
      ],
      off: ['WhatsApp integrado', 'Automações', 'Notas IA ilimitadas'],
      cta: 'Começar grátis',
      ctaHref: '/login',
      accent: false,
    },
    {
      name: 'Pro',
      price: billingAnnual ? 19 : 27,
      desc: 'Para quem quer o máximo',
      badge: 'Mais popular',
      features: [
        'Chat com IA ilimitado',
        'Google Calendar completo',
        'Hábitos ilimitados + streaks',
        'Finanças com relatórios',
        'WhatsApp integrado',
        'Automações Se → Então',
        'Notas com IA',
        'Suporte prioritário',
      ],
      off: [],
      cta: 'Assinar Pro',
      ctaHref: '/login',
      accent: true,
    },
  ]

  const faqs = [
    { q: 'Funciona no celular?', a: 'Sim. Luna e um PWA - voce instala direto do navegador no celular. Tambem tem integracao nativa com WhatsApp para usar sem abrir o app.' },
    { q: 'Preciso conectar o Google Calendar?', a: 'Nao e obrigatorio, mas recomendado. Sem ele, Luna ainda funciona para IA, habitos e financas.' },
    { q: 'Como funciona o WhatsApp?', a: 'Voce conecta seu numero ao Luna uma vez so. Depois passa a conversar com Luna pelo proprio WhatsApp normalmente.' },
    { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Sem multa, sem fidelidade. Cancele quando quiser pelo painel de configuracoes.' },
    { q: 'Meus dados sao seguros?', a: 'Sim. Todos os dados sao criptografados e armazenados com seguranca. Nunca vendemos ou compartilhamos suas informacoes.' },
  ]

  return (
    <div style={{ background: '#0a0a0f', color: '#f0f0f8', fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 40px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(10,10,15,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg,#7c6dfa,#a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(124,109,250,0.35)',
          }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, letterSpacing: -0.3 }}>LUNA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['Recursos', 'Preços', 'FAQ'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.2s' }}
               onMouseEnter={e => (e.currentTarget.style.color = '#f0f0f8')}
               onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}>
              {item}
            </a>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/login" style={{
            fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
            padding: '8px 16px',
          }}>
            Entrar
          </Link>
          <Link href="/login" style={{
            fontSize: 14, fontFamily: 'Syne', fontWeight: 700,
            background: 'linear-gradient(135deg,#7c6dfa,#a78bfa)',
            color: '#fff', textDecoration: 'none',
            padding: '9px 20px', borderRadius: 10,
            boxShadow: '0 0 20px rgba(124,109,250,0.35)',
          }}>
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 40px 80px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* bg glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 500,
          background: 'radial-gradient(ellipse,rgba(124,109,250,0.12) 0%,transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(124,109,250,0.12)', border: '1px solid rgba(124,109,250,0.3)',
          borderRadius: 99, padding: '6px 16px', marginBottom: 32,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3a0', boxShadow: '0 0 6px #22d3a0' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#a78bfa', letterSpacing: 0.5 }}>Assistente pessoal com IA</span>
        </div>

        {/* Video YouTube grande */}
        <div style={{
          width: '100%', maxWidth: 900, marginBottom: 56, position: 'relative', zIndex: 1,
          borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(124,109,250,0.2), 0 40px 80px rgba(0,0,0,0.5)',
          aspectRatio: '16/9',
        }}>
          <iframe
            src="https://www.youtube.com/embed/7QmJEq5j9rQ?autoplay=0&rel=0&modestbranding=1"
            title="LUNA - Assistente com IA"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          />
        </div>

        <h1 style={{
          fontFamily: 'Syne', fontWeight: 700, fontSize: 'clamp(36px,5vw,64px)',
          lineHeight: 1.05, letterSpacing: -1, marginBottom: 24, maxWidth: 900,
          background: 'linear-gradient(135deg,#f0f0f8 30%,rgba(167,139,250,0.8))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Sua vida organizada.<br />Sem esforco.
        </h1>

        <p style={{
          fontSize: 18, color: 'rgba(255,255,255,0.5)', maxWidth: 520,
          lineHeight: 1.7, marginBottom: 40,
        }}>
          Luna integra agenda, habitos, financas e WhatsApp em um assistente inteligente que entende linguagem natural e organiza tudo por voce.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/login" style={{
            fontFamily: 'Syne', fontWeight: 700, fontSize: 16,
            background: 'linear-gradient(135deg,#7c6dfa,#a78bfa)',
            color: '#fff', textDecoration: 'none',
            padding: '14px 32px', borderRadius: 12,
            boxShadow: '0 0 30px rgba(124,109,250,0.4)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            Comecar gratis
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <a href="#recursos" style={{
            fontFamily: 'Syne', fontWeight: 600, fontSize: 15,
            color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
            padding: '14px 28px', borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            Ver como funciona
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 56, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'Gratuito para comecar' },
            { label: 'Google Calendar integrado' },
            { label: 'WhatsApp nativo' },
          ].map(({ label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#22d3a0" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* MOCKUP PREVIEW */}
      <section style={{ padding: '0 40px 100px', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '100%', maxWidth: 900,
          background: 'rgba(19,19,26,0.8)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,109,250,0.15)',
        }}>
          {/* browser bar */}
          <div style={{
            padding: '12px 18px', background: 'rgba(10,10,15,0.7)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#f87171','#f59e0b','#22d3a0'].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
              ))}
            </div>
            <div style={{
              flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6,
              padding: '5px 12px', fontSize: 12, color: 'rgba(255,255,255,0.3)',
              fontFamily: 'monospace',
            }}>
              minha-luna.com/app
            </div>
          </div>
          {/* dashboard mockup */}
          <div style={{ padding: '28px 32px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>
            {/* sidebar */}
            <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)', paddingRight: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, padding: '10px 12px', background: 'rgba(124,109,250,0.15)', borderRadius: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7c6dfa,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                </div>
                <span style={{ fontSize: 13, fontFamily: 'Syne', fontWeight: 700, color: '#a78bfa' }}>Luna IA</span>
              </div>
              {['Dashboard','Agenda','Hábitos','Finanças','WhatsApp','Automações'].map((item, i) => (
                <div key={item} style={{
                  padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                  fontSize: 13, color: i === 0 ? '#f0f0f8' : 'rgba(255,255,255,0.35)',
                  background: i === 0 ? 'rgba(255,255,255,0.07)' : 'transparent',
                  cursor: 'pointer',
                }}>
                  {item}
                </div>
              ))}
            </div>
            {/* main content */}
            <div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Bom dia, voce 👋</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Sexta-feira, 28 de março · 3 eventos hoje</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
                {[
                  { val: '3', label: 'eventos hoje', color: '#a78bfa' },
                  { val: '2/4', label: 'hábitos feitos', color: '#22d3a0' },
                  { val: 'R$101', label: 'gastos hoje', color: '#f87171' },
                  { val: '2', label: 'tarefas urgentes', color: '#f59e0b' },
                ].map(({ val, label, color }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color }}>{val}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{label}</div>
                  </div>
                ))}
              </div>
              {/* chat CTA */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'linear-gradient(135deg,rgba(124,109,250,0.15),rgba(124,109,250,0.05))',
                border: '1px solid rgba(124,109,250,0.3)', borderRadius: 12, padding: '14px 18px',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7c6dfa,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontFamily: 'Syne', fontWeight: 700, color: '#a78bfa' }}>⚡ Falar com Luna</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Diga algo · Ela organiza tudo automaticamente</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="recursos" style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#7c6dfa', textTransform: 'uppercase', marginBottom: 16 }}>Recursos</div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 'clamp(28px,4vw,44px)', letterSpacing: -0.5, marginBottom: 16 }}>
            Tudo que você precisa,<br />em um só lugar
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', maxWidth: 480, margin: '0 auto' }}>
            Luna não é mais um app de produtividade — é o único app que você vai precisar.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {features.map(({ icon, label, desc, color, bg }) => (
            <div key={label} style={{
              background: 'rgba(19,19,26,0.6)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: '28px 24px',
              transition: 'border-color 0.2s',
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {icon}
              </div>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{label}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="preços" style={{ padding: '80px 40px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#7c6dfa', textTransform: 'uppercase', marginBottom: 16 }}>Preços</div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 'clamp(28px,4vw,44px)', letterSpacing: -0.5, marginBottom: 16 }}>
            Simples e transparente
          </h2>

          {/* toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 99, padding: '4px 6px' }}>
            {['Mensal', 'Anual'].map(opt => (
              <button key={opt} onClick={() => setBillingAnnual(opt === 'Anual')} style={{
                background: (opt === 'Anual') === billingAnnual ? '#7c6dfa' : 'transparent',
                color: (opt === 'Anual') === billingAnnual ? '#fff' : 'rgba(255,255,255,0.4)',
                border: 'none', borderRadius: 99, padding: '7px 20px',
                fontFamily: 'Syne', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
                {opt}{opt === 'Anual' ? ' (-30%)' : ''}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {plans.map(({ name, price, desc, badge, features: feats, off, cta, ctaHref, accent }) => (
            <div key={name} style={{
              background: accent ? 'rgba(124,109,250,0.08)' : 'rgba(19,19,26,0.6)',
              border: accent ? '1px solid rgba(124,109,250,0.4)' : '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20, padding: '32px 28px', position: 'relative',
            }}>
              {badge && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: '#7c6dfa', color: '#fff', fontSize: 11, fontWeight: 700,
                  padding: '4px 14px', borderRadius: 99, whiteSpace: 'nowrap',
                  letterSpacing: 0.5,
                }}>
                  {badge}
                </div>
              )}
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>{name}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>{desc}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 28 }}>
                <span style={{ fontFamily: 'Syne', fontSize: 48, fontWeight: 800, letterSpacing: -2 }}>
                  {price === 0 ? 'Grátis' : `R$${price}`}
                </span>
                {price > 0 && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>/mês</span>}
              </div>
              {feats.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 14 }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#22d3a0" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {f}
                </div>
              ))}
              {off.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 14, color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through' }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.2)" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  {f}
                </div>
              ))}
              <Link href={ctaHref} style={{
                display: 'block', textAlign: 'center', marginTop: 28,
                fontFamily: 'Syne', fontWeight: 700, fontSize: 15,
                background: accent ? 'linear-gradient(135deg,#7c6dfa,#a78bfa)' : 'rgba(255,255,255,0.07)',
                color: '#fff', textDecoration: 'none',
                padding: '14px', borderRadius: 12,
                boxShadow: accent ? '0 0 24px rgba(124,109,250,0.35)' : 'none',
                border: accent ? 'none' : '1px solid rgba(255,255,255,0.12)',
              }}>
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: '80px 40px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#7c6dfa', textTransform: 'uppercase', marginBottom: 16 }}>FAQ</div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 'clamp(28px,4vw,36px)', letterSpacing: -1.5 }}>
            Dúvidas frequentes
          </h2>
        </div>
        {faqs.map(({ q, a }) => (
          <div key={q} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '24px 0' }}>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{q}</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{a}</div>
          </div>
        ))}
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '80px 40px 120px', textAlign: 'center', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 300,
          background: 'radial-gradient(ellipse,rgba(124,109,250,0.15) 0%,transparent 70%)',
          pointerEvents: 'none',
        }} />
        <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 'clamp(28px,4vw,52px)', letterSpacing: -2, marginBottom: 16 }}>
          Comece hoje, de graça.
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', marginBottom: 40, maxWidth: 420, margin: '0 auto 40px' }}>
          Sem cartão de crédito. Em 30 segundos você já está usando Luna.
        </p>
        <Link href="/login" style={{
          fontFamily: 'Syne', fontWeight: 700, fontSize: 17,
          background: 'linear-gradient(135deg,#7c6dfa,#a78bfa)',
          color: '#fff', textDecoration: 'none',
          padding: '16px 40px', borderRadius: 14,
          boxShadow: '0 0 40px rgba(124,109,250,0.45)',
          display: 'inline-block',
        }}>
          Criar conta grátis →
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '32px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: 'linear-gradient(135deg,#7c6dfa,#a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.5">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 15 }}>LUNA</span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', marginLeft: 12 }}>© 2025</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[{ label: 'Privacidade', href: '/privacy' }, { label: 'Termos', href: '/terms' }].map(({ label, href }) => (
            <Link key={label} href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  )
}
