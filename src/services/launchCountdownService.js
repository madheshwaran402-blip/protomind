export async function buildLaunchCountdown(idea, components, launchDate) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const componentList = components.map(function(c) { return c.name }).join(', ')
  const daysUntilLaunch = launchDate ? Math.ceil((new Date(launchDate) - new Date()) / (1000 * 60 * 60 * 24)) : 30
  const prompt = [
    'You are a hardware product launch expert.',
    'Build a launch countdown plan for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Days until launch: ' + daysUntilLaunch,
    'Reply ONLY with valid JSON with exactly these keys:',
    'milestones (array of objects with: daysBeforeLaunch, title, tasks array, owner)',
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

export function saveLaunchPlan(idea, result, launchDate) {
  try {
    const raw = localStorage.getItem('protomind_launch_plan')
    const all = raw ? JSON.parse(raw) : {}
    all[idea] = { result, launchDate, savedAt: new Date().toISOString() }
    localStorage.setItem('protomind_launch_plan', JSON.stringify(all))
  } catch {}
}

export function getLaunchPlan(idea) {
  try {
    const raw = localStorage.getItem('protomind_launch_plan')
    const all = raw ? JSON.parse(raw) : {}
    return all[idea] || null
  } catch { return null }
}
