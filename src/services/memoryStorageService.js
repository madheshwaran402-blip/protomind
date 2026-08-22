export async function planMemoryStorage(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const componentList = components.map(function(c) { return c.name + ' (' + c.category + ')' }).join(', ')
  const prompt = [
    'You are an embedded systems memory architect.',
    'Plan memory and storage for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Reply ONLY with valid JSON with exactly these keys:',
    'ramAnalysis (object with: total string, usage array of objects with: section, size, description),',
    'flashAnalysis (object with: total string, usage array of objects with: section, size, description),',
    'storageOptions (array of objects with: type, capacity, interface, readSpeed, writeSpeed, bestFor),',
    'optimizationTips (array of strings)',
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

export function saveMemoryPlan(idea, result) {
  try {
    const raw = localStorage.getItem('protomind_memory')
    const all = raw ? JSON.parse(raw) : {}
    all[idea] = { result, savedAt: new Date().toISOString() }
    localStorage.setItem('protomind_memory', JSON.stringify(all))
  } catch {}
}

export function getMemoryPlan(idea) {
  try {
    const raw = localStorage.getItem('protomind_memory')
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.result || null
  } catch { return null }
}
