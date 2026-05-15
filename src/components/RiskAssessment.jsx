import { useState } from 'react'
import { assessRisks } from '../services/riskAssessmentService'
import { notify } from '../services/toast'

const RISK_LEVEL_STYLES = {
  Low: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800', icon: '🟢' },
  Medium: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800', icon: '🟡' },
  High: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800', icon: '🔴' },
  Critical: { color: 'text-red-600', bg: 'bg-red-950', border: 'border-red-700', icon: '🚨' },
}

const CATEGORY_ICONS = {
  technical: '⚙️',
  safety: '🛡️',
  regulatory: '📋',
  financial: '💰',
  schedule: '📅',
}

const CATEGORY_COLORS = {
  technical: 'text-indigo-400 bg-indigo-950 border-indigo-800',
  safety: 'text-red-400 bg-red-950 border-red-800',
  regulatory: 'text-blue-400 bg-blue-950 border-blue-800',
  financial: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  schedule: 'text-purple-400 bg-purple-950 border-purple-800',
}

function RiskMeter({ score }) {
  const color = score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#22c55e'
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#1e1e2e" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="40"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="text-center">
        <p className="text-2xl font-black" style={{ color }}>{score}</p>
        <p className="text-slate-600 text-xs">/ 100</p>
      </div>
    </div>
  )
}

