export async function assessRisks(idea, components) {
  const componentList = components.map(function(c) {
    return c.name + ' (' + c.category + ')'
  }).join(', ')

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const prompt = [
    'You are an expert electronics safety and risk assessment engineer.',
    'Perform a comprehensive risk assessment for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Reply ONLY with valid JSON with exactly these keys:',
    'overallRiskLevel (string: Low, Medium, High, or Critical),',
    'riskScore (number 0-100, higher means more risky),',
    'summary (string, 2 sentences),',
    'risks (array of objects with: id, category, title, description, severity, likelihood, impact, mitigation, status),',
    'categories (object with counts: technical, safety, regulatory, financial, schedule),',
    'recommendations (array of strings),',
    'testingRequired (array of strings),',
    'complianceChecks (array of objects with: standard, required, description)',
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