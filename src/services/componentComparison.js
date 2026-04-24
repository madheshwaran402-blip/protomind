export async function compareComponents(comp1, comp2, idea) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: 'You are an expert electronics engineer. Compare these two components for a prototype.\n\nPrototype idea: "' + idea + '"\nComponent 1: ' + comp1.name + ' (' + comp1.category + ')\nComponent 2: ' + comp2.name + ' (' + comp2.category + ')\n\nReply ONLY with this exact JSON:\n\n{"component1": {"name": "' + comp1.name + '", "pros": ["Easy to use", "Widely available"], "cons": ["Higher power consumption", "More expensive"], "bestFor": "Beginners and rapid prototyping", "voltage": "5V", "current": "50mA", "price": "$5-15", "difficulty": "Beginner", "score": 78}, "component2": {"name": "' + comp2.name + '", "pros": ["Low power", "Cheaper"], "cons": ["Harder to program", "Less documentation"], "bestFor": "Battery powered projects", "voltage": "3.3V", "current": "10mA", "price": "$2-8", "difficulty": "Intermediate", "score": 82}, "recommendation": "' + comp2.name + '", "reason": "One sentence explaining the recommendation", "comparisonSummary": "One sentence summarizing key differences", "winnerCategory": {"performance": 1, "power": 2, "price": 2, "ease": 1, "availability": 1}}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}