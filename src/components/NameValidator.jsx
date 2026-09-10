import { useState } from 'react'
import { validateProductName, saveValidation, getValidationHistory } from '../services/nameValidatorService'
import { notify } from '../services/toast'

const VERDICT_STYLES = {
  Excellent: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800' },
  Good: { color: 'text-blue-400', bg: 'bg-blue-950', border: 'border-blue-800' },
  Fair: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800' },
  Poor: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800' },
}

const DIMENSIONS = ['memorability', 'pronouncability', 'uniqueness', 'relevance']
const DIM_ICONS = { memorability: '🧠', pronouncability: '🗣️', uniqueness: '⭐', relevance: '🎯' }

function NameValidator({ idea, components }) {
  const [name, setName] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState(getValidationHistory(idea))

  async function handleValidate() {
    if (!name.trim()) { notify.warning('Enter a product name first'); return }
    setLoading(true)
    try {
      const data = await validateProductName(idea, components, name)
      setResult(Object.assign({}, data, { name }))
      saveValidation(idea, name, data)
      setHistory(getValidationHistory(idea))
      notify.success('Name validated! Score: ' + data.score + '/100')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const verdictStyle = result ? (VERDICT_STYLES[result.verdict] || VERDICT_STYLES.Fair) : null
  const scoreColor = result ? (result.score >= 75 ? '#22c55e' : result.score >= 50 ? '#f59e0b' : '#ef4444') : '#6366f1'

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={name} onChange={function(e) { setName(e.target.value) }}
          onKeyDown={function(e) { if (e.key === 'Enter') handleValidate() }}
          placeholder="Enter product name to validate..."
          className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500" />
        <button onClick={handleValidate} disabled={loading || !name.trim()}
          className="px-5 py-3 bg-indigo-700 hover:bg-indigo-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? '...' : 'Validate'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Validating name...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className={'rounded-2xl border p-5 flex items-center gap-5 ' + verdictStyle.bg + ' ' + verdictStyle.border}>
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#1e1e2e" strokeWidth="5" />
                <circle cx="32" cy="32" r="28" fill="none" stroke={scoreColor} strokeWidth="5"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - result.score / 100)} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm font-black" style={{ color: scoreColor }}>{result.score}</p>
              </div>
            </div>
            <div>
              <p className="text-white font-black text-2xl">"{result.name}"</p>
              <p className={'font-bold ' + verdictStyle.color}>{result.verdict}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DIMENSIONS.map(function(dim) {
              const d = result[dim]
              if (!d) return null
              const c = d.score >= 75 ? '#22c55e' : d.score >= 50 ? '#f59e0b' : '#ef4444'
              return (
                <div key={dim} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{DIM_ICONS[dim]}</span>
                    <p className="text-slate-400 text-xs capitalize">{dim}</p>
                    <span className="ml-auto text-xs font-bold" style={{ color: c }}>{d.score}</span>
                  </div>
                  <div className="w-full bg-[#1e1e2e] rounded-full h-1.5 mb-1">
                    <div className="h-1.5 rounded-full" style={{ width: d.score + '%', backgroundColor: c }} />
                  </div>
                  <p className="text-slate-500 text-xs">{d.feedback}</p>
                </div>
              )
            })}
          </div>

          {result.issues?.length > 0 && (
            <div className="bg-red-950 border border-red-900 rounded-xl p-4">
              <p className="text-red-400 text-xs font-semibold mb-2">Issues</p>
              <ul className="space-y-1">
                {result.issues.map(function(issue, i) {
                  return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-red-400 shrink-0">-</span>{issue}</li>
                })}
              </ul>
            </div>
          )}

          {result.improvements?.length > 0 && (
            <div className="bg-green-950 border border-green-800 rounded-xl p-4">
              <p className="text-green-400 text-xs font-semibold mb-2">Improvements</p>
              <ul className="space-y-1">
                {result.improvements.map(function(imp, i) {
                  return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-green-400 shrink-0">{i+1}.</span>{imp}</li>
                })}
              </ul>
            </div>
          )}
        </>
      )}

      {history.length > 0 && (
        <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
          <p className="text-xs text-slate-500 font-semibold mb-2">Validation History</p>
          <div className="space-y-1">
            {history.map(function(h, i) {
              const sc = h.result.score
              const c = sc >= 75 ? '#22c55e' : sc >= 50 ? '#f59e0b' : '#ef4444'
              return (
                <div key={i} onClick={function() { setName(h.name); setResult(Object.assign({}, h.result, { name: h.name })) }}
                  className="flex items-center gap-3 cursor-pointer hover:bg-[#0d0d1a] rounded-lg p-1.5 transition">
                  <p className="text-white text-sm flex-1">{h.name}</p>
                  <span className="text-xs font-bold" style={{ color: c }}>{sc}/100</span>
                  <span className="text-slate-600 text-xs">{h.result.verdict}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!result && !loading && history.length === 0 && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-white font-semibold mb-1">Product Name Validator</p>
          <p className="text-slate-500 text-sm">Score any name on memorability, uniqueness, pronouncability and relevance</p>
        </div>
      )}
    </div>
  )
}

export default NameValidator
