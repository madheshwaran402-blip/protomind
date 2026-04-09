import { useState } from 'react'
import { getSettings, saveSettings, resetSettings } from '../services/settings'
import { getAllProjects } from '../services/storage'
import { notify } from '../services/toast'

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-12 h-6 rounded-full transition-colors relative ${
        value ? 'bg-indigo-600' : 'bg-[#2e2e4e]'
      }`}
    >
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
        value ? 'left-6' : 'left-0.5'
      }`} />
    </button>
  )
}

function SettingRow({ label, desc, children }) {
  return (
    <div className="flex justify-between items-center py-4 border-b border-[#1e1e2e]">
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        {desc && <p className="text-slate-500 text-xs mt-0.5">{desc}</p>}
      </div>
      <div>{children}</div>
    </div>
  )
}

function SectionTitle({ title }) {
  return (
    <h3 className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mt-8 mb-2">
      {title}
    </h3>
  )
}

function Settings() {
  const [settings, setSettings] = useState(getSettings())
  const projects = getAllProjects()

  function update(key, value) {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    saveSettings(updated)
    notify.success('Setting saved!')
  }

  function handleReset() {
    const defaults = resetSettings()
    setSettings(defaults)
    notify.info('Settings reset to defaults')
  }

  const AI_MODELS = [
    { value: 'llama3.2', label: 'Llama 3.2 (Default)' },
    { value: 'llama3.1', label: 'Llama 3.1' },
    { value: 'mistral', label: 'Mistral 7B' },
    { value: 'codellama', label: 'CodeLlama' },
    { value: 'phi3', label: 'Phi-3 Mini (Fast)' },
  ]

  return (
    <div className="min-h-screen page-enter px-16 py-10 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-1">Settings</h2>
          <p className="text-slate-400 text-sm">Customise your ProtoMind experience</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Saved Projects', value: projects.length },
          { label: 'App Version', value: 'v1.0.0' },
          { label: 'AI Engine', value: 'Ollama' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-indigo-400">{stat.value}</p>
            <p className="text-slate-500 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl px-6">
        <SectionTitle title="Appearance" />
        <SettingRow label="Theme" desc="Choose between dark and light mode">
          <div className="flex gap-2">
            {['dark', 'light'].map(t => (
              <button
                key={t}
                onClick={() => update('theme', t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                  settings.theme === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#1e1e2e] text-slate-400 hover:text-white'
                }`}
              >
                {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </button>
            ))}
          </div>
        </SettingRow>

        <SectionTitle title="AI Configuration" />
        <SettingRow label="AI Model" desc="Choose which Ollama model to use">
          <select
            value={settings.aiModel}
            onChange={e => update('aiModel', e.target.value)}
            className="bg-[#1e1e2e] border border-[#2e2e4e] text-white text-xs rounded-lg px-3 py-2 outline-none"
          >
            {AI_MODELS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </SettingRow>

        <SettingRow label="Ollama Server URL" desc="Change if running Ollama on a different port">
          <input
            value={settings.ollamaUrl}
            onChange={e => update('ollamaUrl', e.target.value)}
            className="bg-[#1e1e2e] border border-[#2e2e4e] text-white text-xs rounded-lg px-3 py-2 outline-none w-48 font-mono"
          />
        </SettingRow>

        <SettingRow label="Auto Validate" desc="Automatically validate prototype when reaching 3D View">
          <Toggle value={settings.autoValidate} onChange={v => update('autoValidate', v)} />
        </SettingRow>

        <SectionTitle title="Display" />
        <SettingRow label="Show Component Prices" desc="Display estimated prices on component cards">
          <Toggle value={settings.showPrices} onChange={v => update('showPrices', v)} />
        </SettingRow>

        <SettingRow label="Language" desc="Interface language">
          <select
            value={settings.language}
            onChange={e => update('language', e.target.value)}
            className="bg-[#1e1e2e] border border-[#2e2e4e] text-white text-xs rounded-lg px-3 py-2 outline-none"
          >
            {['English', 'Tamil', 'Hindi', 'Spanish', 'French', 'German', 'Japanese'].map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </SettingRow>

        <SectionTitle title="Data" />
        <SettingRow label="Local Projects" desc={projects.length + ' projects saved on this device'}>
          <button
            onClick={() => {
              if (confirm('Delete all local projects? This cannot be undone.')) {
                localStorage.removeItem('protomind_projects')
                notify.success('All projects cleared')
                window.location.reload()
              }
            }}
            className="px-4 py-2 bg-red-950 hover:bg-red-900 border border-red-800 text-red-400 rounded-xl text-xs transition"
          >
            Clear All
          </button>
        </SettingRow>

        <SettingRow label="Export All Projects" desc="Download all your projects as a JSON backup">
          <button
            onClick={() => {
              const data = localStorage.getItem('protomind_projects') || '[]'
              const blob = new Blob([data], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = 'protomind_backup.json'
              link.click()
              URL.revokeObjectURL(url)
              notify.success('Backup downloaded!')
            }}
            className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition"
          >
            ⬇️ Export Backup
          </button>
        </SettingRow>

        <SectionTitle title="Reset" />
        <SettingRow label="Reset All Settings" desc="Restore all settings to their default values">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            Reset Defaults
          </button>
        </SettingRow>
      </div>

      <div className="mt-6 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">About ProtoMind</h3>
        <div className="space-y-2 text-xs text-slate-500">
          <p>Version 1.0.0 — Built with React, Three.js, Tauri & Ollama</p>
          <p>Running on: {navigator.platform}</p>
          <p>AI Engine: Local Ollama ({settings.aiModel})</p>
          <p
            className="text-indigo-500 cursor-pointer hover:text-indigo-300 transition"
            onClick={() => window.open('https://protomind-ten.vercel.app')}
          >
            🌐 protomind-ten.vercel.app
          </p>
        </div>
      </div>
    </div>
  )
}

export default Settings