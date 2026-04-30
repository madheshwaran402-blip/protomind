export async function analyseComplexity(idea, components) {
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
      prompt: 'You are an expert electronics design reviewer. Analyse this prototype and give it a health score.\n\nPrototype: "' + idea + '"\nComponents: ' + componentList + '\n\nReply ONLY with this exact JSON:\n\n{"overallScore": 78, "grade": "B", "summary": "A solid prototype with good component choices but some areas need attention", "dimensions": [{"id": "power", "name": "Power Design", "score": 85, "status": "Good", "icon": "⚡", "findings": ["Adequate power supply components", "Missing decoupling capacitors"], "recommendations": ["Add 100nF ceramic caps near each IC"]}, {"id": "signal", "name": "Signal Integrity", "score": 70, "status": "Fair", "icon": "📡", "findings": ["I2C lines present", "No pull-up resistors specified"], "recommendations": ["Add 4.7kΩ pull-up resistors on SDA and SCL"]}, {"id": "thermal", "name": "Thermal Management", "score": 80, "status": "Good", "icon": "🌡️", "findings": ["Low power components used", "No high heat sources"], "recommendations": ["Monitor junction temperatures under load"]}, {"id": "reliability", "name": "Component Reliability", "score": 75, "status": "Fair", "icon": "🛡️", "findings": ["Quality components selected", "No ESD protection"], "recommendations": ["Add TVS diode on input power line"]}, {"id": "buildability", "name": "Buildability", "score": 82, "status": "Good", "icon": "🔧", "findings": ["Through-hole components — easy to solder", "Standard footprints"], "recommendations": ["Use breadboard first before soldering to PCB"]}], "criticalIssues": ["Missing pull-up resistors on I2C bus"], "quickFixes": ["Add decoupling capacitors", "Add status LED for debugging"], "estimatedDebugTime": "2-4 hours"}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}