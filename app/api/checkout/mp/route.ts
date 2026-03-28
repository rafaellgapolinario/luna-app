import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://minha-luna.com'

export async function POST(req: NextRequest) {
  try {
    const { planId, planName, price, userEmail } = await req.json()

    if (!MP_ACCESS_TOKEN) {
      return NextResponse.json({ error: 'MP nao configurado', demo: true })
    }

    const preference = {
      items: [{
        id: planId,
        title: 'LUNA - Plano ' + planName,
        description: 'Assinatura mensal do plano ' + planName,
        unit_price: price,
        quantity: 1,
        currency_id: 'BRL',
      }],
      payer: { email: userEmail || '' },
      back_urls: {
        success: APP_URL + '/plans?payment=success',
        failure: APP_URL + '/plans?payment=failure',
        pending: APP_URL + '/plans?payment=pending',
      },
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_types: [],
        installments: 1,
      },
      notification_url: APP_URL + '/api/webhooks/mp',
      statement_descriptor: 'LUNA APP',
      external_reference: planId + '_' + Date.now(),
    }

    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + MP_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('MP error:', err)
      return NextResponse.json({ error: 'Erro ao criar preferencia MP' }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json({
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
    })
  } catch (e) {
    console.error('MP checkout error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
