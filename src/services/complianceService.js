export async function checkCompliance(idea, components, region) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const componentList = components.map(function(c) { return c.name + ' (' + c.category + ')' }).join(', ')

  const prompt = [
    'You are a regulatory compliance expert for electronics.',
    'Check compliance requirements for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Target region: ' + (region || 'Global'),
    'Reply ONLY with valid JSON with exactly these keys:',
    'overallCompliance (string: Compliant, Needs Review, Non-Compliant),',
    'certifications (array of objects with: name, required boolean, description, cost, timeframe),',
    'standards (array of objects with: standard, category, applicable boolean, requirement),',
    'risks (array of strings),',
    'nextSteps (array of strings)'
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

export function saveCompliance(idea, result) {
  try {
    const key = 'protomind_compliance'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    all[idea] = { result, savedAt: new Date().toISOString() }
    localStorage.setItem(key, JSON.stringify(all))
  } catch {}
}

export function getCompliance(idea) {
  try {
    const key = 'protomind_compliance'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.result || null
  } catch {
    return null
  }
}

export const REGIONS = ['Global', 'USA', 'EU', 'UK', 'India', 'China', 'Australia', 'Canada']