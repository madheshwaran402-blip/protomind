export async function generateDatasheet(component) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const prompt = [
    'You are an electronics datasheet expert.',
    'Generate a complete technical datasheet for: ' + component.name + ' (' + component.category + ')',
    'Reply ONLY with valid JSON with exactly these keys:',
    'name (string),',
    'manufacturer (string),',
    'description (string),',
    'keySpecs (object with: voltage string, current string, frequency string, temperature string, dimensions string),',
    'pinout (array of objects with: pin, name, type, description),',
    'electricalCharacteristics (array of objects with: parameter, min, typical, max, unit),',
    'applicationNotes (array of strings),',
    'absoluteMaximums (array of objects with: parameter, value, unit),',
    'typicalApplication (string)',
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

export function saveDatasheet(componentName, result) {
  try {
    const key = 'protomind_datasheets_gen'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    all[componentName] = { result, savedAt: new Date().toISOString() }
    localStorage.setItem(key, JSON.stringify(all))
  } catch {}
}

export function getSavedDatasheet(componentName) {
  try {
    const key = 'protomind_datasheets_gen'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    return all[componentName]?.result || null
  } catch {
    return null
  }
}