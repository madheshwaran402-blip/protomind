const LIBRARY_KEY = 'protomind_custom_library'

export function getCustomLibrary() {
  try {
    const data = localStorage.getItem(LIBRARY_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function addCustomComponent(component) {
  const library = getCustomLibrary()
  const newComponent = {
    ...component,
    id: 'custom_' + Date.now(),
    isCustom: true,
    createdAt: new Date().toISOString(),
  }
  library.unshift(newComponent)
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(library))
  return newComponent
}

export function updateCustomComponent(id, updates) {
  const library = getCustomLibrary()
  const updated = library.map(c => c.id === id ? { ...c, ...updates } : c)
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(updated))
}

export function deleteCustomComponent(id) {
  const library = getCustomLibrary().filter(c => c.id !== id)
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(library))
}

export function searchCustomLibrary(query) {
  const library = getCustomLibrary()
  if (!query.trim()) return library
  const q = query.toLowerCase()
  return library.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q) ||
    (c.description || '').toLowerCase().includes(q)
  )
}

export function exportLibrary() {
  const library = getCustomLibrary()
  const blob = new Blob([JSON.stringify(library, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'ProtoMind_Custom_Library.json'
  link.click()
  URL.revokeObjectURL(url)
}

export function importLibrary(jsonString) {
  try {
    const imported = JSON.parse(jsonString)
    if (!Array.isArray(imported)) throw new Error('Invalid format')
    const existing = getCustomLibrary()
    const merged = [...imported, ...existing].reduce((acc, comp) => {
      if (!acc.find(c => c.id === comp.id)) acc.push(comp)
      return acc
    }, [])
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(merged))
    return merged.length
  } catch {
    throw new Error('Invalid library file')
  }
}