export async function compareComponents(componentNames) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const prompt = [
    'You are an expert electronics engineer.',
    'Create a detailed comparison of these components: ' + componentNames.join(', '),
    'Reply ONLY with valid JSON with exactly these keys:',
    'title (string),',
    'components (array of objects with: name, icon, tagline, price, voltage, current, speed, flash, ram, interfaces array, gpioCount, weight, dimensions, pros array, cons array, bestFor array, difficulty, popularity, rating),',
    'comparisonRows (array of objects with: parameter, unit, values object mapping component name to value),',
    'winner (object with: overall string, budget string, performance string, beginner string, iot string),',
    'recommendation (string, 2-3 sentences)',
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

export function exportComparisonCSV(comparison) {
  if (!comparison) return

  const components = comparison.components || []
  const rows = comparison.comparisonRows || []

  const headers = ['Parameter', 'Unit'].concat(components.map(function(c) { return c.name }))

  const dataRows = rows.map(function(row) {
    return [row.parameter, row.unit || ''].concat(
      components.map(function(c) {
        return row.values ? (row.values[c.name] || 'N/A') : 'N/A'
      })
    )
  })

  const allRows = [headers].concat(dataRows)
  const csv = allRows.map(function(row) {
    return row.map(function(cell) {
      return '"' + String(cell).replace(/"/g, '""') + '"'
    }).join(',')
  }).join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'ComponentComparison.csv'
  link.click()
  URL.revokeObjectURL(url)
}