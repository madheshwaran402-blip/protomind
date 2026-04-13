export async function estimateBuildCost(idea, components) {
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
      prompt: 'You are an expert electronics purchasing advisor. Estimate the build cost for this prototype:\n\nIdea: "' + idea + '"\nComponents: ' + componentList + '\n\nReply ONLY with this exact JSON:\n\n{"components": [{"name": "Arduino Nano", "quantity": 1, "amazon": 12.99, "aliexpress": 3.50, "localStore": 18.00, "notes": "Genuine vs clone available"}], "totals": {"amazon": 45.99, "aliexpress": 18.50, "localStore": 72.00}, "cheapestSupplier": "AliExpress", "fastestSupplier": "Amazon", "recommendation": "one sentence buying advice", "additionalCosts": [{"item": "Soldering iron", "cost": 25, "note": "If you do not have one already"}], "totalWithTools": 70.50, "budgetTip": "one money saving tip", "timeToDeliver": {"amazon": "2-3 days", "aliexpress": "3-6 weeks", "localStore": "Same day"}}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}