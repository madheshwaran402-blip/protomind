import { useState } from 'react'
import { assessRisks, saveAssessment, getAssessment } from '../services/riskAssessmentService'
import { notify } from '../services/toast'

const RISK_STYLES = {
  Low: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800', icon: '✅' },
  Medium: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800', icon: '⚠️' },
  High: { color: 'text-orange-400', bg: 'bg-orange-950', border: 'border-orange-800', icon: '🔶' },
  Critical: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800', icon: '🚨' },
}

const CATEGORY_ICONS = {
  Electrical: '⚡',
  Thermal: '🔥',
  Mechanical: '⚙️',
  Software: '💻',
  Power: '🔋',
  Communication: '📡',
  General: '⚠️',
}

function RiskCard({ risk }) {
  const [expanded, setExpanded] = useState(false)
  const style = RISK_STYLES[risk.severity] || RISK_STYLES.Medium
  const catIcon = CATEGORY_ICONS[risk.category] || '⚠️'

  return (
    <div className={'border rounded-xl overflow-hidden ' + style.border}>
      <button
        onClick={function() { setExpanded(!expanded) }}
        className={'w-full flex items-center gap-3 p-3 text-left hover:opacity-90 transition ' + style.bg}
      >
        <span className="text-lg shrink-0">{catIcon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={'text-sm font-semibold ' + style.color}>{risk.title}</p>
            <span className={'text-xs px-1.5 py-0.5 rounded-full border ' + style.color + ' ' + style.bg + ' ' + style.border}>
              {risk.severity}
            </span>
          </div>
          <p className="text-slate-400 text-xs truncate">{risk.description}</p>
        </div>
        <span className="text-slate-600">{expanded ? '↑' : '↓'}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-3 bg-[#0d0d1a] border-t border-[#2e2e4e] pt-3 space-y-2">
          <p className="text-slate-300 text-xs">{risk.description}</p>
          {risk.mitigation && (
            <div className="bg-green-950 border border-green-900 rounded-lg p-2">
              <p className="text-green-400 text-xs font-semibold mb-1">🛡️ Mitigation</p>
              <p className="text-green-200 text-xs">{risk.mitigation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RiskAssessment({ idea, components }) {
  const [result, setResult] = useState(getAssessment(idea))
  const [loading, setLoading] = useState(false)
  const [checkedItems, setCheckedItems] = useState({})

  async function handleAssess() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    try {
      const data = await assessRisks(idea, components)
      setResult(data)
      saveAssessment(idea, data)
      notify.success('Risk assessment complete — ' + data.overallRisk + ' risk')
    } catch {
      notify.error('Assessment failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function toggleCheck(index) {
    setCheckedItems(function(prev) {
      const next = Object.assign({}, prev)
      next[index] = !next[index]
      return next
    })
  }

  const overallStyle = result ? (RISK_STYLES[result.overallRisk] || RISK_STYLES.Medium) : null
  const checkedCount = Object.values(checkedItems).filter(Boolean).length
  const totalChecklist = result?.safetyChecklist?.length || 0

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">AI analyses your prototype for electrical, thermal and safety risks</p>
        <button
          onClick={handleAssess}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-orange-700 hover:bg-orange-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0"
        >
          {loading ? '🛡️ Assessing...' : '🛡️ Assess Risks'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Analysing risks...</p>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Overall risk banner */}
          <div className={'rounded-2xl border p-5 flex items-center gap-4 ' + overallStyle.bg + ' ' + overallStyle.border}>
            <span className="text-4xl">{overallStyle.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className={'font-black text-xl ' + overallStyle.color}>{result.overallRisk} Risk</p>
                <span className={'text-sm font-bold ' + overallStyle.color}>Safety Score: {result.safetyScore}/100</span>
              </div>
              <div className="w-full bg-[#1e1e2e] rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: result.safetyScore + '%',
                    backgroundColor: result.safetyScore >= 80 ? '#22c55e' : result.safetyScore >= 60 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Risk list */}
          {result.risks && result.risks.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Identified Risks ({result.risks.length})</p>
              {result.risks.map(function(risk, i) {
                return <RiskCard key={risk.id || i} risk={risk} />
              })}
            </div>
          )}

          {/* Safety checklist */}
          {result.safetyChecklist && result.safetyChecklist.length > 0 && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-semibold text-sm">🛡️ Safety Checklist</p>
                <span className="text-xs text-slate-500">{checkedCount}/{totalChecklist} done</span>
              </div>
              <div className="w-full bg-[#1e1e2e] rounded-full h-1.5 mb-3">
                <div className="h-1.5 bg-green-600 rounded-full transition-all"
                  style={{ width: (checkedCount / Math.max(totalChecklist, 1) * 100) + '%' }} />
              </div>
              <div className="space-y-2">
                {result.safetyChecklist.map(function(item, i) {
                  return (
                    <div
                      key={i}
                      onClick={function() { toggleCheck(i) }}
                      className="flex items-center gap-3 cursor-pointer hover:bg-[#0d0d1a] rounded-lg p-1.5 transition"
                    >
                      <div className={'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ' + (
                        checkedItems[i] ? 'bg-green-600 border-green-500' : 'border-[#2e2e4e]'
                      )}>
                        {checkedItems[i] && <span className="text-white text-xs">✓</span>}
                      </div>
                      <p className={'text-xs flex-1 ' + (checkedItems[i] ? 'text-slate-500 line-through' : 'text-slate-300')}>
                        {item.item}
                      </p>
                      {item.critical && !checkedItems[i] && (
                        <span className="text-red-400 text-xs shrink-0">Critical</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
              <p className="text-indigo-400 text-xs font-semibold mb-2">💡 Recommendations</p>
              <ul className="space-y-1">
                {result.recommendations.map(function(rec, i) {
                  return (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-indigo-400 shrink-0">{i + 1}.</span>
                      <p className="text-slate-300">{rec}</p>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          <button onClick={handleAssess}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
            ↺ Re-assess
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🛡️</div>
          <p className="text-white font-semibold mb-1">Risk Assessment Tool</p>
          <p className="text-slate-500 text-sm">AI identifies electrical, thermal and safety risks</p>
        </div>
      )}
    </div>
  )
}

export default RiskAssessment