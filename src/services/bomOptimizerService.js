export async function optimizeBOM(components) {
  const componentList = components.map(c =>
    c.name + ' (' + c.category + ')'
  ).join(', ')

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const prompt = [
    'You are an expert electronics procurement specialist.',
    'Optimize the bill of materials for cost and availability.',
    'Components: ' + componentList,
    'Reply ONLY with valid JSON with exactly these keys:',
    'items (array of objects with: name, category, qty, unitCostAli, unitCostAmazon, unitCostLocal, bestSupplier, bulkDiscount, notes)',
    'totals (object with: aliexpress, amazon, local, recommended)',
    'shipping (object with: aliexpress, amazon, local)',
    'grandTotal (object with: aliexpress, amazon, local)',
    'savings (object with: vsAmazon, vsLocal)',
    'bulkOpportunities (array of strings)',
    'procurementOrder (array of strings describing order in which to buy)',
    'tips (array of strings)',
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

export function exportBOMCSV(result, components) {
  const headers = ['Component', 'Category', 'Qty', 'AliExpress', 'Amazon', 'Local', 'Best Supplier', 'Notes']
  const rows = (result.items || []).map(function(item) {
    return [
      item.name,
      item.category,
      item.qty || 1,
      '$' + (item.unitCostAli || 0).toFixed(2),
      '$' + (item.unitCostAmazon || 0).toFixed(2),
      '$' + (item.unitCostLocal || 0).toFixed(2),
      item.bestSupplier || '',
      item.notes || '',
    ]
  })

  const footer = [
    [],
    ['TOTALS', '', '', '$' + (result.totals?.aliexpress || 0).toFixed(2), '$' + (result.totals?.amazon || 0).toFixed(2), '$' + (result.totals?.local || 0).toFixed(2), '', ''],
    ['SHIPPING', '', '', '$' + (result.shipping?.aliexpress || 0).toFixed(2), '$' + (result.shipping?.amazon || 0).toFixed(2), '$' + (result.shipping?.local || 0).toFixed(2), '', ''],
    ['GRAND TOTAL', '', '', '$' + (result.grandTotal?.aliexpress || 0).toFixed(2), '$' + (result.grandTotal?.amazon || 0).toFixed(2), '$' + (result.grandTotal?.local || 0).toFixed(2), '', ''],
  ]

  const allRows = [headers].concat(rows).concat(footer)
  const csv = allRows.map(function(r) {
    return r.map(function(cell) {
      return '"' + String(cell).replace(/"/g, '""') + '"'
    }).join(',')
  }).join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'ProtoMind_BOM_Optimized.csv'
  link.click()
  URL.revokeObjectURL(url)
}