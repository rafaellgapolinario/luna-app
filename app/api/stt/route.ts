import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const audio = form.get('audio') as File | null
    const lang = (form.get('lang') as string) || 'pt'

    if (!audio) return NextResponse.json({ error: 'no audio' }, { status: 400 })

    // Tentar Whisper da OpenAI se tiver chave
    const openaiKey = process.env.OPENAI_API_KEY
    if (openaiKey) {
      const fd = new FormData()
      fd.append('file', audio, 'audio.webm')
      fd.append('model', 'whisper-1')
      fd.append('language', lang === 'pt' ? 'pt' : lang === 'es' ? 'es' : 'en')

      const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + openaiKey },
        body: fd,
      })

      if (res.ok) {
        const data = await res.json()
        return NextResponse.json({ text: data.text })
      }
    }

    // Sem chave Whisper — retornar erro para o cliente usar Web Speech API
    return NextResponse.json({ error: 'no_stt_key', useWebSpeech: true }, { status: 503 })
  } catch (e) {
    console.error('STT error:', e)
    return NextResponse.json({ error: 'stt_failed', useWebSpeech: true }, { status: 500 })
  }
}
