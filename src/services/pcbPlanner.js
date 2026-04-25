export async function generatePCBLayout(idea, components) {
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
      prompt: 'You are an expert PCB designer. Create a PCB layout plan for this prototype.\n\nIdea: "' + idea + '"\nComponents: ' + componentList + '\n\nReply ONLY with this exact JSON:\n\n{"boardSize": {"width": 80, "height": 60, "unit": "mm"}, "layers": 2, "placement": [{"component": "Arduino Nano", "zone": "center", "x": 40, "y": 30, "rotation": 0, "notes": "Place in center for easy access to all pins"}], "traces": [{"from": "Arduino D2", "to": "DHT22 DATA", "width": "0.3mm", "layer": "top", "notes": "Signal trace"}], "powerPlane": {"positive": "VCC 5V plane on bottom layer", "ground": "GND pour on top layer"}, "designRules": ["Keep high frequency traces short", "Add decoupling caps near IC power pins", "Keep analog and digital sections separate"], "estimatedCost": {"pcbFab": "$5-15 for 5 boards at JLCPCB", "assembly": "DIY soldering or $20-50 at PCB assembly service"}, "boardShape": "rectangular", "mountingHoles": 4, "connectors": [{"type": "USB-B", "position": "edge", "purpose": "Power and programming"}]}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}