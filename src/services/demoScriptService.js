export async function generateDemoScript(idea, components, audience) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const componentList = components.map(function(c) { return c.name }).join(', ')
  const prompt = [
    'You are a product demo expert.',
    'Write a live demo script for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Audience: ' + (audience || 'Investors'),
    'Reply ONLY with valid JSON with exactly these keys:',
    'title (string),',
    'duration (string),',
    'setup (array of strings),',
    'scenes (array of objects with: scene, duration, script, action, tip)',
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

export function saveDemoScript(idea, audience, result) {
  try {
    const raw = localStorage.getItem('protomind_demo_script')
    const all = raw ? JSON.parse(raw) : {}
    if (!all[idea]) all[idea] = {}
    all[idea][audience] = { result, savedAt: new Date().toISOString() }
    localStorage.setItem('protomind_demo_script', JSON.stringify(all))
  } catch {}
}

export function getDemoScript(idea, audience) {
  try {
    const raw = localStorage.getItem('protomind_demo_script')
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.[audience]?.result || null
  } catch { return null }
}

export const AUDIENCES = ['Investors', 'Customers', 'Conference', 'Press', 'Judges', 'Technical Team']
