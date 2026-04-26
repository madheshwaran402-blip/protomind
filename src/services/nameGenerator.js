export async function generatePrototypeName(idea, components) {
  const componentList = components.map(c => c.name).join(', ')

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: 'You are a creative product branding expert. Create a complete branding kit for this electronics prototype.\n\nPrototype idea: "' + idea + '"\nComponents: ' + componentList + '\n\nReply ONLY with this exact JSON:\n\n{"names": [{"name": "NovaSense", "style": "Tech", "meaning": "Nova means new, Sense refers to sensing capabilities", "score": 92}, {"name": "PulseTrack", "style": "Action", "meaning": "Pulse references heartbeat, Track means monitoring", "score": 88}], "taglines": ["Sense the future", "Always in tune with you", "Smart living, simplified"], "elevator pitch": "A 2 sentence pitch for investors", "targetAudience": "Health-conscious tech enthusiasts aged 25-45", "productCategory": "Consumer Electronics", "marketSize": "Growing $50B wearables market", "colors": [{"name": "Deep Indigo", "hex": "#4f46e5", "use": "Primary brand color"}, {"name": "Electric Blue", "hex": "#0ea5e9", "use": "Accent color"}, {"name": "Pure White", "hex": "#ffffff", "use": "Background"}], "logoIdea": "A circular icon combining a heartbeat wave with a WiFi signal, representing health and connectivity", "competitorApps": ["Fitbit", "Apple Health", "Samsung Health"], "uniqueSellingPoint": "One sentence about what makes this prototype unique"}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}