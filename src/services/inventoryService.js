const INVENTORY_KEY = 'protomind_inventory'

export function getInventory() {
  try {
    const raw = localStorage.getItem(INVENTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveInventory(items) {
  try {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(items))
  } catch {}
}

export function addInventoryItem(item) {
  const inventory = getInventory()
  const newItem = {
    id: 'inv_' + Date.now(),
    name: item.name || '',
    category: item.category || 'Other',
    quantity: parseInt(item.quantity) || 0,
    minStock: parseInt(item.minStock) || 1,
    location: item.location || '',
    supplier: item.supplier || '',
    unitCost: parseFloat(item.unitCost) || 0,
    notes: item.notes || '',
    icon: item.icon || '🔧',
    addedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  }
  inventory.push(newItem)
  saveInventory(inventory)
  return newItem
}

export function updateInventoryItem(id, updates) {
  const inventory = getInventory()
  const updated = inventory.map(function(item) {
    if (item.id === id) {
      return Object.assign({}, item, updates, { lastUpdated: new Date().toISOString() })
    }
    return item
  })
  saveInventory(updated)
}

export function deleteInventoryItem(id) {
  const inventory = getInventory()
  saveInventory(inventory.filter(function(item) { return item.id !== id }))
}

export function getLowStockItems() {
  return getInventory().filter(function(item) {
    return item.quantity <= item.minStock
  })
}

export function getInventoryStats() {
  const inventory = getInventory()
  const totalItems = inventory.length
  const totalValue = inventory.reduce(function(sum, item) {
    return sum + (item.quantity * item.unitCost)
  }, 0)
  const lowStock = getLowStockItems().length
  const outOfStock = inventory.filter(function(item) { return item.quantity === 0 }).length
  const categories = {}
  inventory.forEach(function(item) {
    categories[item.category] = (categories[item.category] || 0) + 1
  })
  return { totalItems, totalValue, lowStock, outOfStock, categories }
}

export function exportInventoryCSV() {
  const inventory = getInventory()
  const headers = ['Name', 'Category', 'Quantity', 'Min Stock', 'Location', 'Supplier', 'Unit Cost', 'Total Value', 'Notes']
  const rows = inventory.map(function(item) {
    return [
      item.name,
      item.category,
      item.quantity,
      item.minStock,
      item.location || '',
      item.supplier || '',
      '$' + item.unitCost.toFixed(2),
      '$' + (item.quantity * item.unitCost).toFixed(2),
      item.notes || '',
    ]
  })
  const csv = [headers].concat(rows).map(function(row) {
    return row.map(function(cell) {
      return '"' + String(cell).replace(/"/g, '""') + '"'
    }).join(',')
  }).join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'ProtoMind_Inventory.csv'
  link.click()
  URL.revokeObjectURL(url)
}