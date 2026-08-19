const COST_KEY = 'protomind_cost_tracker'

export function getCostTracker(projectId) {
  try {
    const raw = localStorage.getItem(COST_KEY)
    const all = raw ? JSON.parse(raw) : {}
    return all[projectId] || { items: [], budget: 0, currency: 'USD' }
  } catch {
    return { items: [], budget: 0, currency: 'USD' }
  }
}

export function saveCostTracker(projectId, data) {
  try {
    const raw = localStorage.getItem(COST_KEY)
    const all = raw ? JSON.parse(raw) : {}
    all[projectId] = data
    localStorage.setItem(COST_KEY, JSON.stringify(all))
  } catch {}
}

export function addExpense(projectId, expense) {
  const data = getCostTracker(projectId)
  const newItem = {
    id: 'exp_' + Date.now(),
    name: expense.name,
    category: expense.category || 'Component',
    quantity: expense.quantity || 1,
    unitPrice: parseFloat(expense.unitPrice) || 0,
    supplier: expense.supplier || '',
    purchased: expense.purchased || false,
    purchasedAt: null,
    notes: expense.notes || '',
    addedAt: new Date().toISOString(),
  }
  data.items = (data.items || []).concat([newItem])
  saveCostTracker(projectId, data)
  return newItem
}

export function updateExpense(projectId, itemId, updates) {
  const data = getCostTracker(projectId)
  data.items = (data.items || []).map(function(item) {
    if (item.id === itemId) return Object.assign({}, item, updates)
    return item
  })
  saveCostTracker(projectId, data)
}

export function deleteExpense(projectId, itemId) {
  const data = getCostTracker(projectId)
  data.items = (data.items || []).filter(function(item) { return item.id !== itemId })
  saveCostTracker(projectId, data)
}

export function togglePurchased(projectId, itemId) {
  const data = getCostTracker(projectId)
  data.items = (data.items || []).map(function(item) {
    if (item.id === itemId) {
      return Object.assign({}, item, {
        purchased: !item.purchased,
        purchasedAt: !item.purchased ? new Date().toISOString() : null,
      })
    }
    return item
  })
  saveCostTracker(projectId, data)
}

export function getCostSummary(items) {
  const total = items.reduce(function(sum, item) {
    return sum + (item.unitPrice * item.quantity)
  }, 0)
  const purchased = items.filter(function(i) { return i.purchased }).reduce(function(sum, item) {
    return sum + (item.unitPrice * item.quantity)
  }, 0)
  const remaining = total - purchased

  const byCategory = {}
  items.forEach(function(item) {
    const cat = item.category || 'Other'
    if (!byCategory[cat]) byCategory[cat] = 0
    byCategory[cat] += item.unitPrice * item.quantity
  })

  return { total, purchased, remaining, byCategory }
}

export function exportCostCSV(items, projectId) {
  const lines = [
    '"Name","Category","Qty","Unit Price","Total","Supplier","Purchased","Notes"',
    ...items.map(function(item) {
      const total = (item.unitPrice * item.quantity).toFixed(2)
      return [
        '"' + item.name + '"',
        '"' + (item.category || '') + '"',
        item.quantity,
        item.unitPrice.toFixed(2),
        total,
        '"' + (item.supplier || '') + '"',
        item.purchased ? 'Yes' : 'No',
        '"' + (item.notes || '') + '"',
      ].join(',')
    }),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'CostTracker_' + projectId + '.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export const EXPENSE_CATEGORIES = [
  'Component', 'PCB', 'Enclosure', 'Tool', 'Shipping', 'Service', 'Other'
]