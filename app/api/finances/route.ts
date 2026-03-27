import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id')
  const mes = req.nextUrl.searchParams.get('mes')
  if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 })
  let query = supabase.from('finances').select('*').eq('user_id', userId).order('data', { ascending: false })
  if (mes) query = query.gte('data', `${mes}-01`).lte('data', `${mes}-31`)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await supabase.from('finances').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  const { error } = await supabase.from('finances').delete().eq('id', id!)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
