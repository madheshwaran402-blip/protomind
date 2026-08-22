export async function generateUnitTests(idea, components, code, language) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const componentList = components.map(function(c) { return c.name }).join(', ')
  const prompt = [
    'You are an embedded systems test engineer.',
    'Generate unit tests for this prototype code.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Language: ' + (language || 'Arduino C++'),
    'Code to test:',
    code || '(no code provided - generate generic tests for the components)',
    'Reply ONLY with valid JSON with exactly these keys:',
    'testFramework (string),',
    'tests (array of objects with: name, description, testCode, expectedResult)',
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

export function saveTests(idea, result) {
  try {
    const raw = localStorage.getItem('protomind_tests')
    const all = raw ? JSON.parse(raw) : {}
    all[idea] = { result, savedAt: new Date().toISOString() }
    localStorage.setItem('protomind_tests', JSON.stringify(all))
  } catch {}
}

export function getTests(idea) {
  try {
    const raw = localStorage.getItem('protomind_tests')
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.result || null
  } catch { return null }
}
