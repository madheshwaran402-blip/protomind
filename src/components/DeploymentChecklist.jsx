import { useState, useEffect } from 'react'
import {
  generateDeploymentChecklist,
  saveDeploymentState,
  getDeploymentState,
} from '../services/deploymentChecklistService'
import { notify } from '../services/toast'

const READINESS_LEVELS = [
  { min: 0, max: 25, label: 'Not Ready', color: '#ef4444', icon: '🔴' },
  { min: 25, max: 50, label: 'Early Stage', color: '#f59e0b', icon: '🟡' },
  { min: 50, max: 75, label: 'Getting Close', color: '#0ea5e9', icon: '🔵' },
  { min: 75, max: 95, label: 'Almost Ready', color: '#a855f7', icon: '🟣' },
  { min: 95, max: 101, label: 'LAUNCH READY!', color: '#22c55e', icon: '🟢' },
]

function getReadinessLevel(score) {
  return READINESS_LEVELS.find(function(l) { return score >= l.min && score < l.max }) || READINESS_LEVELS[0]
}

function DeploymentChecklist({ idea, components }) {
  const projectId = 'deploy_' + idea.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')
  const savedState = getDeploymentState(projectId)
  const [checklist, setChecklist] = useState(savedState?.checklist || null)
  const [checked, setChecked] = useState(savedState?.checked || {})
  const [loading, setLoading] = useState(false)
  const [expandedPhase, setExpandedPhase] = useState(0)

  const allItems = (checklist?.phases || []).flatMap(function(p) { return p.items || [] })
  const totalItems = allItems.length
  const checkedCount = Object.values(checked).filter(Boolean).length
  const criticalItems = allItems.filter(function(item) { return item.critical })
  const criticalDone = criticalItems.filter(function(item) { return checked[item.id] }).length
  const readinessScore = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0
  const readinessLevel = getReadinessLevel(readinessScore)
  const allCriticalDone = criticalItems.length > 0 && criticalDone === criticalItems.length

  useEffect(function() {
    saveDeploymentState(projectId, { checklist, checked })
  }, [checked, checklist])

  async function handleGenerate() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    setChecked({})
    try {
      const data = await generateDeploymentChecklist(idea, components)
      setChecklist(data)
      notify.success('Deployment checklist ready!')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function toggleItem(itemId) {
    setChecked(function(prev) {
      const next = Object.assign({}, prev)
      next[itemId] = !next[itemId]
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">AI generates a deployment readiness checklist for your prototype</p>
        <button
          onClick={handleGenerate}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-green-700 hover:bg-green-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0"
        >
          {loading ? '🚀 Building...' : '🚀 Generate Checklist'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Building deployment checklist...</p>
        </div>
      )}

      {checklist && !loading && (
        <>
          {/* Readiness meter */}
          <div
            className="rounded-2xl border p-5"
            style={{ backgroundColor: readinessLevel.color + '15', borderColor: readinessLevel.color + '40' }}
          >
            <div className="flex items-center gap-4 mb-3">
              <span className="text-4xl">{readinessLevel.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white font-black text-lg">{readinessLevel.label}</p>
                  <p className="font-black text-xl" style={{ color: readinessLevel.color }}>{readinessScore}%</p>
                </div>
                <div className="w-full bg-[#1e1e2e] rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{ width: readinessScore + '%', backgroundColor: readinessLevel.color }}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="text-white font-bold">{checkedCount}/{totalItems}</p>
                <p className="text-slate-500">Items Done</p>
              </div>
              <div>
                <p className={allCriticalDone ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                  {criticalDone}/{criticalItems.length}
                </p>
                <p className="text-slate-500">Critical Done</p>
              </div>
              <div>
                <p className="text-white font-bold">{totalItems - checkedCount}</p>
                <p className="text-slate-500">Remaining</p>
              </div>
            </div>
          </div>

          {/* Critical items warning */}
          {!allCriticalDone && criticalItems.length > 0 && (
            <div className="bg-red-950 border border-red-900 rounded-xl p-3">
              <p className="text-red-400 text-xs font-semibold">
                🚨 {criticalItems.length - criticalDone} critical items remaining — must complete before deployment
              </p>
            </div>
          )}

          {/* Phase accordion */}
          <div className="space-y-2">
            {(checklist.phases || []).map(function(phase, phaseIdx) {
              const phaseItems = phase.items || []
              const phaseDone = phaseItems.filter(function(item) { return checked[item.id] }).length
              const phaseComplete = phaseDone === phaseItems.length && phaseItems.length > 0
              const isExpanded = expandedPhase === phaseIdx

              return (
                <div key={phaseIdx} className={'rounded-xl border overflow-hidden ' + (phaseComplete ? 'border-green-800' : 'border-[#2e2e4e]')}>
                  <button
                    onClick={function() { setExpandedPhase(isExpanded ? -1 : phaseIdx) }}
                    className={'w-full flex items-center gap-3 p-4 text-left transition ' + (phaseComplete ? 'bg-green-950' : 'bg-[#13131f] hover:bg-[#1e1e2e]')}
                  >
                    <span className="text-xl shrink-0">{phase.icon}</span>
                    <div className="flex-1">
                      <p className={'font-semibold text-sm ' + (phaseComplete ? 'text-green-400' : 'text-white')}>
                        {phase.name}
                        {phaseComplete && ' ✓'}
                      </p>
                      <p className="text-slate-500 text-xs">{phaseDone}/{phaseItems.length} complete</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-[#1e1e2e] rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: (phaseDone / Math.max(phaseItems.length, 1) * 100) + '%',
                            backgroundColor: phaseComplete ? '#22c55e' : '#6366f1',
                          }}
                        />
                      </div>
                      <span className="text-slate-600">{isExpanded ? '↑' : '↓'}</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-3 bg-[#0d0d1a] border-t border-[#2e2e4e] pt-3 space-y-2">
                      {phaseItems.map(function(item) {
                        return (
                          <div
                            key={item.id}
                            onClick={function() { toggleItem(item.id) }}
                            className="flex items-center gap-3 cursor-pointer hover:bg-[#13131f] rounded-lg p-1.5 transition"
                          >
                            <div className={'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ' + (
                              checked[item.id] ? 'bg-green-600 border-green-500' : 'border-[#2e2e4e]'
                            )}>
                              {checked[item.id] && <span className="text-white text-xs">✓</span>}
                            </div>
                            <p className={'text-xs flex-1 ' + (checked[item.id] ? 'text-slate-500 line-through' : 'text-slate-300')}>
                              {item.text}
                            </p>
                            {item.critical && !checked[item.id] && (
                              <span className="text-red-400 text-xs shrink-0">⚠️</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {readinessScore === 100 && (
            <div className="bg-green-950 border border-green-700 rounded-2xl p-5 text-center">
              <p className="text-4xl mb-2">🚀</p>
              <p className="text-green-400 font-black text-xl">LAUNCH READY!</p>
              <p className="text-slate-400 text-sm">All items complete — your prototype is ready to deploy!</p>
            </div>
          )}

          <button onClick={handleGenerate}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
            ↺ Regenerate Checklist
          </button>
        </>
      )}

      {!checklist && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🚀</div>
          <p className="text-white font-semibold mb-1">Deployment Checklist</p>
          <p className="text-slate-500 text-sm">AI generates a launch readiness checklist for your prototype</p>
        </div>
      )}
    </div>
  )
}

export default DeploymentChecklist