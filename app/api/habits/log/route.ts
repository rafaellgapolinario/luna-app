import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { habit_id, user_id, data } = await req.json()
  const hoje = data || new Date().toISOString().split('T')[0]
  await supabase.from('habit_logs').upsert({ habit_id, user_id, data: hoje }, { onConflict: 'habit_id,data' })
  const { data: logs } = await supabase.from('habit_logs').select('data').eq('habit_id', habit_id).order('data', { ascending: false })
  let streak = 0
  if (logs) {
    const today = new Date(hoje)
    for (let i = 0; i < logs.length; i++) {
      const d = new Date(logs[i].data)
      const diff = Math.round((today.getTime() - d.getTime()) / 86400000)
      if (diff === i) streak++; else break
    }
  }
  const { data: habit } = await supabase.from('habits').select('streak_maximo').eq('id', habit_id).single()
  const novoMax = Math.max(streak, habit?.streak_maximo || 0)
  await supabase.from('habits').update({ streak_atual: streak, streak_maximo: novoMax }).eq('id', habit_id)
  return NextResponse.json({ streak })
}

export async function GET(req: NextRequest) {
  const habitId = req.nextUrl.searchParams.get('habit_id')
  const mes = req.nextUrl.searchParams.get('mes')
  let query = supabase.from('habit_logs').select('data').eq('habit_id', habitId!)
  if (mes) query = query.gte('data', `${mes}-01`).lte('data', `${mes}-31`)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data?.map((l: any) => l.data) || [])
}
