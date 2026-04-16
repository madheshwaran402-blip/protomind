export async function generateBreadboardLayout(idea, components) {
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
      prompt: 'You are an expert electronics engineer creating a breadboard wiring guide.\n\nIdea: "' + idea + '"\nComponents: ' + componentList + '\n\nCreate a step by step breadboard wiring guide. Reply ONLY with this exact JSON:\n\n{"components": [{"name": "Arduino Nano", "placement": "Rows 1-15, columns E-F (straddles center)", "pins": [{"pin": "5V", "row": 1, "rail": "power+"}, {"pin": "GND", "row": 2, "rail": "power-"}, {"pin": "D2", "row": 5, "col": "E"}]}], "connections": [{"from": "Arduino D2", "to": "DHT22 Data pin", "wire": "yellow", "steps": "Row 5 col E to row 20 col A"}], "powerRails": [{"rail": "+", "voltage": "5V", "source": "Arduino 5V pin"}, {"rail": "-", "voltage": "GND", "source": "Arduino GND pin"}], "tips": ["Always connect power last", "Double check polarity before powering on"], "difficulty": "Beginner", "estimatedTime": "30 minutes"}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}