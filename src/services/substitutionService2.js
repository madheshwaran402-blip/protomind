export async function findSubstitutions(component, context) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const contextStr = context ? [
    context.budget ? 'Budget constraint: under $' + context.budget : '',
    context.reason ? 'Reason for substitution: ' + context.reason : '',
    context.priority ? 'Priority: ' + context.priority : '',
  ].filter(Boolean).join(', ') : 'none'

  const prompt = [
    'You are an expert electronics component procurement specialist.',
    'Find the best substitutions for this component.',
    'Component to replace: ' + component.name + ' (' + component.category + ')',
    'Context: ' + contextStr,
    'Reply ONLY with valid JSON with exactly these keys:',
    'originalComponent (string),',
    'substitutions (array of objects with: name, manufacturer, category, compatibilityScore, priceRange, availability, pros, cons, pinChanges array of strings, codeChanges array of strings, dropInReplacement boolean, notes),',
    'recommendation (string, which one to choose and why),',
    'generalTips (array of strings)',
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