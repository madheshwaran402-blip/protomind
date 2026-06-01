import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getSettings,
  saveSettings,
  resetSettings,
  applyFontSize,
  getStorageUsage,
  clearAllData,
} from '../services/settingsService'
import { notify } from '../services/toast'

const OLLAMA_MODELS = [
  { value: 'llama3.2', label: 'Llama 3.2 (Recommended)', desc: 'Best balance of speed and quality' },
  { value: 'llama3.1', label: 'Llama 3.1', desc: 'Slightly older but very capable' },
  { value: 'mistral', label: 'Mistral 7B', desc: 'Fast and efficient' },
  { value: 'codellama', label: 'Code Llama', desc: 'Optimised for code generation' },
  { value: 'gemma2', label: 'Gemma 2', desc: 'Google open model' },
  { value: 'phi3', label: 'Phi 3 Mini', desc: 'Very fast, smaller model' },
]

const FONT_SIZES = [
  { value: 'small', label: 'Small', size: '14px' },
  { value: 'medium', label: 'Medium', size: '16px' },
  { value: 'large', label: 'Large', size: '18px' },
  { value: 'xlarge', label: 'X-Large', size: '20px' },
]

const KEYBOARD_SHORTCUTS = [
  { keys: '⌘K', action: 'Open Command Palette' },
  { keys: '⌘S', action: 'Save current prototype' },
  { keys: '⌘/', action: 'Open Help' },
  { keys: 'Esc', action: 'Close modals and panels' },
  { keys: '?', action: 'Show keyboard shortcuts' },
  { keys: '⌘Z', action: 'Undo last action' },
  { keys: '⌘⇧Z', action: 'Redo last action' },
  { keys: '⌘E', action: 'Export current view' },
]

