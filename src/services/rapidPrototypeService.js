export async function getRapidAdvice(idea, components, timeLimit) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const componentList = components.map(function(c) { return c.name }).join(', ')
  const prompt = [
    'You are a rapid prototyping expert.',
    'Give rapid prototyping advice for this project.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Time available: ' + (timeLimit || '24 hours'),
    'Reply ONLY with valid JSON with exactly these keys:',
    'mvpScope (string),',
    'cutFeatures (array of strings),',
    'phases (array of objects with: phase, duration, tasks array, deliverable),',
    'shortcuts (array of objects with: shortcut, tradeoff),',
    'riskyAssumptions (array of strings)',
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

export function saveRapidAdvice(idea, timeLimit, result) {
  try {
    const raw = localStorage.getItem('protomind_rapid')
    const all = raw ? JSON.parse(raw) : {}
    if (!all[idea]) all[idea] = {}
    all[idea][timeLimit] = { result, savedAt: new Date().toISOString() }
    localStorage.setItem('protomind_rapid', JSON.stringify(all))
  } catch {}
}

export function getRapidSaved(idea, timeLimit) {
  try {
    const raw = localStorage.getItem('protomind_rapid')
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.[timeLimit]?.result || null
  } catch { return null }
}

export const TIME_OPTIONS = ['4 hours', '8 hours', '24 hours', '48 hours', '1 week', '2 weeks']
