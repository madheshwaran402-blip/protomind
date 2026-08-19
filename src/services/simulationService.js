export async function runSimulation(idea, components, scenario) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const componentList = components.map(function(c) { return c.name + ' (' + c.category + ')' }).join(', ')

  const prompt = [
    'You are an electronics simulation engine.',
    'Simulate this scenario for the prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Scenario: ' + scenario,
    'Reply ONLY with valid JSON with exactly these keys:',
    'scenarioName (string),',
    'steps (array of objects with: time, event, voltage, current, state, notes),',
    'outcome (string),',
    'issues (array of strings),',
    'recommendations (array of strings)',
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

export const SIMULATION_SCENARIOS = [
  { id: 'startup', label: '⚡ Power On', desc: 'What happens when power is first applied' },
  { id: 'load', label: '📈 Full Load', desc: 'All components running at maximum capacity' },
  { id: 'fault', label: '⚠️ Fault Condition', desc: 'Short circuit or component failure scenario' },
  { id: 'sleep', label: '💤 Sleep Mode', desc: 'Low power sleep and wake cycle' },
  { id: 'thermal', label: '🌡️ Thermal Stress', desc: 'High temperature operation over time' },
  { id: 'brownout', label: '🔋 Low Battery', desc: 'Behavior as battery depletes below threshold' },
]