export function generateQRCodeUrl(text, size) {
  const s = size || 150
  return 'https://api.qrserver.com/v1/create-qr-code/?size=' + s + 'x' + s + '&data=' + encodeURIComponent(text)
}

export function getLabelTemplates() {
  return [
    { id: 'minimal', name: 'Minimal', bg: '#0d0d1a', text: '#ffffff', border: '#1e1e2e', accent: '#6366f1' },
    { id: 'tech', name: 'Tech Dark', bg: '#13131f', text: '#a5b4fc', border: '#6366f1', accent: '#818cf8' },
    { id: 'clean', name: 'Clean White', bg: '#ffffff', text: '#111827', border: '#e5e7eb', accent: '#6366f1' },
    { id: 'warning', name: 'Warning', bg: '#fef3c7', text: '#92400e', border: '#f59e0b', accent: '#d97706' },
    { id: 'danger', name: 'Danger', bg: '#fee2e2', text: '#991b1b', border: '#ef4444', accent: '#dc2626' },
  ]
}

export function saveLabelData(idea, data) {
  try {
    const key = 'protomind_labels'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    all[idea] = { data, savedAt: new Date().toISOString() }
    localStorage.setItem(key, JSON.stringify(all))
  } catch {}
}

export function getLabelData(idea) {
  try {
    const key = 'protomind_labels'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.data || null
  } catch {
    return null
  }
}