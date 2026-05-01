export async function getComponentRecommendations(description, constraints) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const constraintText = [
    constraints.budget ? 'Budget: $' + constraints.budget : '',
    constraints.level ? 'Skill level: ' + constraints.level : '',
    constraints.power ? 'Power: ' + constraints.power : '',
    constraints.connectivity ? 'Connectivity: ' + constraints.connectivity : '',
  ].filter(Boolean).join(', ')

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: 'You are an expert electronics component advisor. Recommend the best components for this project.\n\nProject description: "' + description + '"\nConstraints: ' + (constraintText || 'none') + '\n\nReply ONLY with this exact JSON:\n\n{"summary": "One sentence about the recommended stack", "recommendations": [{"rank": 1, "name": "Arduino Nano", "category": "Microcontroller", "icon": "🔵", "reason": "Why this component is recommended", "pros": ["Easy to use", "Widely available"], "cons": ["Limited processing power"], "alternatives": [{"name": "ESP32", "reason": "If WiFi needed"}, {"name": "Raspberry Pi Pico", "reason": "If more GPIO needed"}], "estimatedPrice": "$5-15", "difficulty": "Beginner", "amazonSearch": "Arduino Nano V3", "compatibility": 95}], "estimatedTotalCost": "$25-60", "buildDifficulty": "Intermediate", "estimatedBuildTime": "4-8 hours", "keyConsiderations": ["Power supply requirements", "I2C pull-up resistors needed"], "notRecommended": [{"name": "Raspberry Pi 4", "reason": "Overkill for this application"}]}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}