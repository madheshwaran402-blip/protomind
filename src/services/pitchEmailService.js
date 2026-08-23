export async function generatePitchEmail(idea, components, target) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const componentList = components.map(function(c) { return c.name }).join(', ')
  const prompt = [
    'You are an expert pitch writer for hardware startups.',
    'Write a pitch email for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Target audience: ' + (target || 'Investor'),
    'Reply ONLY with valid JSON with exactly these keys:',
    'subject (string),',
    'greeting (string),',
    'hook (string, opening sentence),',
    'problem (string),',
    'solution (string),',
    'traction (string),',
    'ask (string),',
    'cta (string, call to action)',
  ].join("\n")
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

export function savePitchEmail(idea, target, result) {
  try {
    const raw = localStorage.getItem('protomind_pitch_email')
    const all = raw ? JSON.parse(raw) : {}
    if (!all[idea]) all[idea] = {}
    all[idea][target] = { result, savedAt: new Date().toISOString() }
    localStorage.setItem('protomind_pitch_email', JSON.stringify(all))
  } catch {}
}

export function getPitchEmail(idea, target) {
  try {
    const raw = localStorage.getItem('protomind_pitch_email')
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.[target]?.result || null
  } catch { return null }
}

export const EMAIL_TARGETS = [
  { value: 'Investor', icon: '💼', desc: 'Angel or VC investor' },
  { value: 'Accelerator', icon: '🚀', desc: 'YC, Techstars etc.' },
  { value: 'Manufacturer', icon: '🏭', desc: 'Contract manufacturer' },
  { value: 'Distributor', icon: '📦', desc: 'Retail distributor' },
  { value: 'Partner', icon: '🤝', desc: 'Strategic partner' },
  { value: 'Press', icon: '📰', desc: 'Tech journalist' },
]
