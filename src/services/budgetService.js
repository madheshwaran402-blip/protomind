const BUDGET_KEY = 'protomind_budgets'

export function getAllBudgets() {
  try {
    const data = localStorage.getItem(BUDGET_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export function getBudget(idea) {
  const all = getAllBudgets()
  return all[idea] || {
    totalBudget: 0,
    currency: 'USD',
    items: [],
    notes: '',
    createdAt: new Date().toISOString(),
  }
}

export function saveBudget(idea, budget) {
  const all = getAllBudgets()
  all[idea] = { ...budget, updatedAt: new Date().toISOString() }
  localStorage.setItem(BUDGET_KEY, JSON.stringify(all))
  return all[idea]
}

export function addBudgetItem(idea, item) {
  const budget = getBudget(idea)
  const newItem = {
    id: 'item_' + Date.now(),
    name: item.name,
    quantity: item.quantity || 1,
    unitPrice: item.unitPrice || 0,
    supplier: item.supplier || '',
    purchased: item.purchased || false,
    category: item.category || 'Component',
    createdAt: new Date().toISOString(),
  }
  budget.items.push(newItem)
  saveBudget(idea, budget)
  return budget
}

export function updateBudgetItem(idea, itemId, updates) {
  const budget = getBudget(idea)
  budget.items = budget.items.map(item =>
    item.id === itemId ? { ...item, ...updates } : item
  )
  saveBudget(idea, budget)
  return budget
}

export function deleteBudgetItem(idea, itemId) {
  const budget = getBudget(idea)
  budget.items = budget.items.filter(item => item.id !== itemId)
  saveBudget(idea, budget)
  return budget
}

export function getBudgetSummary(idea) {
  const budget = getBudget(idea)
  const totalSpent = budget.items.reduce((sum, item) =>
    sum + (item.unitPrice * item.quantity), 0
  )
  const totalPurchased = budget.items
    .filter(item => item.purchased)
    .reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
  const remaining = budget.totalBudget - totalSpent
  const percentUsed = budget.totalBudget > 0
    ? Math.min((totalSpent / budget.totalBudget) * 100, 100)
    : 0
  return {
    totalBudget: budget.totalBudget,
    totalSpent,
    totalPurchased,
    remaining,
    percentUsed,
    isOverBudget: totalSpent > budget.totalBudget && budget.totalBudget > 0,
    itemCount: budget.items.length,
    purchasedCount: budget.items.filter(i => i.purchased).length,
  }
}

export function importComponentsTobudget(idea, components) {
  const budget = getBudget(idea)
  let added = 0
  components.forEach(comp => {
    const exists = budget.items.find(i =>
      i.name.toLowerCase() === comp.name.toLowerCase()
    )
    if (!exists) {
      const newItem = {
        id: 'item_' + Date.now() + '_' + added,
        name: comp.name,
        quantity: 1,
        unitPrice: 0,
        supplier: '',
        purchased: false,
        category: comp.category || 'Component',
        createdAt: new Date().toISOString(),
      }
      budget.items.push(newItem)
      added++
    }
  })
  saveBudget(idea, budget)
  return { budget, added }
}

export function exportBudgetCSV(idea) {
  const budget = getBudget(idea)
  const headers = ['Item', 'Category', 'Qty', 'Unit Price', 'Total', 'Supplier', 'Purchased']
  const rows = budget.items.map(item => [
    item.name,
    item.category,
    item.quantity,
    item.unitPrice.toFixed(2),
    (item.unitPrice * item.quantity).toFixed(2),
    item.supplier,
    item.purchased ? 'Yes' : 'No',
  ])
  const summary = getBudgetSummary(idea)
  const footer = [
    ['', '', '', 'TOTAL', summary.totalSpent.toFixed(2), '', ''],
    ['', '', '', 'BUDGET', budget.totalBudget.toFixed(2), '', ''],
    ['', '', '', 'REMAINING', summary.remaining.toFixed(2), '', ''],
  ]
  const csv = [headers, ...rows, [], ...footer]
    .map(r => r.join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'Budget_' + idea.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20) + '.csv'
  link.click()
  URL.revokeObjectURL(url)
}