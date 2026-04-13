export async function comparePrototypes(idea, prototypeA, prototypeB) {
  const listA = prototypeA.map(c => c.name + ' (' + c.category + ')').join(', ')
  const listB = prototypeB.map(c => c.name + ' (' + c.category + ')').join(', ')

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: 'You are an expert electronics engineer. Compare these two prototype approaches for the same idea.\n\nIdea: "' + idea + '"\n\nPrototype A components: ' + listA + '\nPrototype B components: ' + listB + '\n\nReply ONLY with this exact JSON:\n\n{"winner": "A", "scores": {"A": {"cost": 7, "complexity": 6, "reliability": 8, "performance": 7, "beginner": 9}, "B": {"cost": 5, "complexity": 8, "reliability": 7, "performance": 9, "beginner": 4}}, "analysis": {"A": {"pros": ["Easier to program", "More community support"], "cons": ["Limited processing power", "No built-in WiFi"], "bestFor": "Beginners and simple projects", "estimatedCost": "$15-25"}, "B": {"pros": ["More powerful", "Built-in connectivity"], "cons": ["Steeper learning curve", "More expensive"], "bestFor": "Advanced users needing connectivity", "estimatedCost": "$25-45"}}, "verdict": "one sentence comparing both", "recommendation": "A"}\n\nScores are 1-10. winner and recommendation must be A or B.',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}