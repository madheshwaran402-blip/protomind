const SETTINGS_KEY = 'protomind_settings'

export const DEFAULT_SETTINGS = {
  theme: 'dark',
  aiModel: 'llama3.2',
  defaultCategory: 'All',
  showPrices: true,
  autoValidate: false,
  language: 'English',
  ollamaUrl: 'http://localhost:11434',
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
}

export function resetSettings() {
  localStorage.removeItem(SETTINGS_KEY)
  return DEFAULT_SETTINGS
}