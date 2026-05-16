export async function checkCompatibility(idea, components) {
  const componentList = components.map(function(c) {
    return c.name + ' (' + c.category + ')'
  }).join(', ')

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const prompt = [
    'You are an expert electronics compatibility engineer.',
    'Check component compatibility for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Reply ONLY with valid JSON with exactly these keys:',
    'overallCompatibility (string: Compatible, Minor Issues, Major Issues, or Incompatible),',
    'compatibilityScore (number 0-100),',
    'summary (string, 2 sentences),',
    'pairs (array of objects with: comp1, comp2, status, issue, fix),',
    'voltageIssues (array of objects with: component, expected, actual, risk, fix),',
    'protocolConflicts (array of objects with: protocol, components, conflict, fix),',
    'pinConflicts (array of objects with: pin, components, conflict, fix),',
    'powerBudget (object with: totalRequired, available, status, recommendation),',
    'recommendations (array of strings)',
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