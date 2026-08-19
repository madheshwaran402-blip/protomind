export async function generateNames(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const componentList = components.map(function(c) { return c.name }).join(', ')

  const prompt = [
    'You are a product naming expert.',
    'Generate creative names for this electronics prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Reply ONLY with valid JSON with exactly these keys:',
    'names (array of 10 objects with: name, tagline, style, reasoning, domain boolean, score)',
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

export function saveFavoriteNames(idea, names) {
  try {
    const key = 'protomind_names'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    all[idea] = { names, savedAt: new Date().toISOString() }
    localStorage.setItem(key, JSON.stringify(all))
  } catch {}
}

export function getFavoriteNames(idea) {
  try {
    const key = 'protomind_names'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.names || null
  } catch {
    return null
  }
}