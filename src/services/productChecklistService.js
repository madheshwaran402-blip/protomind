export async function generateProductChecklist(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const componentList = components.map(function(c) { return c.name }).join(', ')
  const prompt = [
    'You are a hardware product launch expert.',
    'Create a prototype-to-product readiness checklist for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Reply ONLY with valid JSON with exactly these keys:',
    'readinessScore (number 0-100),',
    'categories (array of objects with: name, icon, items array of objects with: task, critical boolean, done boolean, notes)',
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

export function saveChecklist(idea, result, checked) {
  try {
    const raw = localStorage.getItem('protomind_product_checklist')
    const all = raw ? JSON.parse(raw) : {}
    all[idea] = { result, checked: checked || {}, savedAt: new Date().toISOString() }
    localStorage.setItem('protomind_product_checklist', JSON.stringify(all))
  } catch {}
}

export function getChecklist(idea) {
  try {
    const raw = localStorage.getItem('protomind_product_checklist')
    const all = raw ? JSON.parse(raw) : {}
    return all[idea] || null
  } catch { return null }
}
