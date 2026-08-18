export async function generateChallenges(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const componentList = components.map(function(c) { return c.name }).join(', ')

  const prompt = [
    'You are a maker community challenge designer.',
    'Generate fun upgrade challenges for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Reply ONLY with valid JSON with exactly these keys:',
    'challenges (array of 6 objects with: id, title, description, difficulty, xp, timeEstimate, skills array, hint, badge)',
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

const CHALLENGE_KEY = 'protomind_challenges'

export function getChallengeProgress(idea) {
  try {
    const raw = localStorage.getItem(CHALLENGE_KEY)
    const all = raw ? JSON.parse(raw) : {}
    return all[idea] || { challenges: null, completed: {} }
  } catch {
    return { challenges: null, completed: {} }
  }
}

export function saveChallengeProgress(idea, data) {
  try {
    const raw = localStorage.getItem(CHALLENGE_KEY)
    const all = raw ? JSON.parse(raw) : {}
    all[idea] = data
    localStorage.setItem(CHALLENGE_KEY, JSON.stringify(all))
  } catch {}
}