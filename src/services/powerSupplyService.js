export async function designPowerSupply(requirements, components) {
  const componentList = components.map(function(c) {
    return c.name + ' (' + c.category + ')'
  }).join(', ')

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const prompt = [
    'You are an expert power electronics engineer.',
    'Design a power supply for this prototype.',
    'Components: ' + componentList,
    'Input voltage: ' + (requirements.inputVoltage || '12V'),
    'Output voltage: ' + (requirements.outputVoltage || '5V'),
    'Max current: ' + (requirements.maxCurrent || '500mA'),
    'Battery powered: ' + (requirements.batteryPowered || false),
    'Reply ONLY with valid JSON with exactly these keys:',
    'design (string, name of recommended solution),',
    'topology (string, e.g. Linear Regulator or Buck Converter),',
    'efficiency (string),',
    'components (array of objects with: name, value, reason),',
    'schematic (string, text description of circuit connections),',
    'calculations (array of objects with: name, formula, result),',
    'warnings (array of strings),',
    'alternatives (array of objects with: name, pros, cons)',
  ].join('\n')

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}

export function calculateVoltageDivider(vin, vout, r1) {
  if (!vin || !vout || !r1) return null
  const r2 = (vout * r1) / (vin - vout)
  const current = vin / (r1 + r2)
  const power = vin * current
  return {
    r1: r1,
    r2: r2.toFixed(0),
    current: (current * 1000).toFixed(2),
    power: (power * 1000).toFixed(2),
    actualVout: ((vin * r2) / (r1 + r2)).toFixed(3),
  }
}

export function calculateLinearRegulator(vin, vout, iload) {
  const vdrop = vin - vout
  const pdiss = vdrop * iload
  const efficiency = (vout / vin) * 100
  return {
    voltageDrop: vdrop.toFixed(2),
    powerDissipation: pdiss.toFixed(3),
    efficiency: efficiency.toFixed(1),
    heatsinkRequired: pdiss > 0.5,
    recommendedPackage: pdiss > 1 ? 'TO-220 with heatsink' : pdiss > 0.5 ? 'TO-220' : 'TO-92 or SOT-223',
  }
}

export function calculateBatteryLife(capacityMAh, currentMA, dutyCycle) {
  const effectiveCurrent = (currentMA * dutyCycle) / 100
  const hours = capacityMAh / effectiveCurrent
  const days = hours / 24
  return {
    effectiveCurrent: effectiveCurrent.toFixed(1),
    hours: hours.toFixed(1),
    days: days.toFixed(1),
    weeks: (days / 7).toFixed(1),
  }
}