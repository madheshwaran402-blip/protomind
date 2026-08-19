cat > src/services/greenAdvisorService.js << 'ENDOFFILE'
export async function fetchGreenAdvice(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const componentList = components.map(function(c) { return c.name + ' (' + c.category + ')' }).join(', ')

  const prompt = [
    'You are a sustainable electronics engineer.',
    'Give green design advice for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Reply ONLY with valid JSON with exactly these keys:',
    'greenScore (number 0-100),',
    'powerConsumption (object with: active string, sleep string, daily string),',
    'energySources (array of objects with: source, feasibility, output, pros, cons),',
    'optimizations (array of objects with: title, description, saving, difficulty),',
    'ecoMaterials (array of objects with: component, eco string, standard string),',
    'carbonFootprint (string)',
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

export function saveGreenAdvice(idea, result) {
  try {
    const key = 'protomind_green'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    all[idea] = { result, savedAt: new Date().toISOString() }
    localStorage.setItem(key, JSON.stringify(all))
  } catch {}
}

export function getSavedGreenAdvice(idea) {
  try {
    const key = 'protomind_green'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.result || null
  } catch {
    return null
  }
}
ENDOFFILE
echo "greenAdvisorService.js fixed!"