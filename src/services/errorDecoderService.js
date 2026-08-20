export async function decodeError(errorMessage, idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const componentList = components.map(function(c) { return c.name }).join(', ')
  const prompt = [
    'You are an expert embedded systems debugger.',
    'Decode this error message for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Error: ' + errorMessage,
    'Reply ONLY with valid JSON with exactly these keys:',
    'errorType (string),',
    'explanation (string),',
    'causes (array of strings),',
    'fixes (array of objects with: fix, code, priority),',
    'preventionTips (array of strings)',
  ].join('\n')
  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false }),
  })
  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}

export const COMMON_ERRORS = [
  'error: expected declaration before',
  'undefined reference to setup',
  'avrdude: stk500_getsync() attempt 1 of 10',
  'fatal error: Wire.h: No such file or directory',
  'Guru Meditation Error: Core 0 panic',
  'ets Jun 8 2016 00:22:57 rst:0x1 (POWERON_RESET)',
  'WIFI_STA connection failed',
  'I2C: No device found at address 0x3C',
]

export function saveDecodedError(errorMsg, result) {
  try {
    const key = 'protomind_errors'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : []
    all.unshift({ errorMsg, result, decodedAt: new Date().toISOString() })
    localStorage.setItem(key, JSON.stringify(all.slice(0, 20)))
  } catch {}
}

export function getErrorHistory() {
  try {
    const raw = localStorage.getItem('protomind_errors')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}
