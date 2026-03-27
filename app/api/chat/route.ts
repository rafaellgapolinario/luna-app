import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

interface Message { role: 'user' | 'assistant'; content: string }

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ Intent detection ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
function detectIntent(text: string) {
  const t = text.toLowerCase()
  if (/(anota|registra|salva|guarda|cria.*(nota|tarefa|lembrete)|me lembra|nÃÂÃÂ£o esquecer|preciso fazer|tenho que)/i.test(t)) return 'save_note'
  if (/(cria.*evento|coloca na agenda|quero agendar|marca.*(reuniÃÂÃÂ£o|consulta|compromisso)|adiciona.*calendÃÂÃÂ¡rio|agenda.*para)/i.test(t)) return 'create_event'
  if (/(academia|exercÃÂÃÂ­cio|treino|meditar|beber ÃÂÃÂ¡gua|dormir cedo|hÃÂÃÂ¡bito|rotina diÃÂÃÂ¡ria)/i.test(t)) return 'save_habit'
  if (/(gastei|comprei|paguei|recebi|salÃÂÃÂ¡rio|limite.*gasto|budget|orÃÂÃÂ§amento|finanÃÂÃÂ§a)/i.test(t)) return 'save_finance'
  if (/(projeto|sprint|milestone|deadline|entrega|fase do)/i.test(t)) return 'save_project'
  return 'chat'
}

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ AI call ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
async function callAI(messages: Message[], system: string, stream = false, geminiKey?: string): Promise<Response | string> {
  if (process.env.OPENROUTER_API_KEY) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://minha-luna.com',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [{ role: 'system', content: system }, ...messages],
        max_tokens: 500,
        temperature: 0.2,
        stream,
      }),
    })
    if (!res.ok) throw new Error(`OpenRouter ${res.status}`)
    if (stream) return res
    return (await res.json()).choices[0].message.content as string
  }
  const key = geminiKey || process.env.GEMINI_API_KEY
  if (!key) throw new Error('No AI key')
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        systemInstruction: { parts: [{ text: system }] },
        generationConfig: { maxOutputTokens: 500, temperature: 0.2 },
      }),
    }
  )
  if (!res.ok) throw new Error(`Gemini ${res.status}`)
  return (await res.json()).candidates[0].content.parts[0].text as string
}

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ Azure TTS ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
async function azureTTS(text: string): Promise<ArrayBuffer | null> {
  const key = process.env.AZURE_TTS_KEY
  const region = process.env.AZURE_TTS_REGION || 'brazilsouth'
  if (!key) return null

  const ssml = `<speak version='1.0' xml:lang='pt-BR'>
    <voice name='pt-BR-JulioNeural'>
      <prosody rate='+6%' pitch='-0.3st'>${text.replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] ?? c))}</prosody>
    </voice>
  </speak>`

  const tokenRes = await fetch(
    `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
    { method: 'POST', headers: { 'Ocp-Apim-Subscription-Key': key } }
  )
  if (!tokenRes.ok) return null
  const token = await tokenRes.text()

  const ttsRes = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      },
      body: ssml,
    }
  )
  if (!ttsRes.ok) return null
  return ttsRes.arrayBuffer()
}

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ Main handler ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
export async function POST(req: NextRequest) {
  const {
    messages, userName, lang, calendarContext,
    geminiKey, voiceMode, accessToken, ttsEnabled,
  } = await req.json()

  const lastMsg = messages[messages.length - 1]?.content || ''
  const intent = detectIntent(lastMsg)
  const now = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo', weekday: 'long',
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
  const calInfo = calendarContext
    ? `AGENDA REAL:\n${calendarContext}\nNUNCA invente eventos.`
    : 'AGENDA: NÃÂÃÂ£o carregada.'
  const voiceRule = voiceMode
    ? 'MODO VOZ: MÃÂÃÂ¡ximo 2 frases curtas. Sem markdown, sem listas, sem emojis.'
    : 'FormataÃÂÃÂ§ÃÂÃÂ£o markdown permitida.'

  // ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ SAVE NOTE ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
  if (intent === 'save_note') {
    const sys = `Extraia uma anotaÃÂÃÂ§ÃÂÃÂ£o do texto. Responda SOMENTE JSON vÃÂÃÂ¡lido:\n{"tipo":"nota|tarefa|lembrete","titulo":"tÃÂÃÂ­tulo curto","conteudo":"conteÃÂÃÂºdo","prioridade":"alta|media|baixa","lembrete_em":"YYYY-MM-DDTHH:mm:ss ou null"}\nData: ${now}`
    try {
      const raw = await callAI([{ role: 'user', content: lastMsg }], sys, false, geminiKey) as string
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      const label = parsed.tipo === 'tarefa' ? 'Tarefa criada' : parsed.tipo === 'lembrete' ? 'Lembrete criado' : 'Anotado'
      const reply = voiceMode
        ? `${label}: ${parsed.titulo || parsed.conteudo?.substring(0, 40)}`
        : `ÃÂ¢ÃÂÃÂ **${label}!**\n\n**${parsed.titulo || ''}**\n${parsed.conteudo}${parsed.lembrete_em ? `\n\nÃÂ¢ÃÂÃÂ° ${new Date(parsed.lembrete_em).toLocaleString('pt-BR')}` : ''}\n\nPrioridade: ${parsed.prioridade}`
      return buildResponse(reply, parsed, 'note', ttsEnabled, voiceMode)
    } catch {}
  }

  // ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ SAVE HABIT ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
  if (intent === 'save_habit') {
    const sys = `Extraia um hÃÂÃÂ¡bito. Responda SOMENTE JSON vÃÂÃÂ¡lido:\n{"nome":"nome do hÃÂÃÂ¡bito","frequencia":"diario|semanal","horario_sugerido":"HH:mm ou null","meta_dias":30}\nData: ${now}`
    try {
      const raw = await callAI([{ role: 'user', content: lastMsg }], sys, false, geminiKey) as string
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      const reply = voiceMode
        ? `HÃÂÃÂ¡bito criado: ${parsed.nome}`
        : `ÃÂ°ÃÂÃÂÃÂ¯ **HÃÂÃÂ¡bito criado!**\n\n**${parsed.nome}**\nFrequÃÂÃÂªncia: ${parsed.frequencia}\nMeta: ${parsed.meta_dias} dias${parsed.horario_sugerido ? `\nHorÃÂÃÂ¡rio: ${parsed.horario_sugerido}` : ''}`
      return buildResponse(reply, parsed, 'habit', ttsEnabled, voiceMode)
    } catch {}
  }

  // ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ SAVE FINANCE ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
  if (intent === 'save_finance') {
    const sys = `Extraia transaÃÂÃÂ§ÃÂÃÂ£o financeira. Responda SOMENTE JSON vÃÂÃÂ¡lido:\n{"tipo":"gasto|receita","valor":0.00,"categoria":"alimentaÃÂÃÂ§ÃÂÃÂ£o|transporte|saÃÂÃÂºde|lazer|outro","descricao":"descriÃÂÃÂ§ÃÂÃÂ£o curta","data":"YYYY-MM-DD"}\nData: ${now}`
    try {
      const raw = await callAI([{ role: 'user', content: lastMsg }], sys, false, geminiKey) as string
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      const emoji = parsed.tipo === 'receita' ? 'ÃÂ°ÃÂÃÂÃÂ°' : 'ÃÂ°ÃÂÃÂÃÂ¸'
      const reply = voiceMode
        ? `${parsed.tipo === 'receita' ? 'Receita' : 'Gasto'} de R$ ${parsed.valor} registrado`
        : `${emoji} **${parsed.tipo === 'receita' ? 'Receita' : 'Gasto'} registrado!**\n\nValor: **R$ ${parsed.valor}**\nCategoria: ${parsed.categoria}\n${parsed.descricao}`
      return buildResponse(reply, parsed, 'finance', ttsEnabled, voiceMode)
    } catch {}
  }

  // ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ CREATE EVENT ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
  if (intent === 'create_event' && accessToken) {
    const sys = `Extraia evento. Responda SOMENTE JSON vÃÂÃÂ¡lido:\n{"summary":"tÃÂÃÂ­tulo","start":"YYYY-MM-DDTHH:mm:ss","end":"YYYY-MM-DDTHH:mm:ss","description":null}\nData: ${now}. Se nÃÂÃÂ£o souber o fim, soma 1h ao inÃÂÃÂ­cio.`
    try {
      const raw = await callAI([{ role: 'user', content: lastMsg }], sys, false, geminiKey) as string
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      const gcal = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: parsed.summary, description: parsed.description,
          start: { dateTime: parsed.start, timeZone: 'America/Sao_Paulo' },
          end: { dateTime: parsed.end, timeZone: 'America/Sao_Paulo' },
        }),
      })
      if (gcal.ok) {
        const reply = voiceMode
          ? `Evento criado: ${parsed.summary}`
          : `ÃÂ¢ÃÂÃÂ **Evento criado!**\n\nÃÂ°ÃÂÃÂÃÂ **${parsed.summary}**\nÃÂ¢ÃÂÃÂ° ${new Date(parsed.start).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`
        return buildResponse(reply, parsed, 'event', ttsEnabled, voiceMode)
      }
    } catch {}
  }

  // ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ STREAMING CHAT ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
  const system = `VocÃÂÃÂª ÃÂÃÂ© LUNA, assistente pessoal de ${userName || 'usuÃÂÃÂ¡rio'}. Responda APENAS em ${lang === 'en' ? 'English' : lang === 'es' ? 'espaÃÂÃÂ±ol' : 'portuguÃÂÃÂªs brasileiro'}. Data: ${now}\n${voiceRule}\n${calInfo}`

  // Se tem TTS ativo, nÃÂÃÂ£o streamamos (precisamos do texto completo para Azure TTS)
  if (ttsEnabled && voiceMode) {
    try {
      const reply = await callAI(messages, system, false, geminiKey) as string
      return buildResponse(reply, null, 'chat', ttsEnabled, voiceMode)
    } catch {
      return Response.json({ reply: 'Erro ao processar.' })
    }
  }

  // Streaming normal
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const upstream = await callAI(messages, system, true, geminiKey) as Response
      const encoder = new TextEncoder()
      const stream = new TransformStream()
      const writer = stream.writable.getWriter()

      const reader = upstream.body!.getReader()
      const decoder = new TextDecoder()

      ;(async () => {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value)
            const lines = chunk.split('\n').filter(l => l.startsWith('data: ') && l !== 'data: [DONE]')
            for (const line of lines) {
              try {
                const json = JSON.parse(line.slice(6))
                const text = json.choices?.[0]?.delta?.content
                if (text) await writer.write(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
              } catch {}
            }
          }
        } finally {
          await writer.close()
        }
      })()

      return new Response(stream.readable, {
        headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache' },
      })
    } catch {}
  }

  // Fallback sem streaming
  try {
    const reply = await callAI(messages, system, false, geminiKey) as string
    return Response.json({ reply })
  } catch {
    return Response.json({ reply: 'Erro ao processar. Tente novamente.' })
  }
}

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ Helper: monta resposta com TTS opcional ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
async function buildResponse(
  reply: string,
  data: Record<string, unknown> | null,
  type: string,
  ttsEnabled: boolean,
  voiceMode: boolean
) {
  if (ttsEnabled && voiceMode) {
    // Texto limpo para TTS (sem markdown)
    const clean = reply.replace(/[*_`#>\[\]]/g, '').replace(/\n+/g, ' ').trim()
    const audio = await azureTTS(clean)
    if (audio) {
      const b64 = btoa(String.fromCharCode(...new Uint8Array(audio)))
      return Response.json({ reply, audioBase64: b64, type, data })
    }
  }
  return Response.json({ reply, type, data })
}
