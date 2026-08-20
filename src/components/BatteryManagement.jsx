import { useState } from 'react'
import { designBatterySystem, saveBatteryDesign, getBatteryDesign } from '../services/batteryManagementService'
import { notify } from '../services/toast'

const RUNTIME_OPTIONS = ['2 hours', '4 hours', '8 hours', '12 hours', '24 hours', '48 hours', '1 week']
const FORM_FACTORS = ['portable handheld', 'wearable', 'desktop', 'outdoor', 'solar recharged', 'wall powered']

function BatteryManagement({ idea, components }) {
  const [result, setResult] = useState(getBatteryDesign(idea))
  const [loading, setLoading] = useState(false)
  const [runtime, setRuntime] = useState('8 hours')
  const [formFactor, setFormFactor] = useState('portable handheld')
  const [activeTab, setActiveTab] = useState('battery')

  async function handleDesign() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await designBatterySystem(idea, components, { runtime, formFactor })
      setResult(data)
      saveBatteryDesign(idea, data)
      notify.success('Battery system designed!')
    } catch { notify.error('Design failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const TABS = [{ id: 'battery', label: '🔋 Battery' }, { id: 'charging', label: '⚡ Charging' }, { id: 'runtime', label: '⏱️ Runtime' }, { id: 'power', label: '💤 Power Save' }]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-slate-500 mb-1">Target Runtime</p>
          <select value={runtime} onChange={function(e) { setRuntime(e.target.value) }}
            className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none">
            {RUNTIME_OPTIONS.map(function(r) { return <option key={r} value={r}>{r}</option> })}
          </select>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Form Factor</p>
          <select value={formFactor} onChange={function(e) { setFormFactor(e.target.value) }}
            className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none">
            {FORM_FACTORS.map(function(f) { return <option key={f} value={f}>{f}</option> })}
          </select>
        </div>
      </div>

      <button onClick={handleDesign} disabled={loading || components.length === 0}
        className="w-full py-3 bg-yellow-700 hover:bg-yellow-600 rounded-xl text-sm font-semibold transition disabled:opacity-50">
        {loading ? '🔋 Designing...' : '🔋 Design Battery System'}
      </button>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Designing battery management system...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 overflow-x-auto">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ' + (activeTab === tab.id ? 'bg-yellow-700 text-white' : 'text-slate-500 hover:text-white')}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'battery' && result.recommendedBattery && (
            <div className="space-y-3">
              <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-4">
                <p className="text-yellow-400 text-xs font-semibold mb-3">🔋 Recommended Battery</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Type', value: result.recommendedBattery.type },
                    { label: 'Capacity', value: result.recommendedBattery.capacity },
                    { label: 'Voltage', value: result.recommendedBattery.voltage },
                    { label: 'Chemistry', value: result.recommendedBattery.chemistry },
                    { label: 'Size', value: result.recommendedBattery.size },
                  ].map(function(item) {
                    return item.value ? (
                      <div key={item.label} className="bg-[#0d0d1a] rounded-lg p-2">
                        <p className="text-slate-500 text-xs">{item.label}</p>
                        <p className="text-white font-bold text-sm">{item.value}</p>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
              {result.schematic && (
                <div className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Circuit Description</p>
                  <p className="text-slate-300 text-xs font-mono">{result.schematic}</p>
                </div>
              )}
              {result.safetyFeatures && result.safetyFeatures.length > 0 && (
                <div className="bg-red-950 border border-red-900 rounded-xl p-4">
                  <p className="text-red-400 text-xs font-semibold mb-2">🛡️ Safety Features</p>
                  <ul className="space-y-1">
                    {result.safetyFeatures.map(function(f, i) {
                      return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-red-400">✓</span>{f}</li>
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'charging' && result.chargingSystem && (
            <div className="space-y-3">
              <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                <p className="text-xs text-slate-500 font-semibold mb-3">⚡ Charging System</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Charger IC', value: result.chargingSystem.chargerIC },
                    { label: 'Charge Time', value: result.chargingSystem.chargeTime },
                    { label: 'Charge Voltage', value: result.chargingSystem.chargingVoltage },
                  ].map(function(item) {
                    return item.value ? (
                      <div key={item.label} className="bg-[#0d0d1a] rounded-lg p-2">
                        <p className="text-slate-500 text-xs">{item.label}</p>
                        <p className="text-white text-sm font-bold">{item.value}</p>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
              {result.chargingSystem.protectionFeatures && result.chargingSystem.protectionFeatures.length > 0 && (
                <div className="bg-green-950 border border-green-800 rounded-xl p-4">
                  <p className="text-green-400 text-xs font-semibold mb-2">🛡️ Protection Features</p>
                  <ul className="space-y-1">
                    {result.chargingSystem.protectionFeatures.map(function(f, i) {
                      return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-green-400">✓</span>{f}</li>
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'runtime' && result.estimatedRuntime && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Normal Mode', value: result.estimatedRuntime.normal, color: '#6366f1' },
                  { label: 'Power Save', value: result.estimatedRuntime.powerSave, color: '#22c55e' },
                  { label: 'Worst Case', value: result.estimatedRuntime.worstCase, color: '#ef4444' },
                ].map(function(item) {
                  return (
                    <div key={item.label} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center">
                      <p className="text-xl font-black" style={{ color: item.color }}>{item.value || 'N/A'}</p>
                      <p className="text-slate-600 text-xs">{item.label}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'power' && result.powerManagement && (
            <div className="space-y-2">
              {result.powerManagement.map(function(tech, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-semibold text-sm">{tech.technique}</p>
                      {tech.saving && <span className="text-green-400 text-xs">{tech.saving}</span>}
                    </div>
                    <p className="text-slate-400 text-xs">{tech.description}</p>
                  </div>
                )
              })}
            </div>
          )}

          <button onClick={handleDesign} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">↺ Redesign</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🔋</div>
          <p className="text-white font-semibold mb-1">Battery Management System</p>
          <p className="text-slate-500 text-sm">Design a complete BMS with charging, protection and power management</p>
        </div>
      )}
    </div>
  )
}

export default BatteryManagement
