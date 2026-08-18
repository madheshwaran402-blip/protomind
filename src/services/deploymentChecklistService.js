export async function generateDeploymentChecklist(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const componentList = components.map(function(c) { return c.name + ' (' + c.category + ')' }).join(', ')

  const prompt = [
    'You are an electronics deployment engineer.',
    'Create a deployment readiness checklist for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Reply ONLY with valid JSON with exactly these keys:',
    'readinessScore (number 0-100, initial guess),',
    'phases (array of objects with: name, icon, items array of objects with: id, text, critical boolean, category)',
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

const DEPLOY_KEY = 'protomind_deployment'

export function saveDeploymentState(idea, data) {
  try {
    const raw = localStorage.getItem(DEPLOY_KEY)
    const all = raw ? JSON.parse(raw) : {}
    all[idea] = data
    localStorage.setItem(DEPLOY_KEY, JSON.stringify(all))
  } catch {}
}

export function getDeploymentState(idea) {
  try {
    const raw = localStorage.getItem(DEPLOY_KEY)
    const all = raw ? JSON.parse(raw) : {}
    return all[idea] || null
  } catch {
    return null
  }
}