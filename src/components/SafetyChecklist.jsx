import { useState } from 'react'
import { generateSafetyChecklist } from '../services/safetyChecker'
import { notify } from '../services/toast'

const SEVERITY_CONFIG = {
  Critical: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-900', icon: '🚨' },
  Warning: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-900', icon: '⚠️' },
  Info: { color: 'text-blue-400', bg: 'bg-blue-950', border: 'border-blue-900', icon: 'ℹ️' },
}

const RISK_CONFIG = {
  Low: { color: '#22c55e', bg: '#14293d', border: '#166534', icon: '✅', label: 'Low Risk' },
  Medium: { color: '#f59e0b', bg: '#2d2000', border: '#92400e', icon: '⚠️', label: 'Medium Risk' },
  High: { color: '#ef4444', bg: '#2d1b1b', border: '#991b1b', icon: '🔴', label: 'High Risk' },
  Critical: { color: '#a855f7', bg: '#1f1635', border: '#6b21a8', icon: '🚨', label: 'Critical Risk' },
}

function CheckItem({ check, onToggle }) {
  const sev = SEVERITY_CONFIG[check.severity] || SEVERITY_CONFIG.Info

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
        check.done
          ? 'bg-green-950 border-green-900 opacity-70'
          : sev.bg + ' ' + sev.border
      }`}
      onClick={() => onToggle(check.id)}
    >
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
        check.done
          ? 'bg-green-600 border-green-600'
          : 'border-slate-600'
      }`}>
        {check.done && <span className="text-white text-xs">✓</span>}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs">{sev.icon}</span>
          <p className={`text-sm font-medium ${check.done ? 'text-green-400 line-through' : 'text-white'}`}>
            {check.title}
          </p>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ml-auto ${sev.color} border ${sev.border} ${sev.bg}`}>
            {check.severity}
          </span>
        </div>
        <p className="text-xs text-slate-500">{check.description}</p>
        <p className="text-xs text-slate-600 mt-0.5">Category: {check.category}</p>
      </div>
    </div>
  )
}

function RiskMeter({ score }) {
  const colors = ['#22c55e', '#f59e0b', '#ef4444', '#a855f7']
  return (
    <div className="flex gap-1.5 items-center">
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="h-2 flex-1 rounded-full transition"
          style={{ backgroundColor: i <= score ? colors[score - 1] : '#1e1e2e' }}
        />
      ))}
      <span className="text-xs text-slate-500 ml-1 shrink-0">{score}/4</span>
    </div>
  )
}

function SafetyChecklist({ idea, components }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checks, setChecks] = useState([])
  const [showBefore, setShowBefore] = useState(false)
  const [showMistakes, setShowMistakes] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    setResult(null)
    setChecks([])
    try {
      const data = await generateSafetyChecklist(idea, components)
      setResult(data)
      setChecks(data.checks || [])
      if (data.overallRisk === 'Critical' || data.overallRisk === 'High') {
        notify.warning('High risk prototype — read safety checklist carefully!')
      } else {
        notify.success('Safety checklist generated!')
      }
    } catch {
      notify.error('Safety check failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function toggleCheck(id) {
    setChecks(prev => prev.map(c => c.id === id ? { ...c, done: !c.done } : c))
  }

  const doneCount = checks.filter(c => c.done).length
  const totalCount = checks.length
  const allDone = totalCount > 0 && doneCount === totalCount

  const riskConfig = result ? RISK_CONFIG[result.overallRisk] || RISK_CONFIG.Medium : null

  return (
    <div className="mt-6 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">🛡️ Safety Checklist</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            AI identifies risks and generates a pre-build safety checklist
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-5 py-2.5 bg-red-700 hover:bg-red-600 rounded-xl text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? '🛡️ Generating...' : '🛡️ Generate Checklist'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3">
          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is analysing safety risks...</p>
        </div>
      )}

      {result && !loading && riskConfig && (
        <div className="space-y-4">

          {/* Risk overview */}
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: riskConfig.bg, borderColor: riskConfig.border }}
          >
            <div className="flex items-center gap-4 mb-3">
              <span className="text-4xl">{riskConfig.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-xl font-black" style={{ color: riskConfig.color }}>
                    {riskConfig.label}
                  </h4>
                </div>
                <RiskMeter score={result.riskScore} />
              </div>
            </div>
            <p className="text-slate-300 text-sm">{result.verdict}</p>
          </div>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div className={`rounded-xl border p-4 ${allDone ? 'bg-green-950 border-green-900' : 'bg-[#13131f] border-[#2e2e4e]'}`}>
              <div className="flex justify-between items-center mb-2">
                <p className={`text-sm font-semibold ${allDone ? 'text-green-400' : 'text-white'}`}>
                  {allDone ? '✅ All safety checks passed!' : 'Safety Checks'}
                </p>
                <span className="text-xs text-slate-500">{doneCount}/{totalCount} completed</span>
              </div>
              <div className="w-full bg-[#1e1e2e] rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: (totalCount > 0 ? (doneCount / totalCount) * 100 : 0) + '%',
                    backgroundColor: allDone ? '#22c55e' : '#6366f1',
                  }}
                />
              </div>
            </div>
          )}

          {/* Checklist items grouped by severity */}
          {['Critical', 'Warning', 'Info'].map(severity => {
            const items = checks.filter(c => c.severity === severity)
            if (items.length === 0) return null
            const sev = SEVERITY_CONFIG[severity]
            return (
              <div key={severity}>
                <h4 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${sev.color}`}>
                  {sev.icon} {severity} ({items.length})
                </h4>
                <div className="space-y-2">
                  {items.map(check => (
                    <CheckItem key={check.id} check={check} onToggle={toggleCheck} />
                  ))}
                </div>
              </div>
            )
          })}

          {/* Before powering on */}
          {result.beforePowerOn?.length > 0 && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setShowBefore(!showBefore)}
              >
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  ⚡ Before Powering On ({result.beforePowerOn.length} steps)
                </h4>
                <span className="text-slate-600 text-xs">{showBefore ? '↑' : '↓'}</span>
              </div>
              {showBefore && (
                <ul className="mt-3 space-y-2">
                  {result.beforePowerOn.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-indigo-400 shrink-0 font-bold">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Common mistakes */}
          {result.commonMistakes?.length > 0 && (
            <div className="bg-red-950 border border-red-900 rounded-xl p-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setShowMistakes(!showMistakes)}
              >
                <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wide">
                  ❌ Common Mistakes to Avoid ({result.commonMistakes.length})
                </h4>
                <span className="text-red-700 text-xs">{showMistakes ? '↑' : '↓'}</span>
              </div>
              {showMistakes && (
                <ul className="mt-3 space-y-2">
                  {result.commonMistakes.map((mistake, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-300">
                      <span className="shrink-0 mt-0.5">→</span>
                      {mistake}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default SafetyChecklist