export async function buildFeedbackForm(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const componentList = components.map(function(c) { return c.name }).join(', ')
  const prompt = [
    'You are a UX researcher creating feedback forms for hardware products.',
    'Build a user feedback form for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Reply ONLY with valid JSON with exactly these keys:',
    'formTitle (string),',
    'description (string),',
    'questions (array of objects with: id, type, question, options array, required boolean)',
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

export function saveFeedbackForm(idea, result) {
  try {
    const raw = localStorage.getItem('protomind_feedback_form')
    const all = raw ? JSON.parse(raw) : {}
    all[idea] = { result, savedAt: new Date().toISOString() }
    localStorage.setItem('protomind_feedback_form', JSON.stringify(all))
  } catch {}
}

export function getFeedbackForm(idea) {
  try {
    const raw = localStorage.getItem('protomind_feedback_form')
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.result || null
  } catch { return null }
}

export function saveFeedbackResponse(idea, response) {
  try {
    const key = 'protomind_feedback_responses'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    if (!all[idea]) all[idea] = []
    all[idea].push(Object.assign({}, response, { submittedAt: new Date().toISOString() }))
    localStorage.setItem(key, JSON.stringify(all))
  } catch {}
}

export function getFeedbackResponses(idea) {
  try {
    const key = 'protomind_feedback_responses'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    return all[idea] || []
  } catch { return [] }
}
