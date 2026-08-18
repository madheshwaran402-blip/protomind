export async function analyzeComponentHealth(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const componentList = components.map(function(c) { return c.name + ' (' + c.category + ')' }).join(', ')

  const prompt = [
    'You are an electronics reliability engineer.',
    'Analyse the health and lifespan of components in this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Reply ONLY with valid JSON with exactly these keys:',
    'overallHealth (number 0-100),',
    'components (array of objects with: name, healthScore, lifespan, failureMode, maintenanceInterval, warningTemperature, tips array),',
    'maintenanceSchedule (array of objects with: task, frequency, importance),',
    'replacementParts (array of objects with: component, whenToReplace, estimatedCost)',
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

export function saveHealthData(idea, result) {
  try {
    const key = 'protomind_health'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    all[idea] = { result, savedAt: new Date().toISOString() }
    localStorage.setItem(key, JSON.stringify(all))
  } catch {}
}

export function getHealthData(idea) {
  try {
    const key = 'protomind_health'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.result || null
  } catch {
    return null
  }
}