export async function generateLearningPath(idea, components, skillLevel) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const componentList = components.map(function(c) { return c.name }).join(', ')

  const prompt = [
    'You are an electronics education expert.',
    'Create a personalised learning path for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Skill level: ' + skillLevel,
    'Reply ONLY with valid JSON with exactly these keys:',
    'pathTitle (string),',
    'totalWeeks (number),',
    'phases (array of objects with: phase, title, weeks, topics array of objects with: title, description, resources array of strings, project string, xp)',
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

export function saveLearningPath(idea, result) {
  try {
    const key = 'protomind_learning'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    all[idea] = { result, savedAt: new Date().toISOString() }
    localStorage.setItem(key, JSON.stringify(all))
  } catch {}
}

export function getLearningPath(idea) {
  try {
    const key = 'protomind_learning'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.result || null
  } catch {
    return null
  }
}