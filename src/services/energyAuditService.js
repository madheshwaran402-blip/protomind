export async function runEnergyAudit(idea, components) {
  const componentList = components.map(function(c) {
    return c.name + ' (' + c.category + ')'
  }).join(', ')

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const prompt = [
    'You are an expert electronics power engineer.',
    'Perform a detailed energy audit for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Reply ONLY with valid JSON with exactly these keys:',
    'supplyVoltage (number, e.g. 5),',
    'totalCurrentMA (number, total mA),',
    'totalPowerMW (number, total mW),',
    'components (array of objects with: name, activeMA, sleepMA, dutyCycle, contribution),',
    'batteryEstimates (array of objects with: capacity, type, hoursActive, hoursSleep, daysMixed),',
    'powerSavingTips (array of strings),',
    'sleepModeAnalysis (object with: potentialSaving, recommendation, estimatedSleepCurrent),',
    'efficiency (string: Excellent or Good or Fair or Poor),',
    'verdict (string, one sentence summary)',
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