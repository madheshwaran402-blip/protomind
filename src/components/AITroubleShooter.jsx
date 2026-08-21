import { useState } from 'react'
import { troubleshootProblem, COMMON_PROBLEMS, saveTroubleshootHistory, getTroubleshootHistory } from '../services/troubleshooterService'
import { notify } from '../services/toast'

const PROBABILITY_STYLES = {
  High: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800' },
  Medium: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800' },
  Low: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800' },
}

function AITroubleshooter({ idea, components }) {
  const [problem, setProblem] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('diagnosis')
  const [completedSteps, setCompletedSteps] = useState({})
  const [history, setHistory] = useState(getTroubleshootHistory(idea))

  async function handleTroubleshoot(p) {
    const text = p || problem
    if (!text.trim()) { notify.warning('Describe your problem first'); return }
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    setResult(null)
    setCompletedSteps({})
    try {
      const data = await troubleshootProblem(idea, components, text)
      const session = Object.assign({}, data, { problem: text })
      setResult(session)
      saveTroubleshootHistory(idea, session)
      setHistory(getTroubleshootHistory(idea))
      setActiveTab('diagnosis')
      notify.success('Diagnosis complete!')
    } catch { notify.error('Troubleshooter failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function toggleStep(index) {
    setCompletedSteps(function(prev) {
      const next = Object.assign({}, prev)
      next[index] = !next[index]
      return next
    })
  }

  const TABS = [
    { id: 'diagnosis', label: 'Diagnosis' },
    { id: 'steps', label: 'Fix Steps' },
    { id: 'history', label: 'History' },
  ]

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <textarea
          value={problem}
          onChange={function(e) { setProblem(e.target.value) }}
          placeholder="Describe your problem..."
          className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-red-500 resize-none placeholder-slate-600"
          rows={3}
        />
        <div className="flex flex-wrap gap-1">
          {COMMON_PROBLEMS.slice(0, 5).map(function(p, i) {
            return (
              <button key={i} onClick={function() { handleTroubleshoot(p) }}
                className="text-xs px-2 py-1.5 bg-[#13131f] border border-[#2e2e4e] hover:border-red-700 text-slate-400 hover:text-white rounded-xl transition">
                {p}
              </button>
            )
          })}
        </div>
        <button
          onClick={function() { handleTroubleshoot() }}
          disabled={loading || !problem.trim() || components.length === 0}
          className="w-full py-3 bg-red-700 hover:bg-red-600 rounded-xl text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? 'Diagnosing...' : 'Diagnose Problem'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Diagnosing your problem...</p>
        </div>
      )}

      {(result || history.length > 0) && !loading && (
        <>
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (activeTab === tab.id ? 'bg-red-700 text-white' : 'text-slate-500 hover:text-white')}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'diagnosis' && result && (
            <div className="space-y-3">
              <div className="bg-red-950 border border-red-800 rounded-xl p-4">
                <p className="text-red-400 text-xs font-semibold mb-1">Diagnosis</p>
                <p className="text-white text-sm">{result.diagnosis}</p>
              </div>
              {(result.rootCauses || []).map(function(cause, i) {
                const probStyle = PROBABILITY_STYLES[cause.probability] || PROBABILITY_STYLES.Medium
                return (
                  <div key={i} className={'rounded-xl border p-4 ' + probStyle.bg + ' ' + probStyle.border}>
                    <p className={'font-semibold text-sm mb-1 ' + probStyle.color}>{cause.cause} ({cause.probability})</p>
                    <p className="text-slate-300 text-xs">{cause.explanation}</p>
                  </div>
                )
              })}
              {result.quickFixes && result.quickFixes.length > 0 && (
                <div className="bg-green-950 border border-green-800 rounded-xl p-4">
                  <p className="text-green-400 text-xs font-semibold mb-2">Quick Fixes</p>
                  <ul className="space-y-1">
                    {result.quickFixes.map(function(fix, i) {
                      return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-green-400">{i+1}.</span>{fix}</li>
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'steps' && result && (
            <div className="space-y-2">
              {(result.steps || []).map(function(step, i) {
                const done = !!completedSteps[i]
                return (
                  <div key={i} onClick={function() { toggleStep(i) }}
                    className={'rounded-xl border p-4 cursor-pointer transition ' + (done ? 'bg-green-950 border-green-900 opacity-60' : 'bg-[#13131f] border-[#2e2e4e]')}>
                    <div className="flex items-start gap-3">
                      <div className={'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold ' + (done ? 'bg-green-600 border-green-500 text-white' : 'border-[#2e2e4e] text-slate-500')}>
                        {done ? 'v' : i + 1}
                      </div>
                      <div>
                        <p className={'text-sm font-semibold ' + (done ? 'line-through text-slate-500' : 'text-white')}>{step.action}</p>
                        {step.tool && <p className="text-slate-500 text-xs">Tool: {step.tool}</p>}
                        {step.expected && <p className="text-indigo-400 text-xs">Expected: {step.expected}</p>}
                      </div>
                    </div>
                  </div>
                )
              })}
              {result.preventionTips && result.preventionTips.length > 0 && (
                <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
                  <p className="text-indigo-400 text-xs font-semibold mb-2">Prevention Tips</p>
                  <ul className="space-y-1">
                    {result.preventionTips.map(function(tip, i) {
                      return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-indigo-400">-</span>{tip}</li>
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2">
              {history.length === 0 ? (
                <p className="text-slate-600 text-sm text-center py-4">No history yet</p>
              ) : (
                history.map(function(session, i) {
                  return (
                    <div key={i} onClick={function() { setResult(session); setActiveTab('diagnosis') }}
                      className="bg-[#13131f] border border-[#2e2e4e] hover:border-red-700 rounded-xl p-3 cursor-pointer transition">
                      <p className="text-white text-xs font-medium">{session.problem}</p>
                      <p className="text-slate-500 text-xs line-clamp-1">{session.diagnosis}</p>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </>
      )}

      {!result && !loading && history.length === 0 && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-white font-semibold mb-1">AI Troubleshooter</p>
          <p className="text-slate-500 text-sm">Describe any problem to get diagnosis and step-by-step fixes</p>
        </div>
      )}
    </div>
  )
}

export default AITroubleshooter
