import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

interface Message { role: 'user' | 'assistant'; content: string }

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function detectIntent(text: string) {
  const t = text.toLowerCase()
  if (/(anota|registra|salva|guarda|cria.*(nota|tarefa|lembrete)|me lembra|nao esquecer|preciso fazer|tenho que)/i.test(t)) return 'save_note'
  if (/(cria.*evento|coloca na agenda|quero agendar|marca.*(reuniao|consulta|compromisso)|adiciona.*calendario|agenda.*para|adicione.*agenda|evento.*amanha|evento.*hoje|adicione na minha agenda)/i.test(t)) return 'create_event'
  if (/(academia|exercicio|treino|meditar|beber agua|dormir cedo|habito|rotina diaria)/i.test(t)) return 'save_habit'
  if (/(gastei|comprei|paguei|recebi|salario|limite.*gasto|budget|orcamento|financa)/i.test(t)) return 'save_finance'
  return 'chat'
}

async function callAI(messages: Message[], system: string, geminiKey?: string): Promise<string> {
  if (process.env.OPENROUTER_API_KEY) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.OPENROUTER_API_KEY,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://minha-luna.com',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [{ role: 'system', content: system }, ...messages],
        max_tokens: 600, temperature: 0.2,
      }),
    })
    if (!res.ok) throw new Error('OpenRouter ' + res.status)
    return (await res.json()).choices[0].message.content as string
  }
  const key = geminiKey || process.env.GEMINI_API_KEY
  if (!key) throw new Error('No AI key configured')
  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + key,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        systemInstruction: { parts: [{ text: system }] },
        generationConfig: { maxOutputTokens: 600, temperature: 0.2 },
      }),
    }
  )
  if (!res.ok) throw new Error('Gemini ' + res.status + ': ' + (await res.text()).slice(0, 100))
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini empty response')
  return text as string
}

async function saveMsg(userId: string, role: string, conteudo: string, convId?: string) {
  try {
    let cid = convId
    if (!cid) {
      const { data } = await supabase.from('conversations').select('id')
        .eq('user_id', userId).order('atualizado_em', { ascending: false }).limit(1).single()
      cid = data?.id
      if (!cid) {
        const { data: nc } = await supabase.from('conversations')
          .insert({ user_id: userId, titulo: 'Conversa com LUNA' }).select('id').single()
        cid = nc?.id
      }
    }
    if (cid) {
      await supabase.from('messages').insert({ conversation_id: cid, user_id: userId, role, conteudo })
      await supabase.from('conversations').update({ atualizado_em: new Date().toISOString() }).eq('id', cid)
    }
    return cid
  } catch (e) { console.error('saveMsg:', e); return convId }
}

