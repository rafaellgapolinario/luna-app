import { NextRequest, NextResponse } from 'next/server'

const AZURE_KEY    = process.env.AZURE_TTS_KEY    || ''
const AZURE_REGION = process.env.AZURE_TTS_REGION || 'brazilsouth'

export async function POST(req: NextRequest) {
  const { text, lang = 'pt' } = await req.json()
  if (!text) return NextResponse.json({ error: 'no text' }, { status: 400 })

  const key = AZURE_KEY
  if (!key) return NextResponse.json({ error: 'no key' }, { status: 503 })

  // Limpa markdown e caracteres especiais
  const clean = text.replace(/[*_`#>\[\]]/g, '').replace(/\n+/g, ' ').trim().slice(0, 800)
  const escaped = clean.replace(/[<>&"]/g, (c: string) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] ?? c))

  const ssml = `<speak version='1.0' xml:lang='pt-BR'>
    <voice name='pt-BR-JulioNeural'>
      <prosody rate='+6%' pitch='-0.3st' style='assistant'>${escaped}</prosody>
    </voice>
  </speak>`

  const endpoint = `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
    },
    body: ssml,
  })

  if (!res.ok) return NextResponse.json({ error: 'tts failed' }, { status: 500 })
  const buffer = await res.arrayBuffer()
  return new NextResponse(buffer, {
    headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': buffer.byteLength.toString() }
  })
}
