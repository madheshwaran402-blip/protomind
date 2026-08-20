import { useState } from 'react'
import { designThermalManagement, saveThermalDesign, getThermalDesign } from '../services/thermalManagementService'
import { notify } from '../services/toast'

const RISK_STYLES = {
  Low: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800', icon: '🟢' },
  Medium: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800', icon: '🟡' },
  High: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800', icon: '🔴' },
}

function ThermalManagement({ idea, components }) {
  const [result, setResult] = useState(getThermalDesign(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('hotspots')

  async function handleDesign() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await designThermalManagement(idea, components)
      setResult(data)
      saveThermalDesign(idea, data)
      notify.success('Thermal analysis complete!')
    } catch { notify.error('Design failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const riskStyle = result ? (RISK_STYLES[result.thermalRisk] || RISK_STYLES.Medium) : null
  const TABS = [{ id: 'hotspots', label: '🌡️ Hotspots' }, { id: 'cooling', label: '❄️ Cooling' }, { id: 'layout', label: '📐 PCB Layout' }, { id: 'monitor', label: '📊 Monitor' }]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Analyse thermal risks and design cooling solutions for your prototype</p>
        <button onClick={handleDesign} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-orange-700 hover:bg-orange-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? '🌡️ Analysing...' : '🌡️ Thermal Analysis'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Analysing thermal management...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className={'rounded-2xl border p-4 flex items-center gap-4 ' + riskStyle.bg + ' ' + riskStyle.border}>
            <span className="text-4xl">{riskStyle.icon}</span>
            <div>
              <p className={'font-black text-xl ' + riskStyle.color}>{result.thermalRisk} Thermal Risk</p>
              <p className="text-slate-400 text-xs">{(result.hotspots || []).length} hotspots identified</p>
            </div>
          </div>

          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 overflow-x-auto">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ' + (activeTab === tab.id ? 'bg-orange-700 text-white' : 'text-slate-500 hover:text-white')}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'hotspots' && (
            <div className="space-y-2">
              {(result.hotspots || []).map(function(spot, i) {
                const tempPct = Math.min(100, ((parseFloat(spot.estimatedTemp) || 25) / (parseFloat(spot.maxTemp) || 100)) * 100)
                const tempColor = tempPct > 80 ? '#ef4444' : tempPct > 60 ? '#f59e0b' : '#22c55e'
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🌡️</span>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">{spot.component}</p>
                        <div className="flex gap-3 text-xs">
                          <span style={{ color: tempColor }}>Est: {spot.estimatedTemp}</span>
                          <span className="text-slate-500">Max: {spot.maxTemp}</span>
                          {spot.risk && <span className="text-orange-400">{spot.risk} risk</span>}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-[#1e1e2e] rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: tempPct + '%', backgroundColor: tempColor }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'cooling' && (
            <div className="space-y-2">
              {(result.coolingOptions || []).map(function(option, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-white font-bold text-sm">❄️ {option.method}</p>
                      <div className="ml-auto flex gap-2 text-xs">
                        {option.effectiveness && <span className="text-green-400">{option.effectiveness}</span>}
                        {option.cost && <span className="text-yellow-400">{option.cost}</span>}
                      </div>
                    </div>
                    <p className="text-slate-400 text-xs mb-1">{option.description}</p>
                    {option.implementation && <p className="text-indigo-400 text-xs">💡 {option.implementation}</p>}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs text-slate-500 font-semibold mb-2">📐 PCB Thermal Layout Tips</p>
              <ul className="space-y-2">
                {(result.pcbLayout || []).map(function(tip, i) {
                  return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-orange-400 shrink-0">{i+1}.</span>{tip}</li>
                })}
              </ul>
            </div>
          )}

          {activeTab === 'monitor' && result.monitoring && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 space-y-2">
              <p className="text-xs text-slate-500 font-semibold">📊 Temperature Monitoring</p>
              {result.monitoring.sensor && <p className="text-white text-sm">Sensor: <span className="text-indigo-400">{result.monitoring.sensor}</span></p>}
              {result.monitoring.placement && <p className="text-slate-400 text-xs">Placement: {result.monitoring.placement}</p>}
              {result.monitoring.thresholds && (
                <div className="bg-[#0d0d1a] rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Thresholds</p>
                  <p className="text-white text-sm">{result.monitoring.thresholds}</p>
                </div>
              )}
            </div>
          )}

          <button onClick={handleDesign} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">↺ Re-analyse</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🌡️</div>
          <p className="text-white font-semibold mb-1">Thermal Management Designer</p>
          <p className="text-slate-500 text-sm">Identify hotspots and design cooling solutions for your prototype</p>
        </div>
      )}
    </div>
  )
}

export default ThermalManagement
