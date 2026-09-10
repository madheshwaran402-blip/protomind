export async function generatePressRelease(idea, components, angle) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const componentList = components.map(function(c) { return c.name }).join(', ')
  const prompt = [
    'You are a PR writer for technology companies.',
    'Write a press release for this hardware prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Angle: ' + (angle || 'Product Launch'),
    'Reply ONLY with valid JSON with exactly these keys:',
    'headline (string),',
    'subheadline (string),',
    'dateline (string),',
    'leadParagraph (string),',
    'bodyParagraphs (array of strings),',
    'quote (object with: text, attribution),',
    'boilerplate (string),',
    'contact (object with: name, email, phone)',
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

export function savePressRelease(idea, angle, result) {
  try {
    const raw = localStorage.getItem('protomind_press')
    const all = raw ? JSON.parse(raw) : {}
    if (!all[idea]) all[idea] = {}
    all[idea][angle] = { result, savedAt: new Date().toISOString() }
    localStorage.setItem('protomind_press', JSON.stringify(all))
  } catch {}
}

export function getPressRelease(idea, angle) {
  try {
    const raw = localStorage.getItem('protomind_press')
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.[angle]?.result || null
  } catch { return null }
}

export const PRESS_ANGLES = ['Product Launch', 'Funding Round', 'Award Win', 'Partnership', 'Milestone', 'Event']
