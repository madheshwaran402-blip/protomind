import { useState } from 'react'
import { analyzeComponentHealth, saveHealthData, getHealthData } from '../services/healthMonitorService'
import { notify } from '../services/toast'

function HealthBar({ score }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-[#1e1e2e] rounded-full h-2">
        <div className="h-2 rounded-full transition-all" style={{ width: score + '%', backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold w-16 shrink-0" style={{ color }}>{score}% {label}</span>
    </div>
  )
}

function ComponentHealthCard({ comp }) {
  const [expanded, setExpanded] = useState(false)
  const color = comp.healthScore >= 80 ? '#22c55e' : comp.healthScore >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
      <button
        onClick={function() { setExpanded(!expanded) }}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-[#1e1e2e] transition"
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0"
          style={{ backgroundColor: color + '20', color, border: '2px solid ' + color }}>
          {comp.healthScore}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">{comp.name}</p>
          <div className="flex gap-3 text-xs text-slate-500 flex-wrap">
            {comp.lifespan && <span>⏳ {comp.lifespan}</span>}
            {comp.maintenanceInterval && <span>🔧 {comp.maintenanceInterval}</span>}
          </div>
        </div>
        <span className="text-slate-600">{expanded ? '↑' : '↓'}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-3 bg-[#0d0d1a] border-t border-[#2e2e4e] pt-3 space-y-2">
          <HealthBar score={comp.healthScore} />
          {comp.failureMode && (
            <div className="bg-red-950 border border-red-900 rounded-lg p-2">
              <p className="text-red-400 text-xs font-semibold">⚠️ Failure Mode</p>
              <p className="text-red-200 text-xs">{comp.failureMode}</p>
            </div>
          )}
          {comp.warningTemperature && (
            <p className="text-orange-400 text-xs">🌡️ Warning temp: {comp.warningTemperature}</p>
          )}
          {comp.tips && comp.tips.length > 0 && (
            <ul className="space-y-1">
              {comp.tips.map(function(tip, i) {
                return (
                  <li key={i} className="text-slate-300 text-xs flex items-start gap-1">
                    <span className="text-green-400 shrink-0">→</span> {tip}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function HealthMonitor({ idea, components }) {
  const [result, setResult] = useState(getHealthData(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('components')

  async function handleAnalyze() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    try {
      const data = await analyzeComponentHealth(idea, components)
      setResult(data)
      saveHealthData(idea, data)
      notify.success('Health analysis complete!')
    } catch {
      notify.error('Analysis failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const TABS = [
    { id: 'components', label: '🔧 Components' },
    { id: 'maintenance', label: '🗓️ Schedule' },
    { id: 'parts', label: '🔄 Replace' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Analyse component health, lifespan and maintenance needs</p>
        <button
          onClick={handleAnalyze}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0"
        >
          {loading ? '💊 Analysing...' : '💊 Health Check'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Analysing component health...</p>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Overall health */}
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-4xl">
                {result.overallHealth >= 80 ? '💚' : result.overallHealth >= 60 ? '💛' : '❤️'}
              </span>
              <div className="flex-1">
                <p className="text-white font-bold">Overall Health: {result.overallHealth}/100</p>
                <HealthBar score={result.overallHealth} />
              </div>
            </div>
          </div>

          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id}
                  onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (
                    activeTab === tab.id ? 'bg-cyan-700 text-white' : 'text-slate-500 hover:text-white'
                  )}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'components' && (
            <div className="space-y-2">
              {(result.components || []).map(function(comp, i) {
                return <ComponentHealthCard key={comp.name || i} comp={comp} />
              })}
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-2">
              {(result.maintenanceSchedule || []).map(function(task, i) {
                const impColor = task.importance === 'High' ? 'text-red-400' :
                  task.importance === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 flex items-start gap-3">
                    <span className="text-xl shrink-0">🗓️</span>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{task.task}</p>
                      <div className="flex gap-3 text-xs mt-0.5">
                        <span className="text-slate-500">{task.frequency}</span>
                        <span className={impColor}>{task.importance} priority</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'parts' && (
            <div className="space-y-2">
              {(result.replacementParts || []).map(function(part, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-medium text-sm">{part.component}</p>
                      {part.estimatedCost && (
                        <span className="text-emerald-400 text-xs">{part.estimatedCost}</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs">{part.whenToReplace}</p>
                  </div>
                )
              })}
            </div>
          )}

          <button onClick={handleAnalyze}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
            ↺ Re-analyse
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">💊</div>
          <p className="text-white font-semibold mb-1">Component Health Monitor</p>
          <p className="text-slate-500 text-sm">Analyse lifespan, failure modes and maintenance schedule</p>
        </div>
      )}
    </div>
  )
}

export default HealthMonitor