const A11Y_KEY = 'protomind_a11y'

export const DEFAULT_A11Y = {
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  focusIndicators: true,
  screenReaderMode: false,
}

export function getA11ySettings() {
  try {
    const data = localStorage.getItem(A11Y_KEY)
    return data ? { ...DEFAULT_A11Y, ...JSON.parse(data) } : DEFAULT_A11Y
  } catch {
    return DEFAULT_A11Y
  }
}

export function saveA11ySettings(settings) {
  localStorage.setItem(A11Y_KEY, JSON.stringify(settings))
  applyA11ySettings(settings)
}

export function applyA11ySettings(settings) {
  const root = document.documentElement

  if (settings.highContrast) {
    root.style.setProperty('--bg-primary', '#000000')
    root.style.setProperty('--text-primary', '#ffffff')
    root.style.setProperty('--border-color', '#ffffff')
    root.classList.add('high-contrast')
  } else {
    root.style.removeProperty('--bg-primary')
    root.style.removeProperty('--text-primary')
    root.style.removeProperty('--border-color')
    root.classList.remove('high-contrast')
  }

  if (settings.largeText) {
    root.style.fontSize = '18px'
    root.classList.add('large-text')
  } else {
    root.style.fontSize = ''
    root.classList.remove('large-text')
  }

  if (settings.reduceMotion) {
    root.classList.add('reduce-motion')
  } else {
    root.classList.remove('reduce-motion')
  }

  if (settings.focusIndicators) {
    root.classList.add('show-focus')
  } else {
    root.classList.remove('show-focus')
  }
}