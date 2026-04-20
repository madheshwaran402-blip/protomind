const SETTINGS_KEY = 'protomind_settings'

export const DEFAULT_SETTINGS = {
  theme: 'dark',
  aiModel: 'llama3.2',
  defaultCategory: 'All',
  showPrices: true,
  autoValidate: false,
  language: 'English',
  ollamaUrl: 'http://localhost:11434',
  fontSize: 'medium',
  sidebarCompact: false,
  showAnimations: true,
}

export function getSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY)
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  applyFontSize(settings.fontSize)
}

export function applyFontSize(size) {
  const root = document.documentElement
  const sizes = {
    small: '13px',
    medium: '15px',
    large: '17px',
    xlarge: '19px',
  }
  root.style.fontSize = sizes[size] || sizes.medium
}

export function resetSettings() {
  localStorage.removeItem(SETTINGS_KEY)
  applyFontSize('medium')
  return DEFAULT_SETTINGS
}