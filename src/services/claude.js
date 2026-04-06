export async function analyseIdea(idea) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: (function() {
  try {
    const s = localStorage.getItem('protomind_settings')
    return s ? JSON.parse(s).aiModel || 'llama3.2' : 'llama3.2'
  } catch { return 'llama3.2' }
})(),
      prompt: 'You are an expert electronics engineer. A user wants to build: "' + idea + '"\n\nSuggest exactly 6 components. Reply ONLY with a JSON array, no markdown, no explanation, no extra text. Just the raw JSON:\n\n[{"id":1,"icon":"🧠","name":"Component Name","category":"Microcontroller","reason":"Why needed for this specific idea","quantity":1}]\n\nCategories must be one of: Microcontroller, Sensor, Display, Communication, Power, Actuator',
      stream: false,
    }),
  })

  if (!response.ok) {
    throw new Error('Ollama not running')
  }

  const data = await response.json()
  const text = data.response
  
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('No JSON found in response')
  
  return JSON.parse(jsonMatch[0])
}

export async function analyse3DPrintingNeed(idea, components) {
  const componentList = components.map(c => c.name + ' (' + c.category + ')').join(', ')

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: (function() {
  try {
    const s = localStorage.getItem('protomind_settings')
    return s ? JSON.parse(s).aiModel || 'llama3.2' : 'llama3.2'
  } catch { return 'llama3.2' }
})(),
      prompt: 'You are an expert hardware engineer. A user wants to build: "' + idea + '". Components: ' + componentList + '.\n\nDecide if this prototype needs a 3D printed enclosure or structural parts.\n\nReply ONLY with this exact JSON, no explanation:\n\n{"needs3DPrinting": true, "reason": "one sentence why", "enclosureType": "wearable|handheld|desktop|wall-mount|open-frame", "dimensions": {"width": 80, "height": 40, "depth": 30}, "features": ["screen_cutout", "button_holes", "port_holes", "ventilation", "mounting_holes"], "advice": "one sentence about the enclosure design"}\n\nIf no 3D printing needed: {"needs3DPrinting": false, "reason": "one sentence why not", "advice": "what to use instead"}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}