const COMPONENT_PRICES = {
  Microcontroller: { min: 3, max: 25, unit: 'USD' },
  Sensor: { min: 1, max: 15, unit: 'USD' },
  Display: { min: 2, max: 30, unit: 'USD' },
  Communication: { min: 1, max: 12, unit: 'USD' },
  Power: { min: 1, max: 20, unit: 'USD' },
  Actuator: { min: 2, max: 25, unit: 'USD' },
  Module: { min: 1, max: 10, unit: 'USD' },
  Memory: { min: 1, max: 8, unit: 'USD' },
}

const BUY_LINKS = {
  Microcontroller: 'https://www.amazon.com/s?k=',
  Sensor: 'https://www.amazon.com/s?k=',
  Display: 'https://www.amazon.com/s?k=',
  Communication: 'https://www.amazon.com/s?k=',
  Power: 'https://www.amazon.com/s?k=',
  Actuator: 'https://www.amazon.com/s?k=',
  Module: 'https://www.amazon.com/s?k=',
  Memory: 'https://www.amazon.com/s?k=',
}

export function generateBOMCSV(components, idea) {
  const headers = ['#', 'Component Name', 'Category', 'Quantity', 'Est. Min Price (USD)', 'Est. Max Price (USD)', 'Est. Total Min', 'Est. Total Max', 'Buy Link']

  const rows = components.map((comp, index) => {
    const price = COMPONENT_PRICES[comp.category] || { min: 1, max: 10 }
    const qty = comp.quantity || 1
    const buyLink = (BUY_LINKS[comp.category] || 'https://www.amazon.com/s?k=') + encodeURIComponent(comp.name)
    return [
      index + 1,
      comp.name,
      comp.category,
      qty,
      price.min.toFixed(2),
      price.max.toFixed(2),
      (price.min * qty).toFixed(2),
      (price.max * qty).toFixed(2),
      buyLink,
    ].join(',')
  })

  const totalMin = components.reduce((sum, comp) => {
    const price = COMPONENT_PRICES[comp.category] || { min: 1 }
    return sum + price.min * (comp.quantity || 1)
  }, 0)

  const totalMax = components.reduce((sum, comp) => {
    const price = COMPONENT_PRICES[comp.category] || { max: 10 }
    return sum + price.max * (comp.quantity || 1)
  }, 0)

  const csv = [
    'ProtoMind Bill of Materials',
    'Idea: ' + idea,
    'Generated: ' + new Date().toLocaleDateString(),
    '',
    headers.join(','),
    ...rows,
    '',
    ',,,,,,Total Min,$' + totalMin.toFixed(2),
    ',,,,,,Total Max,$' + totalMax.toFixed(2),
  ].join('\n')

  return { csv, totalMin, totalMax }
}

export function downloadBOM(components, idea) {
  const { csv } = generateBOMCSV(components, idea)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const fileName = idea.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)
  link.download = 'ProtoMind_BOM_' + fileName + '.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}