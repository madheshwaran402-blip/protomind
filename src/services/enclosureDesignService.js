export async function designEnclosure(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const componentList = components.map(function(c) { return c.name + ' (' + c.category + ')' }).join(', ')
  const prompt = [
    'You are a product enclosure and mechanical design engineer.',
    'Design the enclosure for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Reply ONLY with valid JSON with exactly these keys:',
    'recommendedEnclosure (object with: type, material, dimensions, ipRating, color),',
    'designFeatures (array of objects with: feature, description, importance),',
    'cuttingOuts (array of objects with: component, cutoutType, size, location),',
    'manufacturingOptions (array of objects with: method, cost, leadTime, bestFor),',
    'printableSTLNotes (string)'
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

export function saveEnclosureDesign(idea, result) {
  try {
    const raw = localStorage.getItem('protomind_enclosure')
    const all = raw ? JSON.parse(raw) : {}
    all[idea] = { result, savedAt: new Date().toISOString() }
    localStorage.setItem('protomind_enclosure', JSON.stringify(all))
  } catch {}
}

export function getEnclosureDesign(idea) {
  try {
    const raw = localStorage.getItem('protomind_enclosure')
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.result || null
  } catch { return null }
}
