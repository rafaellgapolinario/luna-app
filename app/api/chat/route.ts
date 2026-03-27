import { NextRequest } from 'next/server'

export const runtime = 'edge'

interface Message { role: 'user' | 'assistant'; content: string }

// ââ Intent detection ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function detectIntent(text: string) {
  const t = text.toLowerCase()
  if (/(anota|registra|salva|guarda|cria.*(nota|tarefa|lembrete)|me lembra|nÃ£o esquecer|preciso fazer|tenho que)/i.test(t)) return 'save_note'
  if (/(cria.*evento|coloca na agenda|quero agendar|marca.*(reuniÃ£o|consulta|compromisso)|adiciona.*calendÃ¡rio|agenda.*para)/i.test(t)) return 'create_event'
  if (/(academia|exercÃ­cio|treino|meditar|beber Ã¡gua|dormir cedo|hÃ¡bito|rotina diÃ¡ria)/i.test(t)) return 'save_habit'
  if (/(gastei|comprei|paguei|recebi|salÃ¡rio|limite.*gasto|budget|orÃ§amento|finanÃ§a)/i.test(t)) return 'save_finance'
  if (/(projeto|sprint|milestone|deadline|entrega|fase do)/i.test(t)) return 'save_project'
  return 'chat'
}

// ââ AI call âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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

// ââ Azure TTS âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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

// ââ Main handler ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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
    : 'AGENDA: NÃ£o carregada.'
  const voiceRule = voiceMode
    ? 'MODO VOZ: MÃ¡ximo 2 frases curtas. Sem markdown, sem listas, sem emojis.'
    : 'FormataÃ§Ã£o markdown permitida.'

  // ââ SAVE NOTE ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  if (intent === 'save_note') {
    const sys = `Extraia uma anotaÃ§Ã£o do texto. Responda SOMENTE JSON vÃ¡lido:\n{"tipo":"nota|tarefa|lembrete","titulo":"tÃ­tulo curto","conteudo":"conteÃºdo","prioridade":"alta|media|baixa","lembrete_em":"YYYY-MM-DDTHH:mm:ss ou null"}\nData: ${now}`
    try {
      const raw = await callAI([{ role: 'user', content: lastMsg }], sys, false, geminiKey) as string
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      const label = parsed.tipo === 'tarefa' ? 'Tarefa criada' : parsed.tipo === 'lembrete' ? 'Lembrete criado' : 'Anotado'
      const reply = voiceMode
        ? `${label}: ${parsed.titulo || parsed.conteudo?.substring(0, 40)}`
        : `â **${label}!**\n\n**${parsed.titulo || ''}**\n${parsed.conteudo}${parsed.lembrete_em ? `\n\nâ° ${new Date(parsed.lembrete_em).toLocaleString('pt-BR')}` : ''}\n\nPrioridade: ${parsed.prioridade}`
      return buildResponse(reply, parsed, 'note', ttsEnabled, voiceMode)
    } catch {}
  }

  // ââ SAVE HABIT âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  if (intent === 'save_habit') {
    const sys = `Extraia um hÃ¡bito. Responda SOMENTE JSON vÃ¡lido:\n{"nome":"nome do hÃ¡bito","frequencia":"diario|semanal","horario_sugerido":"HH:mm ou null","meta_dias":30}\nData: ${now}`
    try {
      const raw = await callAI([{ role: 'user', content: lastMsg }], sys, false, geminiKey) as string
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      const reply = voiceMode
        ? `HÃ¡bito criado: ${parsed.nome}`
        : `ð¯ **HÃ¡bito criado!**\n\n**${parsed.nome}**\nFrequÃªncia: ${parsed.frequencia}\nMeta: ${parsed.meta_dias} dias${parsed.horario_sugerido ? `\nHorÃ¡rio: ${parsed.horario_sugerido}` : ''}`
      return buildResponse(reply, parsed, 'habit', ttsEnabled, voiceMode)
    } catch {}
  }

  // ââ SAVE FINANCE âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  if (intent === 'save_finance') {
    const sys = `Extraia transaÃ§Ã£o financeira. Responda SOMENTE JSON vÃ¡lido:\n{"tipo":"gasto|receita","valor":0.00,"categoria":"alimentaÃ§Ã£o|transporte|saÃºde|lazer|outro","descricao":"descriÃ§Ã£o curta","data":"YYYY-MM-DD"}\nData: ${now}`
    try {
      const raw = await callAI([{ role: 'user', content: lastMsg }], sys, false, geminiKey) as string
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      const emoji = parsed.tipo === 'receita' ? 'ð°' : 'ð¸'
      const reply = voiceMode
        ? `${parsed.tipo === 'receita' ? 'Receita' : 'Gasto'} de R$ ${parsed.valor} registrado`
        : `${emoji} **${parsed.tipo === 'receita' ? 'Receita' : 'Gasto'} registrado!**\n\nValor: **R$ ${parsed.valor}**\nCategoria: ${parsed.categoria}\n${parsed.descricao}`
      return buildResponse(reply, parsed, 'finance', ttsEnabled, voiceMode)
    } catch {}
  }

  // ââ CREATE EVENT âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  if (intent === 'create_event' && accessToken) {
    const sys = `Extraia evento. Responda SOMENTE JSON vÃ¡lido:\n{"summary":"tÃ­tulo","start":"YYYY-MM-DDTHH:mm:ss","end":"YYYY-MM-DDTHH:mm:ss","description":null}\nData: ${now}. Se nÃ£o souber o fim, soma 1h ao inÃ­cio.`
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
          : `â **Evento criado!**\n\nð **${parsed.summary}**\nâ° ${new Date(parsed.start).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`
        return buildResponse(reply, parsed, 'event', ttsEnabled, voiceMode)
      }
    } catch {}
  }

  // ââ STREAMING CHAT âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  const system = `VocÃª Ã© LUNA, assistente pessoal de ${userName || 'usuÃ¡rio'}. Responda APENAS em ${lang === 'en' ? 'English' : lang === 'es' ? 'espaÃ±ol' : 'portuguÃªs brasileiro'}. Data: ${now}\n${voiceRule}\n${calInfo}`

  // Se tem TTS ativo, nÃ£o streamamos (precisamos do texto completo para Azure TTS)
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
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
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

// ââ Helper: monta resposta com TTS opcional âââââââââââââââââââââââââââââââââââ
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
