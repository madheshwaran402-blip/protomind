export async function comparePrototypes(proto1, proto2, useCase) {
  const list1 = (proto1.components || []).map(c => c.name + ' (' + c.category + ')').join(', ')
  const list2 = (proto2.components || []).map(c => c.name + ' (' + c.category + ')').join(', ')

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: 'You are an expert electronics engineer. Compare these two prototypes.\n\nPrototype A: "' + proto1.idea + '"\nComponents A: ' + list1 + '\n\nPrototype B: "' + proto2.idea + '"\nComponents B: ' + list2 + '\n\nUse case to optimise for: "' + (useCase || 'general purpose') + '"\n\nReply ONLY with this exact JSON:\n\n{"winner": "A", "confidence": 82, "verdict": "Prototype A is better suited for this use case", "reasoning": "2-3 sentences explaining the recommendation", "scores": {"A": {"complexity": 65, "cost": 78, "power": 80, "scalability": 70, "beginner_friendly": 85}, "B": {"complexity": 72, "cost": 65, "power": 75, "scalability": 80, "beginner_friendly": 70}}, "categoryWinners": {"complexity": "B", "cost": "A", "power": "A", "scalability": "B", "beginner_friendly": "A"}, "sharedComponents": ["Arduino Nano"], "uniqueToA": ["DHT22 Sensor"], "uniqueToB": ["ESP32"], "recommendation": "Choose Prototype A if you prioritise ease of build. Choose Prototype B if you need WiFi connectivity."}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}