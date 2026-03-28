import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const PRICES = {
  pro:      { monthly: 29.90,  annual: 239 },
  business: { monthly: 97.00,  annual: 779 },
}

export async function POST(req: NextRequest) {
  try {
    const { planId, billing, email, name } = await req.json()
    const accessToken = process.env.MP_ACCESS_TOKEN

    if (!accessToken) {
      return NextResponse.json({ error: 'MP_ACCESS_TOKEN not configured' }, { status: 503 })
    }

    const plan = PRICES[planId as keyof typeof PRICES]
    if (!plan) return NextResponse.json({ error: 'invalid plan' }, { status: 400 })

    const amount = billing === 'annual' ? plan.annual : plan.monthly
    const title = planId === 'pro' ? 'Luna Pro' : 'Luna Business'
    const period = billing === 'annual' ? '(anual)' : '(mensal)'

    const body = {
      items: [{
        title: title + ' ' + period,
        quantity: 1,
        unit_price: amount,
        currency_id: 'BRL',
      }],
      payer: {
        email: email || '',
        name: name || '',
      },
      back_urls: {
        success: 'https://minha-luna.com/plans?status=success',
        failure: 'https://minha-luna.com/plans?status=failure',
        pending: 'https://minha-luna.com/plans?status=pending',
      },
      auto_return: 'approved',
      statement_descriptor: 'LUNA APP',
      external_reference: planId + '_' + billing + '_' + Date.now(),
    }

    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('MP error:', err)
      return NextResponse.json({ error: 'MP checkout failed' }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json({ init_point: data.init_point, id: data.id })
  } catch (e) {
    console.error('MP route error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
