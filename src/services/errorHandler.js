export function initErrorHandler() {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)

    if (event.reason?.message?.includes('Ollama') ||
        event.reason?.message?.includes('fetch')) {
      console.warn('Network/Ollama error caught gracefully')
      event.preventDefault()
    }
  })

  window.addEventListener('error', (event) => {
    if (event.message?.includes('ResizeObserver')) {
      event.preventDefault()
      return
    }
    if (event.message?.includes('THREE') ||
        event.message?.includes('WebGL')) {
      console.warn('3D rendering error caught gracefully:', event.message)
      event.preventDefault()
      return
    }
    console.error('Global error:', event.message)
  })
}

export function safeLocalStorage(key, fallback = null) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    console.warn('localStorage read failed for key:', key)
    return fallback
  }
}

export function safeSetLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    console.warn('localStorage write failed for key:', key)
    return false
  }
}