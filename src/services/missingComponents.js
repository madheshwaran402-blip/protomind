export async function findMissingComponents(idea, components) {
  const componentList = components.map(c =>
    c.name + ' (' + c.category + ')'
  ).join(', ')

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: 'You are an expert electronics engineer. Review this prototype:\n\nIdea: "' + idea + '"\nCurrent components: ' + componentList + '\n\nWhat CRITICAL components are missing that are absolutely needed to make this work? Think about: resistors, capacitors, voltage regulators, pull-up resistors, decoupling capacitors, connectors, programming interfaces, protection circuits.\n\nReply ONLY with this JSON, no explanation:\n{"missing": [{"name": "Component Name", "category": "Category", "reason": "Why it is critical", "quantity": 2, "estimatedPrice": 1.5, "urgent": true}], "verdict": "one sentence overall assessment", "readyToBuild": false}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}

export async function generateShoppingList(idea, components, missingComponents) {
  const allComponents = [
    ...components.map(c => ({
      name: c.name,
      category: c.category,
      quantity: c.quantity || 1,
      estimatedPrice: 5,
      status: 'selected',
    })),
    ...(missingComponents || []).map(c => ({
      name: c.name,
      category: c.category,
      quantity: c.quantity || 1,
      estimatedPrice: c.estimatedPrice || 2,
      status: 'missing',
    })),
  ]

  const totalMin = allComponents.reduce((sum, c) => sum + (c.estimatedPrice * 0.5 * c.quantity), 0)
  const totalMax = allComponents.reduce((sum, c) => sum + (c.estimatedPrice * 2 * c.quantity), 0)

  return {
    items: allComponents,
    totalMin: totalMin.toFixed(2),
    totalMax: totalMax.toFixed(2),
    itemCount: allComponents.length,
  }
}

export function downloadShoppingListCSV(shoppingList, idea) {
  const headers = ['Component', 'Category', 'Quantity', 'Est. Price (USD)', 'Status', 'Buy Link']
  const rows = shoppingList.items.map(item => [
    item.name,
    item.category,
    item.quantity,
    '$' + item.estimatedPrice,
    item.status === 'missing' ? 'MISSING - Add to cart' : 'Selected',
    'https://www.amazon.com/s?k=' + encodeURIComponent(item.name),
  ])

  const csv = [
    'ProtoMind Shopping List',
    'Idea: ' + idea,
    'Generated: ' + new Date().toLocaleDateString(),
    '',
    headers.join(','),
    ...rows.map(r => r.join(',')),
    '',
    'Total Estimated Min,$' + shoppingList.totalMin,
    'Total Estimated Max,$' + shoppingList.totalMax,
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'ProtoMind_Shopping_List.csv'
  link.click()
  URL.revokeObjectURL(url)
}