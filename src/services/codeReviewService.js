export async function reviewCode(code, language, idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const componentList = components.map(function(c) { return c.name }).join(', ')

  const prompt = [
    'You are an expert embedded systems code reviewer.',
    'Review this ' + (language || 'Arduino') + ' code for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Code to review:',
    '```',
    code,
    '```',
    'Reply ONLY with valid JSON with exactly these keys:',
    'overallScore (number 0-100),',
    'grade (string: A, B, C, D, F),',
    'summary (string),',
    'issues (array of objects with: line, severity, type, message, fix),',
    'improvements (array of objects with: title, description, codeExample),',
    'positives (array of strings),',
    'optimizedSnippets (array of objects with: original, optimized, reason)',
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