export async function POST(req: NextRequest) {
  let body: any = {}
  try { body = await req.json() } catch { return Response.json({ reply: 'Requisicao invalida.' }, { status: 400 }) }
  const { messages = [], userName, lang = 'pt', calendarContext, geminiKey, voiceMode, accessToken, userId, conversationId } = body
  const lastMsg = messages[messages.length - 1]?.content || ''
  if (!lastMsg) return Response.json({ reply: 'Mensagem vazia.' })

  const intent = detectIntent(lastMsg)
  const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const calInfo = calendarContext ? 'AGENDA REAL:\n' + calendarContext + '\nNUNCA invente eventos.' : 'AGENDA: Nao carregada ainda.'
  const voiceRule = voiceMode ? 'MODO VOZ: Maximo 2 frases curtas. Sem markdown, listas ou emojis.' : 'Formatacao markdown permitida.'

  let cid = conversationId
  if (userId) cid = await saveMsg(userId, 'user', lastMsg, cid) || cid

  // CREATE EVENT
  if (intent === 'create_event') {
    const sys = 'Extraia evento. Responda SOMENTE JSON valido sem markdown: {"summary":"titulo","start":"YYYY-MM-DDTHH:mm:ss","end":"YYYY-MM-DDTHH:mm:ss","description":null}. Data atual: ' + now + '. Se nao souber fim, soma 1h ao inicio.'
    try {
      const raw = await callAI([{ role: 'user', content: lastMsg }], sys, geminiKey)
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      if (accessToken && parsed.summary && parsed.start) {
        const gcal = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
          body: JSON.stringify({ summary: parsed.summary, description: parsed.description, start: { dateTime: parsed.start, timeZone: 'America/Sao_Paulo' }, end: { dateTime: parsed.end, timeZone: 'America/Sao_Paulo' } }),
        })
        if (gcal.ok) {
          const dt = new Date(parsed.start).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
          const reply = voiceMode ? 'Evento criado: ' + parsed.summary : '[OK] Evento criado!\n\n**' + parsed.summary + '**\nData: ' + dt
          if (userId) await saveMsg(userId, 'assistant', reply, cid)
          return Response.json({ reply, eventCreated: true, conversationId: cid })
        }
      }
    } catch (e) { console.error('create_event:', e) }
  }

  // SAVE NOTE
  if (intent === 'save_note') {
    const sys = 'Extraia anotacao. Responda SOMENTE JSON valido sem markdown: {"tipo":"nota|tarefa|lembrete","titulo":"titulo curto","conteudo":"conteudo","lembrete_em":"YYYY-MM-DDTHH:mm:ss ou null"}. Data: ' + now
    try {
      const raw = await callAI([{ role: 'user', content: lastMsg }], sys, geminiKey)
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      if (userId) await supabase.from('notes').insert({ user_id: userId, tipo: parsed.tipo || 'nota', titulo: parsed.titulo || '', conteudo: parsed.conteudo || lastMsg, lembrete_em: parsed.lembrete_em || null })
      const label = parsed.tipo === 'tarefa' ? 'Tarefa criada' : parsed.tipo === 'lembrete' ? 'Lembrete criado' : 'Anotado'
      const reply = voiceMode ? label + ': ' + (parsed.titulo || parsed.conteudo?.substring(0, 40)) : '[OK] **' + label + '!**\n\n**' + (parsed.titulo || '') + '**\n' + parsed.conteudo
      if (userId) await saveMsg(userId, 'assistant', reply, cid)
      return Response.json({ reply, noteCreated: true, conversationId: cid })
    } catch (e) { console.error('save_note:', e) }
  }

  // SAVE HABIT
  if (intent === 'save_habit') {
    const sys = 'Extraia habito. Responda SOMENTE JSON valido sem markdown: {"nome":"nome do habito","frequencia":"diario|semanal","meta_dias":30}. Data: ' + now
    try {
      const raw = await callAI([{ role: 'user', content: lastMsg }], sys, geminiKey)
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      if (userId) await supabase.from('habits').insert({ user_id: userId, nome: parsed.nome || '', frequencia: parsed.frequencia || 'diario', meta_dias: parsed.meta_dias || 30 })
      const reply = voiceMode ? 'Habito criado: ' + parsed.nome : '[OK] **Habito criado!**\n\n**' + parsed.nome + '**\nFrequencia: ' + parsed.frequencia + '\nMeta: ' + parsed.meta_dias + ' dias'
      if (userId) await saveMsg(userId, 'assistant', reply, cid)
      return Response.json({ reply, habitCreated: true, conversationId: cid })
    } catch (e) { console.error('save_habit:', e) }
  }

  // SAVE FINANCE
  if (intent === 'save_finance') {
    const sys = 'Extraia transacao financeira. Responda SOMENTE JSON valido sem markdown: {"tipo":"gasto|receita","valor":0.00,"categoria":"alimentacao|transporte|saude|lazer|outro","descricao":"descricao curta","data":"YYYY-MM-DD"}. Data: ' + now
    try {
      const raw = await callAI([{ role: 'user', content: lastMsg }], sys, geminiKey)
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      if (userId) await supabase.from('finances').insert({ user_id: userId, tipo: parsed.tipo || 'gasto', valor: parsed.valor || 0, categoria: parsed.categoria || 'outro', descricao: parsed.descricao || '', data: parsed.data || new Date().toISOString().split('T')[0] })
      const reply = voiceMode ? (parsed.tipo === 'receita' ? 'Receita' : 'Gasto') + ' de R$ ' + parsed.valor + ' registrado' : '[OK] **' + (parsed.tipo === 'receita' ? 'Receita' : 'Gasto') + ' registrado!**\n\nValor: **R$ ' + parsed.valor + '**\nCategoria: ' + parsed.categoria + '\n' + parsed.descricao
      if (userId) await saveMsg(userId, 'assistant', reply, cid)
      return Response.json({ reply, financeCreated: true, conversationId: cid })
    } catch (e) { console.error('save_finance:', e) }
  }

  // CHAT NORMAL
  const system = 'Voce e LUNA, assistente pessoal de ' + (userName || 'usuario') + '. Responda APENAS em ' + (lang === 'en' ? 'English' : lang === 'es' ? 'espanol' : 'portugues brasileiro') + '. Data: ' + now + '\n' + voiceRule + '\n' + calInfo
  try {
    const reply = await callAI(messages, system, geminiKey)
    if (userId) await saveMsg(userId, 'assistant', reply, cid)
    return Response.json({ reply, conversationId: cid })
  } catch (e) {
    console.error('chat error:', e)
    return Response.json({ reply: 'Erro ao processar. Verifique sua conexao.' })
  }
}
