export async function generateSafetyChecklist(idea, components) {
  const componentList = components.map(c =>
    c.name + ' (' + c.category + ')'
  ).join(', ')

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: 'You are an expert electronics safety engineer. Generate a safety checklist for this prototype:\n\nIdea: "' + idea + '"\nComponents: ' + componentList + '\n\nReply ONLY with this exact JSON:\n\n{"overallRisk": "Low", "riskScore": 2, "checks": [{"id": 1, "category": "Power", "title": "Check polarity before connecting", "description": "Verify positive and negative terminals are correct", "severity": "Critical", "done": false}, {"id": 2, "category": "Heat", "title": "Ensure adequate ventilation", "description": "Keep components 2cm apart for airflow", "severity": "Warning", "done": false}], "beforePowerOn": ["Check all connections twice", "Verify voltage levels"], "commonMistakes": ["Reversing power polarity", "Skipping pull-up resistors"], "verdict": "one sentence safety summary"}\n\noverallRisk must be: Low, Medium, High, or Critical\nriskScore: 1=Low, 2=Medium, 3=High, 4=Critical\nseverity must be: Critical, Warning, or Info\nProvide 6-10 safety checks covering power, heat, connections, programming, and handling.',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}