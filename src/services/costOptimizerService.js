export async function optimizeCosts(idea, components, budget) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const componentList = components.map(function(c) {
    return c.name + ' (' + c.category + ') — ' + (c.estimatedPrice || '$5-15')
  }).join(', ')

  const prompt = [
    'You are an electronics budget optimization expert.',
    'Optimize the cost of this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Target budget: $' + (budget || 50),
    'Reply ONLY with valid JSON with exactly these keys:',
    'totalMin (number),',
    'totalMax (number),',
    'budgetStatus (string: Under Budget, On Budget, Over Budget),',
    'savings (array of objects with: component, currentPrice, suggestion, suggestedPrice, saving, tradeoff),',
    'bulkDeals (array of objects with: components array, supplier, saving, url),',
    'priorityList (array of objects with: component, priority string, canSkip boolean, reason)',
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

const BUDGET_KEY = 'protomind_budget'

export function saveBudget(idea, data) {
  try {
    const raw = localStorage.getItem(BUDGET_KEY)
    const all = raw ? JSON.parse(raw) : {}
    all[idea] = data
    localStorage.setItem(BUDGET_KEY, JSON.stringify(all))
  } catch {}
}

export function getBudget(idea) {
  try {
    const raw = localStorage.getItem(BUDGET_KEY)
    const all = raw ? JSON.parse(raw) : {}
    return all[idea] || null
  } catch {
    return null
  }
}