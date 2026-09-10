export async function buildOnboardingFlow(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const componentList = components.map(function(c) { return c.name }).join(', ')
  const prompt = [
    'You are a UX designer specialising in hardware product onboarding.',
    'Build a user onboarding flow for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Reply ONLY with valid JSON with exactly these keys:',
    'steps (array of objects with: step, title, description, userAction, successIndicator, commonMistake)',
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

export function saveOnboardingFlow(idea, result) {
  try {
    const raw = localStorage.getItem('protomind_onboarding')
    const all = raw ? JSON.parse(raw) : {}
    all[idea] = { result, savedAt: new Date().toISOString() }
    localStorage.setItem('protomind_onboarding', JSON.stringify(all))
  } catch {}
}

export function getOnboardingFlow(idea) {
  try {
    const raw = localStorage.getItem('protomind_onboarding')
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.result || null
  } catch { return null }
}
