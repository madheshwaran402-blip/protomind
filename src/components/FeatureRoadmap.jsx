import { useState } from 'react'
import { buildFeatureRoadmap, saveRoadmap, getRoadmap } from '../services/featureRoadmapService'
import { notify } from '../services/toast'

const PHASE_COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#a855f7']
const PRIORITY_STYLES = {
  High: 'text-red-400 bg-red-950 border-red-800',
  Medium: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Low: 'text-green-400 bg-green-950 border-green-800',
}
const EFFORT_STYLES = {
  High: 'text-orange-400',
  Medium: 'text-yellow-400',
  Low: 'text-green-400',
}

function FeatureRoadmap({ idea, components }) {
  const [roadmap, setRoadmap] = useState(getRoadmap(idea))
  const [loading, setLoading] = useState(false)
  const [activePhase, setActivePhase] = useState(0)
  const [completed, setCompleted] = useState({})

  async function handleBuild() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await buildFeatureRoadmap(idea, components)
      setRoadmap(data)
      saveRoadmap(idea, data)
      notify.success('Feature roadmap ready!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function toggleFeature(phaseIdx, featIdx) {
    const key = phaseIdx + '_' + featIdx
    setCompleted(function(prev) {
      const next = Object.assign({}, prev)
      next[key] = !next[key]
      return next
    })
  }

  const phases = roadmap?.phases || []
  const totalFeatures = phases.flatMap(function(p) { return p.features || [] }).length
  const completedCount = Object.values(completed).filter(Boolean).length

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Build a phased product roadmap with features, priorities and effort estimates</p>
        <button onClick={handleBuild} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-purple-700 hover:bg-purple-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Building...' : 'Build Roadmap'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Building feature roadmap...</p>
        </div>
      )}

      {roadmap && !loading && (
        <>
          <div className="bg-purple-950 border border-purple-800 rounded-xl p-4">
            <p className="text-white font-black text-lg">{roadmap.productName}</p>
            <p className="text-slate-400 text-xs mt-0.5">{roadmap.vision}</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 bg-[#1e1e2e] rounded-full h-1.5">
                <div className="h-1.5 bg-purple-600 rounded-full transition-all"
                  style={{ width: totalFeatures > 0 ? (completedCount / totalFeatures * 100) + '%' : '0%' }} />
              </div>
              <span className="text-purple-400 text-xs">{completedCount}/{totalFeatures}</span>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1">
            {phases.map(function(phase, i) {
              const color = PHASE_COLORS[i % PHASE_COLORS.length]
              const phaseDone = (phase.features || []).filter(function(f, j) { return completed[i + '_' + j] }).length
              return (
                <button key={i} onClick={function() { setActivePhase(i) }}
                  className={'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition text-left ' + (activePhase === i ? 'text-white' : 'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')}
                  style={activePhase === i ? { backgroundColor: color } : {}}>
                  <p>Phase {phase.phase}</p>
                  <p className="opacity-70">{phaseDone}/{(phase.features || []).length}</p>
                </button>
              )
            })}
          </div>

          {phases[activePhase] && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PHASE_COLORS[activePhase % PHASE_COLORS.length] }} />
                <p className="text-white font-bold">{phases[activePhase].name}</p>
                <span className="text-slate-500 text-xs">{phases[activePhase].duration}</span>
                <span className="text-slate-600 text-xs">{phases[activePhase].theme}</span>
              </div>

              <div className="space-y-2">
                {(phases[activePhase].features || []).map(function(feature, j) {
                  const key = activePhase + '_' + j
                  const done = !!completed[key]
                  const priStyle = PRIORITY_STYLES[feature.priority] || PRIORITY_STYLES.Medium
                  const effortColor = EFFORT_STYLES[feature.effort] || EFFORT_STYLES.Medium
                  return (
                    <div key={j} onClick={function() { toggleFeature(activePhase, j) }}
                      className={'rounded-xl border p-4 cursor-pointer transition ' + (done ? 'bg-[#0d0d1a] border-[#1e1e2e] opacity-50' : 'bg-[#13131f] border-[#2e2e4e] hover:border-purple-700')}>
                      <div className="flex items-start gap-3">
                        <div className={'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ' + (done ? 'bg-green-600 border-green-500' : 'border-[#2e2e4e]')}>
                          {done && <span className="text-white text-xs">v</span>}
                        </div>
                        <div className="flex-1">
                          <p className={'text-sm font-semibold ' + (done ? 'line-through text-slate-500' : 'text-white')}>{feature.name}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{feature.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={'text-xs px-1.5 py-0.5 rounded border ' + priStyle}>{feature.priority}</span>
                          {feature.effort && <span className={'text-xs ' + effortColor}>{feature.effort} effort</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <button onClick={handleBuild} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Rebuild Roadmap</button>
        </>
      )}

      {!roadmap && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-white font-semibold mb-1">Feature Roadmap Builder</p>
          <p className="text-slate-500 text-sm">Build a phased roadmap with features, priorities and effort tracking</p>
        </div>
      )}
    </div>
  )
}

export default FeatureRoadmap
