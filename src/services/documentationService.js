export async function generateDocumentation(idea, components, docType) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const componentList = components.map(function(c) { return c.name + ' (' + c.category + ')' }).join(', ')
  const prompt = [
    'You are a technical documentation writer.',
    'Write ' + (docType || 'README') + ' documentation for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Reply ONLY with valid JSON with exactly these keys:',
    'title (string),',
    'type (string),',
    'sections (array of objects with: heading, content, code)',
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

export function saveDocumentation(idea, docType, result) {
  try {
    const key = 'protomind_docs'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    if (!all[idea]) all[idea] = {}
    all[idea][docType] = { result, savedAt: new Date().toISOString() }
    localStorage.setItem(key, JSON.stringify(all))
  } catch {}
}

export function getDocumentation(idea, docType) {
  try {
    const key = 'protomind_docs'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.[docType]?.result || null
  } catch { return null }
}

export const DOC_TYPES = [
  { value: 'README', label: '📄 README.md', icon: '📄' },
  { value: 'API Reference', label: '🔌 API Reference', icon: '🔌' },
  { value: 'User Manual', label: '📖 User Manual', icon: '📖' },
  { value: 'Assembly Guide', label: '🔧 Assembly Guide', icon: '🔧' },
  { value: 'Troubleshooting Guide', label: '🔍 Troubleshooting', icon: '🔍' },
]
