import { getInventory, saveInventory } from './inventoryService'

export function syncPrototypeWithInventory(components) {
  const inventory = getInventory()
  const results = []

  components.forEach(function(comp) {
    const inventoryItem = inventory.find(function(item) {
      return item.name.toLowerCase().includes(comp.name.toLowerCase()) ||
        comp.name.toLowerCase().includes(item.name.toLowerCase())
    })

    if (inventoryItem) {
      results.push({
        component: comp.name,
        icon: comp.icon,
        found: true,
        inventoryItem: inventoryItem,
        inStock: inventoryItem.quantity > 0,
        quantity: inventoryItem.quantity,
        status: inventoryItem.quantity > 0 ? 'available' : 'out_of_stock',
      })
    } else {
      results.push({
        component: comp.name,
        icon: comp.icon,
        found: false,
        inventoryItem: null,
        inStock: false,
        quantity: 0,
        status: 'not_tracked',
      })
    }
  })

  return results
}

export function deductFromInventory(componentName, quantity) {
  const inventory = getInventory()
  let deducted = false

  const updated = inventory.map(function(item) {
    if (item.name.toLowerCase().includes(componentName.toLowerCase()) ||
      componentName.toLowerCase().includes(item.name.toLowerCase())) {
      const newQty = Math.max(0, item.quantity - (quantity || 1))
      deducted = true
      return Object.assign({}, item, { quantity: newQty })
    }
    return item
  })

  if (deducted) saveInventory(updated)
  return deducted
}

export function addMissingToInventory(componentName, icon) {
  const inventory = getInventory()
  const exists = inventory.find(function(item) {
    return item.name.toLowerCase() === componentName.toLowerCase()
  })
  if (!exists) {
    const newItem = {
      id: 'inv_' + Date.now(),
      name: componentName,
      icon: icon || '🔧',
      quantity: 0,
      minStock: 2,
      unitCost: 0,
      category: 'Component',
      supplier: '',
      addedAt: new Date().toISOString(),
    }
    inventory.push(newItem)
    saveInventory(inventory)
    return newItem
  }
  return exists
}