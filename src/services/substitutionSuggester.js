export async function suggestSubstitutions(idea, components, targetComponent) {
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
      prompt: 'You are an expert electronics engineer. The user wants to replace "' + targetComponent.name + '" (' + targetComponent.category + ') in their prototype.\n\nPrototype idea: "' + idea + '"\nAll components: ' + componentList + '\n\nSuggest 3 alternative components that could replace it. Reply ONLY with this exact JSON:\n\n{"original": {"name": "Arduino Uno", "reason": "why user might want to replace it"}, "substitutes": [{"name": "ESP32 DevKit", "category": "Microcontroller", "compatibility": "High", "priceChange": "cheaper", "estimatedPrice": 8, "pros": ["Built-in WiFi", "Faster processor"], "cons": ["Different pinout", "3.3V logic"], "codeChanges": "Update pin numbers and use 3.3V logic levels", "buyLink": "https://www.amazon.com/s?k=ESP32+DevKit", "verdict": "Best overall substitute"}], "recommendation": "name of best substitute", "verdict": "one sentence overall advice"}\n\ncompatibility must be: High, Medium, or Low\npriceChange must be: cheaper, similar, or expensive\nProvide exactly 3 substitutes.',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}