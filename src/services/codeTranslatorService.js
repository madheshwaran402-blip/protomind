export async function translateCode(code, fromLang, toLang, idea) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const prompt = [
    'You are an expert embedded systems programmer.',
    'Translate this code from ' + fromLang + ' to ' + toLang + '.',
    'Prototype context: ' + idea,
    'Source code:',
    code,
    'Reply ONLY with valid JSON with exactly these keys:',
    'translatedCode (string),',
    'changes (array of strings, key differences),',
    'warnings (array of strings),',
    'librariesNeeded (array of strings)',
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

export const SUPPORTED_LANGUAGES = [
  { value: 'Arduino C++', icon: '🔵', ext: '.ino' },
  { value: 'MicroPython', icon: '🐍', ext: '.py' },
  { value: 'CircuitPython', icon: '🔴', ext: '.py' },
  { value: 'Raspberry Pi Python', icon: '🟢', ext: '.py' },
  { value: 'JavaScript', icon: '🟡', ext: '.js' },
  { value: 'C', icon: '⚪', ext: '.c' },
]