function SettingRow({ label, desc, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-[#1e1e2e] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium">{label}</p>
        {desc && <p className="text-slate-500 text-xs mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={function() { onChange(!value) }}
      className={'relative w-11 h-6 rounded-full transition-colors ' + (value ? 'bg-indigo-600' : 'bg-[#2e2e4e]')}
    >
      <div className={'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ' + (value ? 'left-6' : 'left-1')} />
    </button>
  )
}

function SectionTitle({ icon, title, desc }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <h3 className="text-white font-bold text-base">{title}</h3>
      </div>
      {desc && <p className="text-slate-500 text-xs mt-1">{desc}</p>}
    </div>
  )
}

function Settings() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState(getSettings())
  const [activeTab, setActiveTab] = useState('ai')
  const [storageInfo, setStorageInfo] = useState(getStorageUsage())
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [saved, setSaved] = useState(false)

  function update(key, value) {
    const next = { ...settings, [key]: value }
    setSettings(next)
    saveSettings(next)
    if (key === 'fontSize') applyFontSize(value)
    setSaved(true)
    setTimeout(function() { setSaved(false) }, 1500)
  }

  function updateNested(section, key, value) {
    const next = {
      ...settings,
      [section]: { ...(settings[section] || {}), [key]: value },
    }
    setSettings(next)
    saveSettings(next)
    setSaved(true)
    setTimeout(function() { setSaved(false) }, 1500)
  }

  async function testOllamaConnection() {
    setTestingConnection(true)
    setConnectionStatus(null)
    try {
      const response = await fetch(settings.ollamaUrl + '/api/tags', {
        signal: AbortSignal.timeout(5000),
      })
      if (response.ok) {
        const data = await response.json()
        const models = (data.models || []).map(function(m) { return m.name }).join(', ')
        setConnectionStatus({ ok: true, message: 'Connected! Models: ' + (models || 'none found') })
        notify.success('Ollama connected!')
      } else {
        setConnectionStatus({ ok: false, message: 'Connected but got error: ' + response.status })
      }
    } catch {
      setConnectionStatus({ ok: false, message: 'Cannot connect — is Ollama running? Run: ollama serve' })
      notify.error('Cannot connect to Ollama')
    } finally {
      setTestingConnection(false)
    }
  }

  function handleReset() {
    const defaults = resetSettings()
    setSettings(defaults)
    applyFontSize(defaults.fontSize)
    notify.success('Settings reset to defaults')
  }

  function handleClearData() {
    const count = clearAllData()
    setShowClearConfirm(false)
    setStorageInfo(getStorageUsage())
    notify.success('Cleared ' + count + ' data items')
    setTimeout(function() { window.location.reload() }, 1000)
  }

  const TABS = [
    { id: 'ai', label: '🤖 AI', fullLabel: 'AI Model' },
    { id: 'display', label: '🎨 Display', fullLabel: 'Display' },
    { id: 'notifications', label: '🔔 Alerts', fullLabel: 'Notifications' },
    { id: 'shortcuts', label: '⌨️ Keys', fullLabel: 'Shortcuts' },
    { id: 'data', label: '💾 Data', fullLabel: 'Data' },
    { id: 'about', label: 'ℹ️ About', fullLabel: 'About' },
  ]

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">⚙️ Settings</h2>
          <p className="text-slate-400 text-sm">Customise ProtoMind to your preferences</p>
        </div>
        {saved && (
          <span className="text-green-400 text-sm font-semibold animate-pulse">✅ Saved</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(function(tab) {
          return (
            <button
              key={tab.id}
              onClick={function() { setActiveTab(tab.id) }}
              className={'flex-1 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap min-w-fit px-2 ' + (
                activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
              )}
            >
              <span className="sm:hidden">{tab.label}</span>
              <span className="hidden sm:inline">{tab.fullLabel}</span>
            </button>
          )
        })}
      </div>

      <div className="max-w-2xl">

        {/* AI Tab */}
        {activeTab === 'ai' && (
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
            <SectionTitle icon="🤖" title="AI Model Settings" desc="Configure which Ollama model powers ProtoMind" />

            <SettingRow label="Ollama Server URL" desc="Where your local Ollama server is running">
              <input
                value={settings.ollamaUrl}
                onChange={function(e) { update('ollamaUrl', e.target.value) }}
                className="bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500 w-56"
              />
            </SettingRow>

            <SettingRow label="Test Connection" desc="Check if Ollama is running and reachable">
              <div className="flex items-center gap-2">
                {connectionStatus && (
                  <span className={connectionStatus.ok ? 'text-green-400 text-xs' : 'text-red-400 text-xs'}>
                    {connectionStatus.ok ? '✅' : '❌'}
                  </span>
                )}
                <button
                  onClick={testOllamaConnection}
                  disabled={testingConnection}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition disabled:opacity-50"
                >
                  {testingConnection ? 'Testing...' : 'Test'}
                </button>
              </div>
            </SettingRow>

            {connectionStatus && (
              <div className={'rounded-xl p-3 mb-4 text-xs ' + (connectionStatus.ok ? 'bg-green-950 text-green-300 border border-green-900' : 'bg-red-950 text-red-300 border border-red-900')}>
                {connectionStatus.message}
              </div>
            )}

            <SettingRow label="AI Model" desc="Select which model to use for all AI features">
              <select
                value={settings.aiModel}
                onChange={function(e) { update('aiModel', e.target.value) }}
                className="bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none w-48"
              >
                {OLLAMA_MODELS.map(function(model) {
                  return (
                    <option key={model.value} value={model.value}>{model.label}</option>
                  )
                })}
              </select>
            </SettingRow>

            <div className="mt-2 bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-2">Selected model info</p>
              {OLLAMA_MODELS.filter(function(m) { return m.value === settings.aiModel }).map(function(m) {
                return (
                  <div key={m.value}>
                    <p className="text-white text-sm font-medium">{m.label}</p>
                    <p className="text-slate-400 text-xs">{m.desc}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 bg-indigo-950 border border-indigo-900 rounded-xl p-4">
              <p className="text-indigo-400 text-xs font-semibold mb-2">💡 Don't have Ollama?</p>
              <p className="text-slate-400 text-xs mb-2">Install from ollama.com then run:</p>
              <code className="text-indigo-300 text-xs font-mono bg-[#0d0d1a] px-3 py-1.5 rounded-lg block">
                ollama pull llama3.2
              </code>
            </div>
          </div>
        )}

        {/* Display Tab */}
        {activeTab === 'display' && (
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
            <SectionTitle icon="🎨" title="Display Settings" desc="Customise how ProtoMind looks and feels" />

            <SettingRow label="Theme" desc="Choose your preferred colour scheme">
              <div className="flex gap-2">
                {['dark', 'light'].map(function(theme) {
                  return (
                    <button
                      key={theme}
                      onClick={function() { update('theme', theme) }}
                      className={'px-4 py-2 rounded-xl text-xs font-medium border transition capitalize ' + (
                        settings.theme === theme
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-[#13131f] text-slate-400 border-[#2e2e4e] hover:border-indigo-600'
                      )}
                    >
                      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                    </button>
                  )
                })}
              </div>
            </SettingRow>

            <SettingRow label="Font Size" desc="Adjust text size throughout the app">
              <div className="flex gap-1">
                {FONT_SIZES.map(function(fs) {
                  return (
                    <button
                      key={fs.value}
                      onClick={function() { update('fontSize', fs.value) }}
                      className={'px-3 py-1.5 rounded-lg text-xs border transition ' + (
                        settings.fontSize === fs.value
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-[#13131f] text-slate-400 border-[#2e2e4e] hover:border-indigo-600'
                      )}
                    >
                      {fs.label}
                    </button>
                  )
                })}
              </div>
            </SettingRow>

            <SettingRow label="Show Animations" desc="Enable page transitions and UI animations">
              <Toggle value={settings.showAnimations} onChange={function(v) { update('showAnimations', v) }} />
            </SettingRow>

            <SettingRow label="Compact Mode" desc="Reduce padding and spacing for more content">
              <Toggle value={settings.compactMode} onChange={function(v) { update('compactMode', v) }} />
            </SettingRow>

            <SettingRow label="Auto Save" desc="Automatically save prototypes as you build">
              <Toggle value={settings.autoSave} onChange={function(v) { update('autoSave', v) }} />
            </SettingRow>

            <SettingRow label="Default Page" desc="Which page to show when you first open ProtoMind">
              <select
                value={settings.defaultView}
                onChange={function(e) { update('defaultView', e.target.value) }}
                className="bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
              >
                <option value="home">Home</option>
                <option value="history">History</option>
                <option value="dashboard">Dashboard</option>
                <option value="templates">Templates</option>
              </select>
            </SettingRow>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
            <SectionTitle icon="🔔" title="Notification Settings" desc="Control what alerts and toasts you see" />

            <SettingRow label="Build Complete" desc="Show notification when AI finishes generating">
              <Toggle
                value={settings.notifications?.buildComplete !== false}
                onChange={function(v) { updateNested('notifications', 'buildComplete', v) }}
              />
            </SettingRow>

            <SettingRow label="Low Stock Alerts" desc="Alert when components are running low in inventory">
              <Toggle
                value={settings.notifications?.lowStock !== false}
                onChange={function(v) { updateNested('notifications', 'lowStock', v) }}
              />
            </SettingRow>

            <SettingRow label="Achievement Unlocked" desc="Show celebration when you earn an achievement">
              <Toggle
                value={settings.notifications?.achievements !== false}
                onChange={function(v) { updateNested('notifications', 'achievements', v) }}
              />
            </SettingRow>

            <SettingRow label="Tips and Suggestions" desc="Show helpful tips while you build">
              <Toggle
                value={settings.notifications?.tips !== false}
                onChange={function(v) { updateNested('notifications', 'tips', v) }}
              />
            </SettingRow>

            <div className="mt-4 bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-slate-500 text-xs">
                All notifications are in-app only. ProtoMind never sends emails or push notifications.
              </p>
            </div>
          </div>
        )}

        {/* Shortcuts Tab */}
        {activeTab === 'shortcuts' && (
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
            <SectionTitle icon="⌨️" title="Keyboard Shortcuts" desc="Speed up your workflow with keyboard shortcuts" />

            <SettingRow label="Enable Shortcuts" desc="Turn keyboard shortcuts on or off">
              <Toggle
                value={settings.shortcuts?.enabled !== false}
                onChange={function(v) { updateNested('shortcuts', 'enabled', v) }}
              />
            </SettingRow>

            <div className="mt-4 space-y-2">
              {KEYBOARD_SHORTCUTS.map(function(shortcut, i) {
                return (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[#1e1e2e] last:border-0">
                    <p className="text-slate-300 text-sm">{shortcut.action}</p>
                    <div className="flex gap-1">
                      {shortcut.keys.split('').map(function(key, j) {
                        if (key === '⌘' || key === '⇧') {
                          return (
                            <kbd key={j} className="text-xs text-slate-400 bg-[#13131f] border border-[#2e2e4e] px-2 py-1 rounded font-mono">
                              {key}
                            </kbd>
                          )
                        }
                        return null
                      })}
                      <kbd className="text-xs text-slate-400 bg-[#13131f] border border-[#2e2e4e] px-2 py-1 rounded font-mono">
                        {shortcut.keys.replace(/[⌘⇧]/g, '')}
                      </kbd>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Data Tab */}
        {activeTab === 'data' && (
          <div className="space-y-4">
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
              <SectionTitle icon="💾" title="Data & Storage" desc="Manage your local data storage" />

              <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white text-sm font-semibold">Storage Used</p>
                  <p className="text-indigo-400 font-bold">{storageInfo.totalKB} KB</p>
                </div>
                <div className="space-y-1">
                  {storageInfo.keys.sort(function(a, b) { return b.size - a.size }).map(function(k, i) {
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className="flex-1 bg-[#1e1e2e] rounded-full h-1.5">
                          <div
                            className="h-1.5 bg-indigo-600 rounded-full"
                            style={{ width: Math.min(100, (k.size / storageInfo.totalBytes) * 100) + '%' }}
                          />
                        </div>
                        <p className="text-slate-500 w-40 truncate">{k.key.replace('protomind_', '')}</p>
                        <p className="text-slate-600 w-14 text-right">{(k.size / 1024).toFixed(1)} KB</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <SettingRow label="Export Settings" desc="Download your settings as a JSON backup">
                <button
                  onClick={function() {
                    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = 'protomind_settings.json'
                    link.click()
                    URL.revokeObjectURL(url)
                    notify.success('Settings exported!')
                  }}
                  className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition"
                >
                  ⬇️ Export
                </button>
              </SettingRow>

              <SettingRow label="Reset Settings" desc="Restore all settings to their default values">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-yellow-900 hover:bg-yellow-800 text-yellow-300 rounded-xl text-xs transition"
                >
                  ↺ Reset
                </button>
              </SettingRow>
            </div>

            <div className="bg-red-950 border border-red-900 rounded-2xl p-6">
              <SectionTitle icon="🗑️" title="Danger Zone" desc="These actions cannot be undone" />

              <SettingRow label="Clear All Data" desc="Delete all projects, history, inventory, and settings">
                {showClearConfirm ? (
                  <div className="flex gap-2">
                    <button
                      onClick={function() { setShowClearConfirm(false) }}
                      className="px-3 py-2 bg-[#1e1e2e] text-slate-400 rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearData}
                      className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold"
                    >
                      Yes, Delete All
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={function() { setShowClearConfirm(true) }}
                    className="px-4 py-2 bg-red-900 hover:bg-red-800 text-red-300 rounded-xl text-xs transition"
                  >
                    🗑️ Clear All
                  </button>
                )}
              </SettingRow>
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
            <SectionTitle icon="ℹ️" title="About ProtoMind" desc="Version info and credits" />

            <div className="text-center py-4 mb-6">
              <div className="text-6xl mb-3">⚡</div>
              <h3 className="text-white font-black text-2xl mb-1">ProtoMind</h3>
              <p className="text-indigo-400 text-sm">AI Electronics Prototyping Platform</p>
              <p className="text-slate-500 text-xs mt-1">Day 119 Build · v1.19.0</p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Website', value: 'protomind-ten.vercel.app', icon: '🌐' },
                { label: 'GitHub', value: 'github.com/madheshwaran402-blip/protomind', icon: '📦' },
                { label: 'Built With', value: 'React, Vite, Tailwind, Three.js, Ollama', icon: '🔧' },
                { label: 'AI Engine', value: 'Ollama (local, private, free)', icon: '🤖' },
                { label: 'Storage', value: 'localStorage (all data stays on your device)', icon: '💾' },
              ].map(function(item) {
                return (
                  <div key={item.label} className="flex items-start gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
                    <span className="text-lg shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-slate-500 text-xs">{item.label}</p>
                      <p className="text-white text-sm">{item.value}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 bg-indigo-950 border border-indigo-900 rounded-xl p-4 text-center">
              <p className="text-indigo-400 text-sm font-semibold mb-1">🎊 Day 119 of 270</p>
              <p className="text-slate-400 text-xs">Building ProtoMind one day at a time</p>
              <div className="w-full bg-[#1e1e2e] rounded-full h-2 mt-3">
                <div
                  className="h-2 bg-indigo-600 rounded-full"
                  style={{ width: ((119 / 270) * 100).toFixed(1) + '%' }}
                />
              </div>
              <p className="text-slate-600 text-xs mt-1">{((119 / 270) * 100).toFixed(1)}% complete</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings