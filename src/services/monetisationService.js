export async function buildMonetisationStrategy(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const componentList = components.map(function(c) { return c.name }).join(', ')
  const prompt = [
    'You are a hardware startup monetisation strategist.',
    'Build a monetisation strategy for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Reply ONLY with valid JSON with exactly these keys:',
    'primaryModel (string),',
    'revenueStreams (array of objects with: stream, description, potential, effort, timeToRevenue),',
    'pricingStrategy (object with: recommended, rationale, tiers array of objects with: name, price, features array),',
    'gtmStrategy (string)',
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

export function saveMonetisation(idea, result) {
  try {
    const raw = localStorage.getItem('protomind_monetisation')
    const all = raw ? JSON.parse(raw) : {}
    all[idea] = { result, savedAt: new Date().toISOString() }
    localStorage.setItem('protomind_monetisation', JSON.stringify(all))
  } catch {}
}

export function getMonetisation(idea) {
  try {
    const raw = localStorage.getItem('protomind_monetisation')
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.result || null
  } catch { return null }
}