function RiskCard({ risk }) {
  const [expanded, setExpanded] = useState(false)
  const sevStyle = RISK_LEVEL_STYLES[risk.severity] || RISK_LEVEL_STYLES.Medium
  const catClass = CATEGORY_COLORS[risk.category] || 'text-slate-400 bg-slate-900 border-slate-700'
  const catIcon = CATEGORY_ICONS[risk.category] || '⚠️'

  return (
    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
      <button
        onClick={function() { setExpanded(!expanded) }}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-[#1e1e2e] transition"
      >
        <span className="text-xl shrink-0 mt-0.5">{sevStyle.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-white text-sm font-semibold">{risk.title}</p>
            <span className={'text-xs px-2 py-0.5 rounded-full border ' + catClass}>
              {catIcon} {risk.category}
            </span>
          </div>
          <div className="flex gap-3 text-xs">
            <span className={sevStyle.color}>Severity: {risk.severity}</span>
            {risk.likelihood && (
              <span className="text-slate-500">Likelihood: {risk.likelihood}</span>
            )}
          </div>
        </div>
        <span className="text-slate-600 shrink-0">{expanded ? '↑' : '↓'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-[#2e2e4e] pt-3">
          <p className="text-slate-300 text-sm leading-relaxed">{risk.description}</p>

          {risk.impact && (
            <div className="bg-[#0d0d1a] rounded-lg p-3">
              <p className="text-xs text-slate-500 font-semibold mb-1">Impact</p>
              <p className="text-slate-300 text-sm">{risk.impact}</p>
            </div>
          )}

          {risk.mitigation && (
            <div className="bg-green-950 border border-green-900 rounded-lg p-3">
              <p className="text-xs text-green-400 font-semibold mb-1">Mitigation Strategy</p>
              <p className="text-slate-300 text-sm">{risk.mitigation}</p>
            </div>
          )}

          {risk.status && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs">Status:</span>
              <span className={
                risk.status === 'Mitigated' ? 'text-xs text-green-400' :
                risk.status === 'Accepted' ? 'text-xs text-yellow-400' :
                'text-xs text-red-400'
              }>{risk.status}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RiskAssessment({ idea, components }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('risks')
  const [filterCategory, setFilterCategory] = useState('all')

  async function handleAssess() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const data = await assessRisks(idea, components)
      setResult(data)
      const style = RISK_LEVEL_STYLES[data.overallRiskLevel] || RISK_LEVEL_STYLES.Medium
      notify.success('Risk assessment complete — ' + data.overallRiskLevel + ' risk level')
    } catch {
      notify.error('Assessment failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const TABS = [
    { id: 'risks', label: '⚠️ Risks' },
    { id: 'compliance', label: '📋 Compliance' },
    { id: 'testing', label: '🧪 Testing' },
  ]

  const filteredRisks = result ? (result.risks || []).filter(function(r) {
    return filterCategory === 'all' || r.category === filterCategory
  }) : []

  const overallStyle = result ? (RISK_LEVEL_STYLES[result.overallRiskLevel] || RISK_LEVEL_STYLES.Medium) : null

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <p className="text-slate-400 text-sm">
          AI identifies technical, safety, and regulatory risks for your prototype
        </p>
        <button
          onClick={handleAssess}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-orange-700 hover:bg-orange-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0 ml-4"
        >
          {loading ? '🔍 Assessing...' : '🔍 Assess Risks'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is analysing risks...</p>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Overall risk banner */}
          <div className={'rounded-2xl border p-5 flex items-center gap-6 ' + overallStyle.bg + ' ' + overallStyle.border}>
            <RiskMeter score={result.riskScore || 0} />
            <div className="flex-1">
              <p className={'font-black text-xl mb-1 ' + overallStyle.color}>
                {overallStyle.icon} {result.overallRiskLevel} Risk
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">{result.summary}</p>
            </div>
          </div>

          {/* Category summary */}
          {result.categories && (
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(result.categories).map(function(entry) {
                const cat = entry[0]
                const count = entry[1]
                const catClass = CATEGORY_COLORS[cat] || 'text-slate-400 bg-slate-900 border-slate-700'
                const icon = CATEGORY_ICONS[cat] || '⚠️'
                return (
                  <button
                    key={cat}
                    onClick={function() { setFilterCategory(filterCategory === cat ? 'all' : cat) }}
                    className={'rounded-xl border p-2 text-center transition ' + (
                      filterCategory === cat ? catClass : 'bg-[#13131f] border-[#2e2e4e]'
                    )}
                  >
                    <p className="text-lg">{icon}</p>
                    <p className="text-white text-sm font-bold">{count || 0}</p>
                    <p className="text-slate-600 text-xs capitalize">{cat}</p>
                  </button>
                )
              })}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button
                  key={tab.id}
                  onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (
                    activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Risks tab */}
          {activeTab === 'risks' && (
            <div className="space-y-2">
              {filterCategory !== 'all' && (
                <div className="flex items-center gap-2">
                  <p className="text-slate-500 text-xs">Filtering by: {filterCategory}</p>
                  <button
                    onClick={function() { setFilterCategory('all') }}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Clear filter
                  </button>
                </div>
              )}
              {filteredRisks.length > 0 ? (
                filteredRisks
                  .sort(function(a, b) {
                    const order = { Critical: 0, High: 1, Medium: 2, Low: 3 }
                    return (order[a.severity] || 3) - (order[b.severity] || 3)
                  })
                  .map(function(risk, i) {
                    return <RiskCard key={risk.id || i} risk={risk} />
                  })
              ) : (
                <p className="text-center text-slate-600 text-sm py-6">No risks in this category</p>
              )}

              {result.recommendations && result.recommendations.length > 0 && (
                <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4 mt-2">
                  <p className="text-indigo-400 text-xs font-semibold mb-2">💡 Key Recommendations</p>
                  <ul className="space-y-1">
                    {result.recommendations.map(function(rec, i) {
                      return (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-indigo-400 shrink-0">{i + 1}.</span>
                          <p className="text-slate-300">{rec}</p>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Compliance tab */}
          {activeTab === 'compliance' && (
            <div className="space-y-2">
              {(result.complianceChecks || []).length === 0 ? (
                <p className="text-center text-slate-600 text-sm py-6">No compliance checks generated</p>
              ) : (
                result.complianceChecks.map(function(check, i) {
                  return (
                    <div key={i} className={'flex items-start gap-3 rounded-xl border p-4 ' + (
                      check.required ? 'bg-red-950 border-red-900' : 'bg-[#13131f] border-[#2e2e4e]'
                    )}>
                      <span className="text-xl shrink-0">
                        {check.required ? '🔴' : '🟡'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white text-sm font-semibold">{check.standard}</p>
                          {check.required && (
                            <span className="text-xs bg-red-900 text-red-300 border border-red-700 px-2 py-0.5 rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-xs">{check.description}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Testing tab */}
          {activeTab === 'testing' && (
            <div className="space-y-2">
              <p className="text-slate-500 text-xs mb-2">
                Required tests before considering this prototype production-ready
              </p>
              {(result.testingRequired || []).map(function(test, i) {
                return (
                  <div key={i} className="flex items-start gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3">
                    <div className="w-5 h-5 rounded border-2 border-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-slate-600 text-xs">○</span>
                    </div>
                    <p className="text-slate-300 text-sm">{test}</p>
                  </div>
                )
              })}
            </div>
          )}

          <button
            onClick={handleAssess}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Re-assess
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">🛡️</div>
          <p className="text-white font-semibold mb-1">Risk Assessment Tool</p>
          <p className="text-slate-500 text-sm mb-4">
            Identify technical, safety and regulatory risks before building
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ Risk scoring</span>
            <span>✓ By category</span>
            <span>✓ Compliance checks</span>
            <span>✓ Testing checklist</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default RiskAssessment