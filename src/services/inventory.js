const INVENTORY_KEY = 'protomind_inventory'

export function getInventory() {
  try {
    const data = localStorage.getItem(INVENTORY_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function addInventoryItem(item) {
  const inventory = getInventory()
  const newItem = {
    id: 'inv_' + Date.now(),
    name: item.name,
    category: item.category || 'Other',
    icon: item.icon || '🔧',
    quantity: item.quantity || 1,
    location: item.location || '',
    purchasedFrom: item.purchasedFrom || '',
    purchasePrice: item.purchasePrice || '',
    purchaseDate: item.purchaseDate || '',
    notes: item.notes || '',
    lowStockAlert: item.lowStockAlert || 1,
    createdAt: new Date().toISOString(),
  }
  inventory.unshift(newItem)
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory))
  return newItem
}

export function updateInventoryItem(id, updates) {
  const inventory = getInventory()
  const updated = inventory.map(item =>
    item.id === id ? { ...item, ...updates } : item
  )
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(updated))
}

export function deleteInventoryItem(id) {
  const inventory = getInventory().filter(item => item.id !== id)
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory))
}

export function adjustQuantity(id, delta) {
  const inventory = getInventory()
  const updated = inventory.map(item => {
    if (item.id === id) {
      const newQty = Math.max(0, (item.quantity || 0) + delta)
      return { ...item, quantity: newQty }
    }
    return item
  })
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(updated))
  return updated.find(i => i.id === id)
}

export function getLowStockItems() {
  return getInventory().filter(item =>
    item.quantity <= item.lowStockAlert
  )
}

export function searchInventory(query) {
  const inventory = getInventory()
  if (!query.trim()) return inventory
  const q = query.toLowerCase()
  return inventory.filter(item =>
    item.name.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q) ||
    (item.location || '').toLowerCase().includes(q)
  )
}

export function getInventoryStats() {
  const inventory = getInventory()
  const totalItems = inventory.length
  const totalComponents = inventory.reduce((sum, i) => sum + (i.quantity || 0), 0)
  const lowStock = inventory.filter(i => i.quantity <= i.lowStockAlert).length
  const totalValue = inventory.reduce((sum, i) => {
    const price = parseFloat(i.purchasePrice) || 0
    return sum + price * (i.quantity || 0)
  }, 0)
  return { totalItems, totalComponents, lowStock, totalValue }
}

export function importFromProject(components) {
  const inventory = getInventory()
  let added = 0
  components.forEach(comp => {
    const exists = inventory.find(i =>
      i.name.toLowerCase() === comp.name.toLowerCase()
    )
    if (!exists) {
      addInventoryItem({
        name: comp.name,
        category: comp.category,
        icon: comp.icon,
        quantity: 0,
      })
      added++
    }
  })
  return added
}

export function exportInventoryCSV() {
  const inventory = getInventory()
  const headers = ['Name', 'Category', 'Quantity', 'Location', 'Purchased From', 'Price', 'Purchase Date', 'Notes']
  const rows = inventory.map(item => [
    item.name,
    item.category,
    item.quantity,
    item.location,
    item.purchasedFrom,
    item.purchasePrice,
    item.purchaseDate,
    item.notes,
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'ProtoMind_Inventory.csv'
  link.click()
  URL.revokeObjectURL(url)
}