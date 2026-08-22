export async function decodeProtocol(idea, components, protocol) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const componentList = components.map(function(c) { return c.name }).join(', ')
  const prompt = [
    'You are a communication protocol expert.',
    'Explain and decode the ' + protocol + ' protocol for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Reply ONLY with valid JSON with exactly these keys:',
    'protocol (string),',
    'overview (string),',
    'pinout (array of objects with: pin, name, direction, description),',
    'timingDiagram (string, ASCII art timing diagram),',
    'codeExample (string),',
    'commonIssues (array of strings)',
  ].join("\n")
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

export const PROTOCOLS = [
  { value: 'I2C', icon: '🔵', desc: 'Two-wire serial' },
  { value: 'SPI', icon: '🟢', desc: 'Four-wire high speed' },
  { value: 'UART', icon: '🟡', desc: 'Serial async' },
  { value: 'PWM', icon: '🔴', desc: 'Pulse width mod' },
  { value: 'OneWire', icon: '⚪', desc: 'Single wire bus' },
  { value: 'CAN', icon: '🟠', desc: 'Vehicle network' },
]

export function saveProtocolData(idea, protocol, result) {
  try {
    const raw = localStorage.getItem('protomind_protocols')
    const all = raw ? JSON.parse(raw) : {}
    if (!all[idea]) all[idea] = {}
    all[idea][protocol] = { result, savedAt: new Date().toISOString() }
    localStorage.setItem('protomind_protocols', JSON.stringify(all))
  } catch {}
}

export function getProtocolData(idea, protocol) {
  try {
    const raw = localStorage.getItem('protomind_protocols')
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.[protocol]?.result || null
  } catch { return null }
}
