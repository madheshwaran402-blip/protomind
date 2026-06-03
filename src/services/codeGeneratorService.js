const LANGUAGE_CONFIGS = {
  arduino: {
    name: 'Arduino C++',
    icon: '🔵',
    fileExt: '.ino',
    color: '#00979d',
    description: 'For Arduino Nano, Uno, Mega boards',
  },
  micropython: {
    name: 'MicroPython',
    icon: '🐍',
    fileExt: '.py',
    color: '#22c55e',
    description: 'For ESP32, ESP8266, Raspberry Pi Pico',
  },
  circuitpython: {
    name: 'CircuitPython',
    icon: '🔴',
    fileExt: '.py',
    color: '#ef4444',
    description: 'For Adafruit boards and Circuit Playground',
  },
  raspberrypi: {
    name: 'Raspberry Pi Python',
    icon: '🟢',
    fileExt: '.py',
    color: '#a855f7',
    description: 'For Raspberry Pi with GPIO',
  },
  javascript: {
    name: 'JavaScript (Johnny-Five)',
    icon: '🟡',
    fileExt: '.js',
    color: '#f59e0b',
    description: 'For Arduino via Node.js firmata',
  },
}

export function getLanguageConfigs() {
  return LANGUAGE_CONFIGS
}

export async function generateCodeForLanguage(idea, components, language) {
  const componentList = components.map(function(c) {
    return c.name + ' (' + c.category + ')'
  }).join(', ')

  const config = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.arduino

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const prompt = [
    'You are an expert embedded systems programmer.',
    'Generate complete working ' + config.name + ' code for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Language: ' + config.name,
    'Reply ONLY with valid JSON with exactly these keys:',
    'title (string, code file title),',
    'language (string),',
    'description (string, 1-2 sentences about what the code does),',
    'dependencies (array of strings, library names needed),',
    'pinDefinitions (array of objects with: name, pin, type, component),',
    'sections (array of objects with: name, description, code),',
    'fullCode (string, complete working code with comments),',
    'uploadInstructions (array of strings),',
    'troubleshooting (array of objects with: problem, fix)',
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