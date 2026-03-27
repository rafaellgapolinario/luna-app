import { NextRequest, NextResponse } from 'next/server'

const ELEVEN_KEY     = process.env.ELEVENLABS_API_KEY  || ''
const ELEVEN_VOICE   = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  if (!text) return NextResponse.json({ error: 'no text' }, { status: 400 })
  if (!ELEVEN_KEY) return NextResponse.json({ error: 'no key' }, { status: 503 })

  // Limpa markdown
  const clean = text.replace(/[*_`#>\[\]]/g, '').replace(/\n+/g, ' ').trim().slice(0, 800)

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVEN_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text: clean,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.4, use_speaker_boost: true },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: 'elevenlabs failed: ' + err }, { status: 500 })
  }

  const buffer = await res.arrayBuffer()
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.byteLength.toString(),
    },
  })
}
