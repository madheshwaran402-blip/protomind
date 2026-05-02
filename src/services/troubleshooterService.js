export async function diagnoseProblem(problem, components, symptoms) {
  const componentList = components.map(c => c.name + ' (' + c.category + ')').join(', ')

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: 'You are an expert electronics troubleshooter. Diagnose this prototype problem and provide fixes.\n\nPrototype components: ' + componentList + '\nProblem description: "' + problem + '"\nSymptoms: ' + (symptoms || 'not specified') + '\n\nReply ONLY with this exact JSON:\n\n{"severity": "Medium", "summary": "One sentence diagnosis", "causes": [{"id": 1, "title": "Missing pull-up resistor", "likelihood": 85, "explanation": "The I2C bus requires 4.7kΩ pull-up resistors on SDA and SCL lines", "category": "Wiring"}, {"id": 2, "title": "Wrong I2C address", "likelihood": 60, "explanation": "The default address may have changed via address pins", "category": "Software"}], "fixes": [{"step": 1, "title": "Check power connections", "detail": "Verify VCC and GND are connected correctly with a multimeter", "tool": "Multimeter", "time": "2 minutes"}, {"step": 2, "title": "Add pull-up resistors", "detail": "Place 4.7kΩ resistors between SDA/SCL and 3.3V", "tool": "Resistors", "time": "5 minutes"}], "preventionTips": ["Always add decoupling capacitors", "Double-check polarity before powering on"], "relatedComponents": ["Pull-up resistors", "Level shifter"], "estimatedFixTime": "15-30 minutes", "difficulty": "Easy"}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}