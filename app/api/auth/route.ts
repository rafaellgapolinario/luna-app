import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { googleId, nome, email, avatar } = await req.json()
  if (!googleId || !email) return NextResponse.json({ error: 'missing fields' }, { status: 400 })

  // Upsert usuário
  const { data, error } = await supabase
    .from('users')
    .upsert({ google_id: googleId, nome, email, avatar, ultimo_login: new Date().toISOString() }, { onConflict: 'google_id' })
    .select('id, plano')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Garantir que settings existam
  await supabase.from('settings').upsert({ user_id: data.id }, { onConflict: 'user_id' })

  // Log
  await supabase.from('activity_logs').insert({ user_id: data.id, acao: 'login', detalhes: { email } })

  return NextResponse.json({ id: data.id, plano: data.plano })
}
