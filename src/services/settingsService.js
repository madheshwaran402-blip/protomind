const SETTINGS_KEY = 'protomind_settings'

export const DEFAULT_SETTINGS = {
  aiModel: 'llama3.2',
  ollamaUrl: 'http://localhost:11434',
  theme: 'dark',
  fontSize: 'medium',
  language: 'en',
  autoSave: true,
  showAnimations: true,
  compactMode: false,
  defaultView: 'home',
  notifications: {
    buildComplete: true,
    lowStock: true,
    achievements: true,
    tips: true,
  },
  privacy: {
    shareAnalytics: false,
    publicProfile: false,
  },
  shortcuts: {
    enabled: true,
  },
  export: {
    defaultFormat: 'pdf',
    includeTimestamp: true,
  },
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const saved = JSON.parse(raw)
    return { ...DEFAULT_SETTINGS, ...saved, notifications: { ...DEFAULT_SETTINGS.notifications, ...(saved.notifications || {}) }, privacy: { ...DEFAULT_SETTINGS.privacy, ...(saved.privacy || {}) } }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {}
}

export function updateSetting(key, value) {
  const settings = getSettings()
  settings[key] = value
  saveSettings(settings)
  return settings
}

export function updateNestedSetting(section, key, value) {
  const settings = getSettings()
  if (!settings[section]) settings[section] = {}
  settings[section][key] = value
  saveSettings(settings)
  return settings
}

export function resetSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS))
  return { ...DEFAULT_SETTINGS }
}

export function applyFontSize(size) {
  const sizes = { small: '14px', medium: '16px', large: '18px', xlarge: '20px' }
  document.documentElement.style.fontSize = sizes[size] || '16px'
}

export function getStorageUsage() {
  let total = 0
  const keys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('protomind_')) {
      const val = localStorage.getItem(key) || ''
      total += val.length * 2
      keys.push({ key, size: val.length * 2 })
    }
  }
  return { totalBytes: total, totalKB: (total / 1024).toFixed(1), keys }
}

export function clearAllData() {
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('protomind_')) keysToRemove.push(key)
  }
  keysToRemove.forEach(function(key) { localStorage.removeItem(key) })
  return keysToRemove.length
}