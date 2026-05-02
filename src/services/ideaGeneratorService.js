export async function generatePrototypeIdeas(category, constraints) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const constraintText = [
    constraints.level ? 'Skill level: ' + constraints.level : '',
    constraints.budget ? 'Budget: under $' + constraints.budget : '',
    constraints.components ? 'Must use: ' + constraints.components : '',
    constraints.purpose ? 'Purpose: ' + constraints.purpose : '',
  ].filter(Boolean).join(', ')

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: 'You are a creative electronics project ideas generator. Generate 10 unique and interesting prototype ideas.\n\nCategory/Theme: "' + category + '"\nConstraints: ' + (constraintText || 'none') + '\n\nReply ONLY with this exact JSON:\n\n{"ideas": [{"id": 1, "title": "Smart Plant Watering System", "description": "A system that monitors soil moisture and automatically waters plants when dry", "difficulty": "Beginner", "estimatedCost": "$20-35", "buildTime": "4-6 hours", "wow_factor": 85, "components": ["Arduino Nano", "Soil Moisture Sensor", "Water Pump", "Relay Module"], "tags": ["IoT", "Agriculture", "Automation"], "uniqueFeature": "Can send phone alerts when water tank is empty", "learningOpportunity": "Learn about analog sensors and relay control"}, {"id": 2, "title": "Bluetooth Speaker with LED Visualizer", "description": "A speaker that shows sound waves as LED animations", "difficulty": "Intermediate", "estimatedCost": "$30-50", "buildTime": "6-10 hours", "wow_factor": 92, "components": ["Arduino Nano", "Bluetooth Module", "LED Strip", "Amplifier"], "tags": ["Audio", "Display", "Bluetooth"], "uniqueFeature": "LEDs pulse in sync with the music beat", "learningOpportunity": "Audio signal processing and FFT basics"}]}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}