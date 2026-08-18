export async function getMentorSession(idea, components, question) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const componentList = components.map(function(c) { return c.name }).join(', ')

  const prompt = [
    'You are a world-class electronics mentor teaching a beginner maker.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Student question: ' + question,
    'Reply ONLY with valid JSON with exactly these keys:',
    'answer (string, clear explanation),',
    'analogy (string, a real-world analogy to help understand),',
    'deeepDive (string, more technical detail for curious learners),',
    'commonMistakes (array of strings),',
    'nextTopics (array of strings, what to learn next),',
    'resources (array of objects with: title, type, url)',
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

export const MENTOR_TOPICS = [
  'Explain how I2C communication works in my circuit',
  'What is the difference between analog and digital signals?',
  'How do I choose the right resistor value?',
  'What causes my circuit to heat up?',
  'How does PWM control motor speed?',
  'What is a pull-up resistor and why do I need one?',
  'How do I debug when my sensor gives wrong readings?',
  'What is the purpose of decoupling capacitors?',
]

export function saveMentorHistory(idea, session) {
  try {
    const key = 'protomind_mentor'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    if (!all[idea]) all[idea] = []
    all[idea].unshift({ ...session, timestamp: new Date().toISOString() })
    all[idea] = all[idea].slice(0, 10)
    localStorage.setItem(key, JSON.stringify(all))
  } catch {}
}

export function getMentorHistory(idea) {
  try {
    const key = 'protomind_mentor'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    return all[idea] || []
  } catch {
    return []
  }
}