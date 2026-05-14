export async function runSimulation(idea, components, scenario) {
  const componentList = components.map(function(c) {
    return c.name + ' (' + c.category + ')'
  }).join(', ')

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const prompt = [
    'You are an expert electronics engineer simulating a prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Test scenario: ' + (scenario || 'Normal operation'),
    'Simulate running this prototype and report results.',
    'Reply ONLY with valid JSON with exactly these keys:',
    'scenarioName (string),',
    'overallResult (string: Pass or Fail or Warning),',
    'summary (string, 2 sentences),',
    'timeline (array of objects with: time, event, component, status, value),',
    'inputs (array of objects with: name, value, unit, description),',
    'outputs (array of objects with: name, value, unit, description, status),',
    'warnings (array of strings),',
    'failures (array of objects with: component, issue, severity, fix),',
    'edgeCases (array of strings),',
    'passRate (number 0-100)',
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