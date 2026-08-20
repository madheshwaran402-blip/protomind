export async function troubleshootProblem(idea, components, problem) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const componentList = components.map(function(c) { return c.name + ' (' + c.category + ')' }).join(', ')

  const prompt = [
    'You are an expert electronics troubleshooter.',
    'Diagnose and fix this problem.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Problem: ' + problem,
    'Reply ONLY with valid JSON with exactly these keys:',
    'diagnosis (string),',
    'rootCauses (array of objects with: cause, probability, explanation),',
    'steps (array of objects with: step, action, tool, expected),',
    'quickFixes (array of strings),',
    'preventionTips (array of strings)',
  ].join('\n')

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}

export const COMMON_PROBLEMS = [
  'My circuit is not powering on',
  'Sensor gives wrong or unstable readings',
  'Motor not rotating or making noise',
  'I2C device not found on address scan',
  'Arduino resets randomly during operation',
  'Bluetooth/WiFi not connecting',
  'Display showing garbage characters',
  'Components getting too hot',
  'Code uploads but device does nothing',
  'Battery drains too quickly',
]

export function saveTroubleshootHistory(idea, session) {
  try {
    const key = 'protomind_troubleshoot'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    if (!all[idea]) all[idea] = []
    all[idea].unshift(Object.assign({}, session, { timestamp: new Date().toISOString() }))
    all[idea] = all[idea].slice(0, 10)
    localStorage.setItem(key, JSON.stringify(all))
  } catch {}
}

export function getTroubleshootHistory(idea) {
  try {
    const key = 'protomind_troubleshoot'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    return all[idea] || []
  } catch {
    return []
  }
}
