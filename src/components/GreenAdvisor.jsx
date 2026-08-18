import { useState } from 'react'
import { getGreenAdvice as fetchGreenAdvice, saveGreenAdvice, getGreenAdvice } from '../services/greenAdvisorService'
import { notify } from '../services/toast'

const FEASIBILITY_STYLES = {
  High: 'text-green-400 bg-green-950 border-green-800',
  Medium: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Low: 'text-red-400 bg-red-950 border-red-800',
}

const DIFFICULTY_STYLES = {
  Easy: 'text-green-400',
  Medium: 'text-yellow-400',
  Hard: 'text-red-400',
}

const ENERGY_ICONS = {
  'Solar': '☀️',
  'Wind': '💨',
  'Battery': '🔋',
  'USB': '🔌',
  'Kinetic': '⚙️',
  'Thermal': '🌡️',
  'RF Harvesting': '📡',
}

function GreenScoreMeter({ score }) {
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
  const label = score >= 75 ? 'Eco Friendly' : score >= 50 ? 'Moderate' : 'Needs Work'

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20 shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="35" fill="none" stroke="#1e1e2e" strokeWidth="6" />
          <circle cx="40" cy="40" r="35" fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={2 * Math.PI * 35}
            strokeDashoffset={2 * Math.PI * 35 * (1 - score / 100)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-lg font-black" style={{ color }}>{score}</p>
        </div>
      </div>
      <div>
        <p className="text-white font-bold text-lg" style={{ color }}>{label}</p>
        <p className="text-slate-500 text-xs">Green Score / 100</p>
      </div>
    </div>
  )
}

function GreenAdvisor({ idea, components }) {
  const [result, setResult] = useState(getGreenAdvice(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  async function handleAnalyse() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    try {
      const data = await fetchGreenAdvice(idea, components)
      setResult(data)
      saveGreenAdvice(idea, data)
      notify.success('Green analysis complete — score: ' + data.greenScore + '/100')
    } catch {
      notify.error('Analysis failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const TABS = [
    { id: 'overview', label: '🌿 Overview' },
    { id: 'energy', label: '⚡ Energy' },
    { id: 'optimize', label: '♻️ Optimize' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Analyse power consumption and get eco-friendly design recommendations</p>
        <button
          onClick={handleAnalyse}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-green-700 hover:bg-green-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0"
        >
          {loading ? '🌿 Analysing...' : '🌿 Green Analysis'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Analysing environmental impact...</p>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Green score */}
          <div className="bg-[#0d0d1a] border border-green-900 rounded-2xl p-5">
            <GreenScoreMeter score={result.greenScore || 0} />
            {result.carbonFootprint && (
              <p className="text-slate-400 text-xs mt-3">🌍 Carbon footprint: {result.carbonFootprint}</p>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id}
                  onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (
                    activeTab === tab.id ? 'bg-green-700 text-white' : 'text-slate-500 hover:text-white'
                  )}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-3">
              {/* Power consumption */}
              {result.powerConsumption && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">⚡ Power Consumption</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: 'Active', value: result.powerConsumption.active, color: 'text-red-400' },
                      { label: 'Sleep', value: result.powerConsumption.sleep, color: 'text-green-400' },
                      { label: 'Daily', value: result.powerConsumption.daily, color: 'text-blue-400' },
                    ].map(function(item) {
                      return (
                        <div key={item.label} className="bg-[#0d0d1a] rounded-lg p-2">
                          <p className={'font-bold text-sm ' + item.color}>{item.value || 'N/A'}</p>
                          <p className="text-slate-600 text-xs">{item.label}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Eco materials */}
              {result.ecoMaterials && result.ecoMaterials.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">🌱 Eco Material Alternatives</p>
                  <div className="space-y-2">
                    {result.ecoMaterials.map(function(item, i) {
                      return (
                        <div key={i} className="flex items-center gap-3 text-xs">
                          <p className="text-slate-400 flex-1">{item.component}</p>
                          <p className="text-red-400 line-through text-xs">{item.standard}</p>
                          <span className="text-slate-500">→</span>
                          <p className="text-green-400 font-medium">{item.eco}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'energy' && (
            <div className="space-y-2">
              {(result.energySources || []).map(function(source, i) {
                const feasStyle = FEASIBILITY_STYLES[source.feasibility] || FEASIBILITY_STYLES.Medium
                const icon = ENERGY_ICONS[source.source] || '⚡'
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{icon}</span>
                      <p className="text-white font-semibold text-sm flex-1">{source.source}</p>
                      <span className={'text-xs px-1.5 py-0.5 rounded border ' + feasStyle}>{source.feasibility}</span>
                      {source.output && <span className="text-green-400 text-xs font-mono">{source.output}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {source.pros && <p className="text-green-400">✓ {source.pros}</p>}
                      {source.cons && <p className="text-red-400">✗ {source.cons}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'optimize' && (
            <div className="space-y-2">
              {(result.optimizations || []).map(function(opt, i) {
                const diffColor = DIFFICULTY_STYLES[opt.difficulty] || DIFFICULTY_STYLES.Medium
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-semibold text-sm">{opt.title}</p>
                      <div className="flex items-center gap-2">
                        {opt.saving && <span className="text-green-400 text-xs">{opt.saving}</span>}
                        <span className={'text-xs ' + diffColor}>{opt.difficulty}</span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-xs">{opt.description}</p>
                  </div>
                )
              })}
            </div>
          )}

          <button onClick={handleAnalyse}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
            ↺ Re-analyse
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🌿</div>
          <p className="text-white font-semibold mb-1">Green Build Advisor</p>
          <p className="text-slate-500 text-sm">Analyse power consumption and get eco-friendly recommendations</p>
        </div>
      )}
    </div>
  )
}

export default GreenAdvisor