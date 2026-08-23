export async function prepareInterview(idea, components, interviewType) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const componentList = components.map(function(c) { return c.name }).join(', ')
  const prompt = [
    'You are an interview coach for hardware startup founders.',
    'Prepare interview answers for this prototype founder.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Interview type: ' + (interviewType || 'Investor'),
    'Reply ONLY with valid JSON with exactly these keys:',
    'questions (array of objects with: question, idealAnswer, keyPoints array, avoid string)',
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

export function saveInterviewPrep(idea, type, result) {
  try {
    const raw = localStorage.getItem('protomind_interview')
    const all = raw ? JSON.parse(raw) : {}
    if (!all[idea]) all[idea] = {}
    all[idea][type] = { result, savedAt: new Date().toISOString() }
    localStorage.setItem('protomind_interview', JSON.stringify(all))
  } catch {}
}

export function getInterviewPrep(idea, type) {
  try {
    const raw = localStorage.getItem('protomind_interview')
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.[type]?.result || null
  } catch { return null }
}

export const INTERVIEW_TYPES = ['Investor', 'Accelerator', 'Technical', 'Customer Discovery', 'Press', 'Demo Day']
