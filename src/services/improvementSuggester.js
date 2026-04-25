export async function suggestImprovements(idea, components) {
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
      prompt: 'You are an expert electronics engineer reviewing a prototype. Suggest specific improvements.\n\nPrototype idea: "' + idea + '"\nCurrent components: ' + componentList + '\n\nAnalyse this prototype and suggest improvements. Reply ONLY with this exact JSON:\n\n{"overallScore": 72, "verdict": "Good start with room for improvement", "improvements": [{"id": "imp1", "title": "Add WiFi connectivity", "category": "Feature", "impact": "High", "effort": "Medium", "description": "Adding an ESP8266 or using ESP32 would enable remote monitoring and IoT features", "currentIssue": "No wireless connectivity limits data access", "suggestedComponent": "ESP32 or ESP8266", "estimatedCost": "$3-8", "priority": 1}, {"id": "imp2", "title": "Add power management", "category": "Power", "impact": "Medium", "effort": "Low", "description": "A voltage regulator would protect components from voltage spikes", "currentIssue": "Direct power connection risks component damage", "suggestedComponent": "LM7805 Voltage Regulator", "estimatedCost": "$0.50-2", "priority": 2}], "quickWins": ["Add a status LED", "Include a reset button", "Add pull-up resistors"], "costOptimizations": ["Replace Arduino Uno with Arduino Nano to save $5", "Buy components in bulk from AliExpress"], "performanceUpgrades": ["Upgrade to faster I2C speed", "Use DMA for sensor readings"], "missingEssentials": ["Decoupling capacitors", "ESD protection diode"]}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}