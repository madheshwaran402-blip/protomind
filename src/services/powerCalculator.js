export async function calculatePowerConsumption(idea, components) {
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
      prompt: 'You are an expert electronics engineer. Calculate power consumption for this prototype:\n\nIdea: "' + idea + '"\nComponents: ' + componentList + '\n\nReply ONLY with this exact JSON, no explanation:\n\n{"totalCurrentMa": 450, "totalPowerMw": 1650, "operatingVoltage": 3.3, "components": [{"name": "Arduino Nano", "currentMa": 20, "voltagev": 5, "powerMw": 100, "mode": "active"}], "batteryLife": [{"batteryMah": 1000, "lifeHours": 2.2, "lifeLabel": "1000mAh LiPo"}, {"batteryMah": 2000, "lifeHours": 4.4, "lifeLabel": "2000mAh LiPo"}, {"batteryMah": 5000, "lifeHours": 11, "lifeLabel": "5000mAh Power Bank"}], "powerSupplyNeeded": "5V 1A USB adapter", "warnings": ["High current draw detected", "Consider sleep modes"], "efficiency": "Medium", "verdict": "one sentence power summary"}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}