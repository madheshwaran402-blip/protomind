export async function checkComponentAvailability(components) {
  const componentList = components.map(c => c.name + ' (' + c.category + ')').join(', ')

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: 'You are an expert electronics procurement advisor. Analyse component availability.\n\nComponents: ' + componentList + '\n\nReply ONLY with this exact JSON:\n\n{"overallRisk": "Low", "summary": "Most components are widely available", "components": [{"name": "Arduino Nano", "availability": "High", "risk": "Low", "typicalLeadTime": "1-3 days", "priceStability": "Stable", "alternatives": [{"name": "Arduino Uno", "reason": "Same chip, more pins"}, {"name": "Pro Mini", "reason": "Cheaper, smaller"}], "buyingTip": "Buy from official Arduino store or reputable sellers", "suppliers": ["Amazon", "AliExpress", "Arduino.cc"], "counterfeitRisk": "Low"}, {"name": "ESP8266", "availability": "Medium", "risk": "Medium", "typicalLeadTime": "2-4 weeks", "priceStability": "Variable", "alternatives": [{"name": "ESP32", "reason": "More powerful, similar price"}], "buyingTip": "Buy from AliExpress in bulk to save cost", "suppliers": ["AliExpress", "Mouser"], "counterfeitRisk": "Medium"}], "procurementTips": ["Order 20% extra of passive components", "Check seller ratings before ordering"], "budgetOptimizations": ["Buy resistors and capacitors in kit form", "AliExpress is 60-80% cheaper than Amazon for most components"]}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}