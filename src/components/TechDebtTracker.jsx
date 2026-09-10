import { useState } from 'react'
import { analyseTechnicalDebt, saveTechDebt, getTechDebt } from '../services/techDebtService'
import { notify } from '../services/toast'

const SEVERITY_STYLES = {
  Critical: 'text-red-400 bg-red-950 border-red-800',
  High: 'text-orange-400 bg-orange-950 border-orange-800',
  Medium: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Low: 'text-blue-400 bg-blue-950 border-blue-800',
}
const EFFORT_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' }
const CAT_COLORS = { Hardware: '#6366f1', Software: '#22c55e', Architecture: '#f59e0b', Process: '#0ea5e9' }

function TechDebtTracker({ idea, components }) {
  const [result, setResult] = useState(getTechDebt(idea))
  const [loading, setLoading] = useState(false)
  const [resolved, setResolved] = useState({})
  const [filter, setFilter] = useState('All')
  const [expanded, setExpanded] = useState(null)

  async function handleAnalyse() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await analyseTechnicalDebt(idea, components)
      setResult(data)
      saveTechDebt(idea, data)
      notify.success('Technical debt analysed!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function toggleResolved(idx) {
    setResolved(function(prev) {
      const next = Object.assign({}, prev)
      next[idx] = !next[idx]
      return next
    })
  }

  const items = result?.items || []
  const categories = ['All', ...new Set(items.map(function(i) { return i.category }).filter(Boolean))]
  const filtered = filter === 'All' ? items : items.filter(function(i) { return i.category === filter })
  const resolvedCount = Object.values(resolved).filter(Boolean).length
  const debtColor = result ? (result.debtScore <= 30 ? '#22c55e' : result.debtScore <= 60 ? '#f59e0b' : '#ef4444') : '#6366f1'

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Identify and track technical debt in your prototype design and code</p>
        <button onClick={handleAnalyse} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-orange-700 hover:bg-orange-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Analysing...' : 'Analyse Debt'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Analysing technical debt...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 flex items-center gap-5">
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#1e1e2e" strokeWidth="5" />
                <circle cx="32" cy="32" r="28" fill="none" stroke={debtColor} strokeWidth="5"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - result.debtScore / 100)} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm font-black" style={{ color: debtColor }}>{result.debtScore}</p>
              </div>
            </div>
            <div>
              <p className="text-white font-bold">Technical Debt Score</p>
              <p className="text-slate-400 text-xs">{items.length} debt items found</p>
              {resolvedCount > 0 && <p className="text-green-400 text-xs">{resolvedCount} resolved</p>}
            </div>
          </div>

          <div className="flex gap-1 flex-wrap">
            {categories.map(function(cat) {
              const color = CAT_COLORS[cat] || '#6366f1'
              return (
                <button key={cat} onClick={function() { setFilter(cat) }}
                  className={'text-xs px-2 py-1 rounded-lg border transition ' + (filter === cat ? 'text-white' : 'bg-[#13131f] text-slate-500 border-[#2e2e4e]')}
                  style={filter === cat ? { backgroundColor: color, borderColor: color } : {}}>
                  {cat}
                </button>
              )
            })}
          </div>

          <div className="space-y-2">
            {filtered.map(function(item, i) {
              const sevStyle = SEVERITY_STYLES[item.severity] || SEVERITY_STYLES.Low
              const effortColor = EFFORT_COLORS[item.effort] || '#f59e0b'
              const isRes = !!resolved[i]
              const isExp = expanded === i
              return (
                <div key={i} className={'rounded-xl border overflow-hidden transition ' + (isRes ? 'opacity-50 border-[#1e1e2e]' : 'border-[#2e2e4e]')}>
                  <button onClick={function() { setExpanded(isExp ? null : i) }}
                    className={'w-full flex items-start gap-3 p-4 text-left hover:bg-[#1e1e2e] transition ' + (isRes ? 'bg-[#0d0d1a]' : 'bg-[#13131f]')}>
                    <button onClick={function(e) { e.stopPropagation(); toggleResolved(i) }}
                      className={'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ' + (isRes ? 'bg-green-600 border-green-500' : 'border-[#2e2e4e] hover:border-green-500')}>
                      {isRes && <span className="text-white text-xs">v</span>}
                    </button>
                    <div className="flex-1">
                      <p className={'text-sm font-medium ' + (isRes ? 'line-through text-slate-500' : 'text-white')}>{item.title}</p>
                      <div className="flex gap-2 mt-0.5">
                        <span className={'text-xs px-1.5 py-0.5 rounded border ' + sevStyle}>{item.severity}</span>
                        {item.category && <span className="text-xs" style={{ color: CAT_COLORS[item.category] || '#6366f1' }}>{item.category}</span>}
                        {item.effort && <span className="text-xs ml-auto" style={{ color: effortColor }}>{item.effort} effort</span>}
                      </div>
                    </div>
                    <span className="text-slate-600 shrink-0">{isExp ? '-' : '+'}</span>
                  </button>
                  {isExp && !isRes && (
                    <div className="px-4 pb-4 bg-[#0d0d1a] border-t border-[#1e1e2e] pt-3 space-y-2">
                      <p className="text-slate-300 text-xs">{item.description}</p>
                      {item.refactorSteps?.length > 0 && (
                        <div>
                          <p className="text-slate-500 text-xs font-semibold mb-1">Refactor Steps</p>
                          <ol className="space-y-1">
                            {item.refactorSteps.map(function(step, j) {
                              return <li key={j} className="text-slate-300 text-xs flex gap-2"><span className="text-orange-400 shrink-0">{j+1}.</span>{step}</li>
                            })}
                          </ol>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <button onClick={handleAnalyse} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Re-analyse</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🔧</div>
          <p className="text-white font-semibold mb-1">Technical Debt Tracker</p>
          <p className="text-slate-500 text-sm">Identify hardware and software technical debt with refactor steps</p>
        </div>
      )}
    </div>
  )
}

export default TechDebtTracker
