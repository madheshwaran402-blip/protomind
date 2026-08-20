export async function generateSprint(idea, components, duration) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const componentList = components.map(function(c) { return c.name }).join(', ')
  const prompt = [
    'You are an agile project manager for electronics prototyping.',
    'Create a sprint plan for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Sprint duration: ' + (duration || '2 weeks'),
    'Reply ONLY with valid JSON with exactly these keys:',
    'sprintName (string),',
    'goal (string),',
    'days (array of objects with: day, tasks array of objects with: id, title, type, estimate, priority)',
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

const SPRINT_KEY = 'protomind_sprints'

export function saveSprint(idea, result, completed) {
  try {
    const raw = localStorage.getItem(SPRINT_KEY)
    const all = raw ? JSON.parse(raw) : {}
    all[idea] = { result, completed: completed || {}, savedAt: new Date().toISOString() }
    localStorage.setItem(SPRINT_KEY, JSON.stringify(all))
  } catch {}
}

export function getSprint(idea) {
  try {
    const raw = localStorage.getItem(SPRINT_KEY)
    const all = raw ? JSON.parse(raw) : {}
    return all[idea] || null
  } catch { return null }
}
