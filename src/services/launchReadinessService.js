export async function checkLaunchReadiness(idea, components, options) {
  const componentList = components.map(function(c) {
    return c.name + ' (' + c.category + ')'
  }).join(', ')

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const context = options ? [
    options.hasCode ? 'Code is written' : '',
    options.hasTested ? 'Hardware has been tested' : '',
    options.hasDocs ? 'Documentation exists' : '',
    options.hasEnclosure ? 'Has an enclosure' : '',
  ].filter(Boolean).join(', ') : ''

  const prompt = [
    'You are a senior hardware product launch expert.',
    'Evaluate the launch readiness of this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Current status: ' + (context || 'just designed'),
    'Reply ONLY with valid JSON with exactly these keys:',
    'readinessScore (number 0-100),',
    'verdict (string: Go, No-Go, or Conditional Go),',
    'summary (string, 2 sentences),',
    'categories (array of objects with: name, score, status, items array of objects with: task, done, priority, notes),',
    'blockers (array of strings, things that must be fixed before launch),',
    'niceToHave (array of strings, optional improvements),',
    'estimatedTimeToLaunch (string, e.g. 2-4 weeks),',
    'nextSteps (array of strings, immediate actions to take)',
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