export async function getComponentDatasheet(componentName) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const prompt = [
    'You are an expert electronics engineer with deep knowledge of component datasheets.',
    'Provide a comprehensive quick reference for this component: ' + componentName,
    'Reply ONLY with valid JSON with exactly these keys:',
    'name (string),',
    'fullName (string, full official name),',
    'manufacturer (string),',
    'category (string),',
    'description (string, 2-3 sentences),',
    'keySpecs (array of objects with: parameter, value, notes),',
    'pinout (array of objects with: pin, name, type, description),',
    'operatingConditions (object with: minVoltage, maxVoltage, typVoltage, minTemp, maxTemp, maxCurrent),',
    'interfaces (array of strings),',
    'codeExample (object with: language, code, description),',
    'commonIssues (array of objects with: issue, cause, fix),',
    'alternatives (array of objects with: name, pros, cons),',
    'datasheetUrl (string, best guess URL or empty string),',
    'buyLinks (array of objects with: supplier, searchTerm)',
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

export function saveDatasheet(componentName, data) {
  try {
    const saved = getSavedDatasheets()
    saved[componentName] = { data, savedAt: new Date().toISOString() }
    localStorage.setItem('protomind_datasheets', JSON.stringify(saved))
  } catch {}
}

export function getSavedDatasheets() {
  try {
    const raw = localStorage.getItem('protomind_datasheets')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}