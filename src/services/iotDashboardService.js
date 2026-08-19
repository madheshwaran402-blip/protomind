export async function generateIoTDashboard(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const componentList = components.map(function(c) { return c.name + ' (' + c.category + ')' }).join(', ')

  const prompt = [
    'You are an IoT dashboard designer.',
    'Design a monitoring dashboard for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Reply ONLY with valid JSON with exactly these keys:',
    'dashboardTitle (string),',
    'widgets (array of objects with: id, type, title, dataSource, unit, minValue, maxValue, updateInterval, color, icon)',
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

export function saveDashboard(idea, result) {
  try {
    const key = 'protomind_iot_dashboard'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    all[idea] = { result, savedAt: new Date().toISOString() }
    localStorage.setItem(key, JSON.stringify(all))
  } catch {}
}

export function getDashboard(idea) {
  try {
    const key = 'protomind_iot_dashboard'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.result || null
  } catch {
    return null
  }
}

export function simulateWidgetValue(widget) {
  const min = parseFloat(widget.minValue) || 0
  const max = parseFloat(widget.maxValue) || 100
  return (min + Math.random() * (max - min)).toFixed(1)
}