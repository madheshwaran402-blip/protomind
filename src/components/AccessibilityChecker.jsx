import { useState } from 'react'
import { checkAccessibility, saveAccessibilityReport, getAccessibilityReport } from '../services/accessibilityCheckerService'
import { notify } from '../services/toast'

const SEVERITY_STYLES = {
  Critical: 'text-red-400 bg-red-950 border-red-800',
  High: 'text-orange-400 bg-orange-950 border-orange-800',
  Medium: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Low: 'text-blue-400 bg-blue-950 border-blue-800',
}

function AccessibilityChecker({ idea, components }) {
  const [result, setResult] = useState(getAccessibilityReport(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('issues')

  async function handleCheck() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await checkAccessibility(idea, components)
      setResult(data)
      saveAccessibilityReport(idea, data)
      notify.success('Accessibility check complete - score: ' + data.accessibilityScore + '/100')
    } catch { notify.error('Check failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const scoreColor = result ? (result.accessibilityScore >= 75 ? '#22c55e' : result.accessibilityScore >= 50 ? '#f59e0b' : '#ef4444') : '#6366f1'
  const TABS = [{ id: 'issues', label: '⚠️ Issues' }, { id: 'improvements', label: '✨ Improve' }, { id: 'users', label: '👥 Users' }]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Check your prototype for accessibility and inclusive design issues</p>
        <button onClick={handleCheck} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-blue-700 hover:bg-blue-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? '♿ Checking...' : '♿ Check Accessibility'}
        </button>
      </div>
      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Checking accessibility...</p>
        </div>
      )}
      {result && !loading && (
        <>
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 flex items-center gap-5">
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" fill="none" stroke="#1e1e2e" strokeWidth="6" />
                <circle cx="40" cy="40" r="35" fill="none" stroke={scoreColor} strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 35}
                  strokeDashoffset={2 * Math.PI * 35 * (1 - result.accessibilityScore / 100)} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xl font-black" style={{ color: scoreColor }}>{result.accessibilityScore}</p>
              </div>
            </div>
            <div>
              <p className="text-white font-bold text-lg">Accessibility Score</p>
              <p className="text-slate-400 text-xs">{(result.issues || []).length} issues found</p>
            </div>
          </div>
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (activeTab === tab.id ? 'bg-blue-700 text-white' : 'text-slate-500 hover:text-white')}>
                  {tab.label}
                </button>
              )
            })}
          </div>
          {activeTab === 'issues' && (
            <div className="space-y-2">
              {result.positives && result.positives.length > 0 && (
                <div className="bg-green-950 border border-green-800 rounded-xl p-3">
                  <p className="text-green-400 text-xs font-semibold mb-1">✅ What Works Well</p>
                  {result.positives.map(function(p, i) { return <p key={i} className="text-slate-300 text-xs">• {p}</p> })}
                </div>
              )}
              {(result.issues || []).map(function(issue, i) {
                const style = SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.Low
                return (
                  <div key={i} className={'rounded-xl border p-4 ' + style.split(' ').slice(1).join(' ')}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={'text-xs px-1.5 py-0.5 rounded border ' + style}>{issue.severity}</span>
                      <p className="text-white text-xs font-semibold">{issue.category}</p>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">{issue.description}</p>
                    <div className="bg-[#0d0d1a] rounded-lg p-2">
                      <p className="text-green-400 text-xs">Solution: {issue.solution}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {activeTab === 'improvements' && (
            <div className="space-y-3">
              {(result.improvements || []).map(function(imp, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <p className="text-white font-semibold text-sm mb-1">{imp.feature}</p>
                    <p className="text-slate-400 text-xs mb-1">{imp.description}</p>
                    {imp.implementation && <p className="text-indigo-400 text-xs">💡 {imp.implementation}</p>}
                  </div>
                )
              })}
            </div>
          )}
          {activeTab === 'users' && (
            <div className="space-y-2">
              {(result.userGroups || []).map(function(group, i) {
                const impColor = group.impact === 'High' ? 'text-red-400' : group.impact === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-semibold text-sm">{group.group}</p>
                      <span className={'text-xs ' + impColor}>{group.impact} impact</span>
                    </div>
                    <p className="text-slate-400 text-xs">{group.recommendation}</p>
                  </div>
                )
              })}
            </div>
          )}
          <button onClick={handleCheck} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">↺ Re-check</button>
        </>
      )}
      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">♿</div>
          <p className="text-white font-semibold mb-1">Accessibility Checker</p>
          <p className="text-slate-500 text-sm">Check for inclusive design and accessibility issues</p>
        </div>
      )}
    </div>
  )
}

export default AccessibilityChecker
