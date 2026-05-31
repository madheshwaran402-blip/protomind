export function generateShareId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

export function createShareableLink(project) {
  const shareId = project.shareId || generateShareId()
  const baseUrl = window.location.origin
  return baseUrl + '/share/' + shareId
}

export function saveSharedProject(project) {
  try {
    const key = 'protomind_shared'
    const raw = localStorage.getItem(key)
    const shared = raw ? JSON.parse(raw) : {}
    const shareId = project.shareId || generateShareId()
    shared[shareId] = {
      ...project,
      shareId,
      sharedAt: new Date().toISOString(),
      views: (shared[shareId]?.views || 0),
    }
    localStorage.setItem(key, JSON.stringify(shared))
    return shareId
  } catch {
    return null
  }
}

export function getSharedProject(shareId) {
  try {
    const raw = localStorage.getItem('protomind_shared')
    if (!raw) return null
    const shared = JSON.parse(raw)
    return shared[shareId] || null
  } catch {
    return null
  }
}

export function getAllSharedProjects() {
  try {
    const raw = localStorage.getItem('protomind_shared')
    return raw ? Object.values(JSON.parse(raw)) : []
  } catch {
    return []
  }
}

export function incrementViews(shareId) {
  try {
    const key = 'protomind_shared'
    const raw = localStorage.getItem(key)
    const shared = raw ? JSON.parse(raw) : {}
    if (shared[shareId]) {
      shared[shareId].views = (shared[shareId].views || 0) + 1
      localStorage.setItem(key, JSON.stringify(shared))
    }
  } catch {}
}

export function generateQRCodeUrl(text) {
  return 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(text)
}

export function getSocialShareLinks(url, title) {
  return {
    twitter: 'https://twitter.com/intent/tweet?text=' + encodeURIComponent('Check out my electronics prototype: ' + title) + '&url=' + encodeURIComponent(url),
    reddit: 'https://www.reddit.com/submit?url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title),
    whatsapp: 'https://wa.me/?text=' + encodeURIComponent(title + ' ' + url),
    telegram: 'https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(title),
  }
}