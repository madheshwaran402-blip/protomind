export async function generateShoppingList(idea, components) {
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
      prompt: 'You are an expert electronics purchasing advisor. Create a complete shopping list for this prototype.\n\nIdea: "' + idea + '"\nComponents needed: ' + componentList + '\n\nCreate a prioritized shopping list. Reply ONLY with this exact JSON:\n\n{"items": [{"name": "Arduino Nano", "category": "Microcontroller", "quantity": 1, "priority": "Essential", "amazonPrice": 12.99, "aliexpressPrice": 3.50, "localPrice": 18.00, "amazonSearch": "Arduino Nano V3 CH340", "aliexpressSearch": "Arduino Nano V3 ATmega328", "notes": "Buy 2 in case one is damaged during soldering", "alternatives": ["Arduino Uno", "Pro Micro"]}, {"name": "10k Resistor", "category": "Passive", "quantity": 5, "priority": "Essential", "amazonPrice": 0.10, "aliexpressPrice": 0.02, "localPrice": 0.50, "notes": "Buy a resistor kit instead for better value", "alternatives": []}], "extras": [{"name": "Breadboard", "reason": "For prototyping before soldering"}, {"name": "Jumper Wires", "reason": "For connections on breadboard"}], "tools": [{"name": "Soldering Iron", "reason": "For permanent connections", "estimatedCost": "$15-30"}], "totals": {"amazon": 45.99, "aliexpress": 12.50, "local": 78.00}, "buyingTips": ["Order 20% extra of passive components", "Check seller ratings before ordering from AliExpress"], "estimatedDelivery": {"amazon": "2-5 days", "aliexpress": "2-6 weeks", "local": "Same day"}}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}

export function exportShoppingListCSV(list, idea) {
  const headers = ['Component', 'Category', 'Qty', 'Priority', 'Amazon $', 'AliExpress $', 'Local $', 'Notes', 'Alternatives']
  const rows = (list.items || []).map(item => [
    item.name,
    item.category,
    item.quantity,
    item.priority,
    item.amazonPrice?.toFixed(2) || '',
    item.aliexpressPrice?.toFixed(2) || '',
    item.localPrice?.toFixed(2) || '',
    item.notes || '',
    (item.alternatives || []).join(' / '),
  ])

  const extraRows = (list.extras || []).map(e => [
    e.name, 'Extra', 1, 'Recommended', '', '', '', e.reason, '',
  ])
  const toolRows = (list.tools || []).map(t => [
    t.name, 'Tool', 1, 'Tool', '', '', t.estimatedCost || '', t.reason, '',
  ])

  const allRows = [headers, ...rows, ...extraRows, ...toolRows]
  const csv = allRows.map(r => r.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(',')).join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'ProtoMind_Shopping_' + idea.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20) + '.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export function generateShareText(list, idea) {
  const lines = [
    '🛒 Shopping List for: ' + idea,
    '========================',
    '',
    '📦 COMPONENTS:',
    ...(list.items || []).map(item =>
      '• ' + item.name + ' × ' + item.quantity +
      ' — AliExpress ~$' + (item.aliexpressPrice || 0).toFixed(2) +
      ' | Amazon ~$' + (item.amazonPrice || 0).toFixed(2)
    ),
    '',
    '🔧 EXTRAS:',
    ...(list.extras || []).map(e => '• ' + e.name),
    '',
    '🛠️ TOOLS NEEDED:',
    ...(list.tools || []).map(t => '• ' + t.name + ' (~' + t.estimatedCost + ')'),
    '',
    '💰 TOTAL ESTIMATE:',
    '  Amazon: $' + (list.totals?.amazon || 0).toFixed(2),
    '  AliExpress: $' + (list.totals?.aliexpress || 0).toFixed(2),
    '',
    'Generated with ProtoMind — protomind-ten.vercel.app',
  ]
  return lines.join('\n')
}