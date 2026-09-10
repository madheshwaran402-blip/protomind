export async function validateProductName(idea, components, name) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const prompt = [
    'You are a brand naming expert.',
    'Validate this product name for a hardware prototype.',
    'Prototype: ' + idea,
    'Proposed Name: ' + name,
    'Reply ONLY with valid JSON with exactly these keys:',
    'score (number 0-100),',
    'memorability (object with: score number, feedback string),',
    'pronouncability (object with: score number, feedback string),',
    'uniqueness (object with: score number, feedback string),',
    'relevance (object with: score number, feedback string),',
    'issues (array of strings),',
    'improvements (array of strings),',
    'verdict (string: Excellent, Good, Fair, Poor)',
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

export function saveValidation(idea, name, result) {
  try {
    const key = 'protomind_name_validation'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    if (!all[idea]) all[idea] = []
    all[idea] = [{ name, result, validatedAt: new Date().toISOString() }].concat(all[idea]).slice(0, 10)
    localStorage.setItem(key, JSON.stringify(all))
  } catch {}
}

export function getValidationHistory(idea) {
  try {
    const key = 'protomind_name_validation'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    return all[idea] || []
  } catch { return [] }
}
