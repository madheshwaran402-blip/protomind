export async function designBatterySystem(idea, components, requirements) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const componentList = components.map(function(c) { return c.name + ' (' + c.category + ')' }).join(', ')
  const prompt = [
    'You are a battery management system expert.',
    'Design a battery system for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Target runtime: ' + (requirements.runtime || '8 hours'),
    'Form factor: ' + (requirements.formFactor || 'portable'),
    'Reply ONLY with valid JSON with exactly these keys:',
    'recommendedBattery (object with: type, capacity, voltage, chemistry, size),',
    'chargingSystem (object with: chargerIC, chargeTime, chargingVoltage, protectionFeatures array),',
    'powerManagement (array of objects with: technique, description, saving),',
    'safetyFeatures (array of strings),',
    'estimatedRuntime (object with: normal string, powerSave string, worstCase string),',
    'schematic (string)',
  ].join('\n')
  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false }),
  })
  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}

export function saveBatteryDesign(idea, result) {
  try {
    const key = 'protomind_battery'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    all[idea] = { result, savedAt: new Date().toISOString() }
    localStorage.setItem(key, JSON.stringify(all))
  } catch {}
}

export function getBatteryDesign(idea) {
  try {
    const key = 'protomind_battery'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.result || null
  } catch { return null }
}
