export async function generateInvestorPitch(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const componentList = components.map(function(c) { return c.name }).join(', ')
  const prompt = [
    'You are a startup pitch expert for hardware companies.',
    'Create investor pitch data for this electronics prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Reply ONLY with valid JSON with exactly these keys:',
    'companyName (string),',
    'tagline (string),',
    'problem (string),',
    'solution (string),',
    'marketSize (string),',
    'businessModel (string),',
    'traction (array of strings),',
    'financials (object with: unitCost string, sellingPrice string, margin string, breakEven string),',
    'askAmount (string),',
    'useOfFunds (array of objects with: category, percentage, description),',
    'teamRoles (array of strings),',
    'exitStrategy (string)',
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

export function saveInvestorPitch(idea, result) {
  try {
    const key = 'protomind_investor'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    all[idea] = { result, savedAt: new Date().toISOString() }
    localStorage.setItem(key, JSON.stringify(all))
  } catch {}
}

export function getInvestorPitch(idea) {
  try {
    const key = 'protomind_investor'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.result || null
  } catch { return null }
}
