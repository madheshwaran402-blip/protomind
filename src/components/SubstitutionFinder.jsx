import { useState } from 'react'
import { findSubstitutions } from '../services/substitutionService2'
import { notify } from '../services/toast'

const SUBSTITUTION_REASONS = [
  { value: 'unavailable', label: '📦 Out of Stock' },
  { value: 'too_expensive', label: '💸 Too Expensive' },
  { value: 'wrong_voltage', label: '⚡ Wrong Voltage' },
  { value: 'different_package', label: '📐 Different Package' },
  { value: 'upgrade', label: '⬆️ Want Upgrade' },
  { value: 'local_only', label: '🏪 Local Parts Only' },
]

const PRIORITIES = [
  { value: 'price', label: '💰 Lowest Price' },
  { value: 'compatibility', label: '🔗 Best Compatibility' },
  { value: 'availability', label: '📦 Easiest to Find' },
  { value: 'performance', label: '🚀 Best Performance' },
]

function CompatibilityRing({ score }) {
  const color = score >= 90 ? '#22c55e' : score >= 70 ? '#f59e0b' : '#ef4444'
  const circumference = 2 * Math.PI * 20
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" fill="none" stroke="#1e1e2e" strokeWidth="4" />
        <circle
          cx="25" cy="25" r="20"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-xs font-black" style={{ color }}>{score}</span>
    </div>
  )
}

function SubstitutionCard({ sub, isRecommended }) {
  const [expanded, setExpanded] = useState(isRecommended)

  return (
    <div className={'border rounded-xl overflow-hidden ' + (
      isRecommended ? 'border-yellow-700' : 'border-[#2e2e4e]'
    )}>
      <button
        onClick={function() { setExpanded(!expanded) }}
        className={'w-full flex items-center gap-3 p-4 text-left hover:opacity-90 transition ' + (
          isRecommended ? 'bg-yellow-950' : 'bg-[#13131f]'
        )}
      >
        {isRecommended && (
          <div className="absolute top-2 left-2">
            <span className="text-xs bg-yellow-900 text-yellow-400 border border-yellow-700 px-1.5 py-0.5 rounded-full">
              ⭐ Recommended
            </span>
          </div>
        )}

        <CompatibilityRing score={sub.compatibilityScore || 0} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-white font-bold text-sm">{sub.name}</p>
            {sub.dropInReplacement && (
              <span className="text-xs bg-green-950 text-green-400 border border-green-800 px-1.5 py-0.5 rounded-full">
                Drop-in ✓
              </span>
            )}
          </div>
          <div className="flex gap-3 text-xs text-slate-500">
            {sub.manufacturer && <span>{sub.manufacturer}</span>}
            <span className="text-emerald-400">{sub.priceRange}</span>
            <span>{sub.availability}</span>
          </div>
        </div>
        <span className="text-slate-600 shrink-0">{expanded ? '↑' : '↓'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 bg-[#0d0d1a] border-t border-[#2e2e4e] pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {sub.pros && sub.pros.length > 0 && (
              <div>
                <p className="text-green-400 text-xs font-semibold mb-1">✓ Pros</p>
                <ul className="space-y-0.5">
                  {sub.pros.map(function(pro, i) {
                    return <li key={i} className="text-slate-300 text-xs">• {pro}</li>
                  })}
                </ul>
              </div>
            )}
            {sub.cons && sub.cons.length > 0 && (
              <div>
                <p className="text-red-400 text-xs font-semibold mb-1">✗ Cons</p>
                <ul className="space-y-0.5">
                  {sub.cons.map(function(con, i) {
                    return <li key={i} className="text-slate-400 text-xs">• {con}</li>
                  })}
                </ul>
              </div>
            )}
          </div>

          {sub.pinChanges && sub.pinChanges.length > 0 && (
            <div className="bg-orange-950 border border-orange-800 rounded-lg p-3">
              <p className="text-orange-400 text-xs font-semibold mb-1">📌 Pin Changes Required</p>
              <ul className="space-y-0.5">
                {sub.pinChanges.map(function(change, i) {
                  return <li key={i} className="text-orange-200 text-xs">→ {change}</li>
                })}
              </ul>
            </div>
          )}

          {sub.codeChanges && sub.codeChanges.length > 0 && (
            <div className="bg-blue-950 border border-blue-900 rounded-lg p-3">
              <p className="text-blue-400 text-xs font-semibold mb-1">💻 Code Changes Required</p>
              <ul className="space-y-0.5">
                {sub.codeChanges.map(function(change, i) {
                  return <li key={i} className="text-blue-200 text-xs font-mono">→ {change}</li>
                })}
              </ul>
            </div>
          )}

          {sub.notes && (
            <p className="text-slate-500 text-xs italic">{sub.notes}</p>
          )}

          <button
            onClick={function() {
              const url = 'https://www.google.com/search?q=' + encodeURIComponent(sub.name + ' buy electronics')
              window.open(url, '_blank')
            }}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-lg text-xs transition"
          >
            🔍 Find {sub.name} →
          </button>
        </div>
      )}
    </div>
  )
}

function SubstitutionFinder({ components }) {
  const [selectedComponent, setSelectedComponent] = useState(null)
  const [reason, setReason] = useState('unavailable')
  const [priority, setPriority] = useState('compatibility')
  const [budget, setBudget] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

  async function handleFind() {
    if (!selectedComponent) {
      notify.warning('Select a component to substitute')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const data = await findSubstitutions(selectedComponent, { reason, priority, budget })
      setResult(data)
      setHistory(function(prev) {
        return [{ component: selectedComponent, result: data }].concat(prev.slice(0, 3))
      })
      notify.success('Found ' + (data.substitutions?.length || 0) + ' substitutions!')
    } catch {
      notify.error('Search failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const sortedSubs = result ? [...(result.substitutions || [])].sort(function(a, b) {
    if (priority === 'compatibility') return (b.compatibilityScore || 0) - (a.compatibilityScore || 0)
    if (priority === 'price') {
      const aMin = parseInt((a.priceRange || '').match(/\d+/)?.[0] || '999')
      const bMin = parseInt((b.priceRange || '').match(/\d+/)?.[0] || '999')
      return aMin - bMin
    }
    return (b.compatibilityScore || 0) - (a.compatibilityScore || 0)
  }) : []

  const topSub = sortedSubs[0]

  return (
    <div className="space-y-4">

      {/* Component selector */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Select Component to Replace</p>
        {components.length === 0 ? (
          <p className="text-slate-600 text-sm text-center py-4">Add components to your prototype first</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {components.map(function(comp) {
              return (
                <button
                  key={comp.id || comp.name}
                  onClick={function() { setSelectedComponent(comp); setResult(null) }}
                  className={'p-3 rounded-xl border text-left transition ' + (
                    selectedComponent?.name === comp.name
                      ? 'bg-indigo-950 border-indigo-700'
                      : 'bg-[#13131f] border-[#2e2e4e] hover:border-indigo-700'
                  )}
                >
                  <p className="text-xl mb-1">{comp.icon || '🔧'}</p>
                  <p className="text-white text-xs font-medium leading-tight">{comp.name}</p>
                  <p className="text-slate-500 text-xs">{comp.category}</p>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Options */}
      {selectedComponent && (
        <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 space-y-3">
          <p className="text-white text-sm font-semibold">
            Finding substitutes for: <span className="text-indigo-400">{selectedComponent.name}</span>
          </p>

          <div>
            <p className="text-xs text-slate-500 mb-2">Why are you substituting?</p>
            <div className="flex flex-wrap gap-1">
              {SUBSTITUTION_REASONS.map(function(r) {
                return (
                  <button
                    key={r.value}
                    onClick={function() { setReason(r.value) }}
                    className={'text-xs px-2 py-1.5 rounded-lg border transition ' + (
                      reason === r.value
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-[#0d0d1a] text-slate-400 border-[#2e2e4e] hover:border-indigo-600'
                    )}
                  >
                    {r.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-2">Optimise for</p>
            <div className="flex flex-wrap gap-1">
              {PRIORITIES.map(function(p) {
                return (
                  <button
                    key={p.value}
                    onClick={function() { setPriority(p.value) }}
                    className={'text-xs px-2 py-1.5 rounded-lg border transition ' + (
                      priority === p.value
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-[#0d0d1a] text-slate-400 border-[#2e2e4e] hover:border-indigo-600'
                    )}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-1">Max budget per part (optional)</p>
            <input
              type="number"
              value={budget}
              onChange={function(e) { setBudget(e.target.value) }}
              placeholder="e.g. 5"
              className="w-32 bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      <button
        onClick={handleFind}
        disabled={loading || !selectedComponent}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition disabled:opacity-50"
      >
        {loading ? '🔍 Searching...' : '🔍 Find Substitutions'}
      </button>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Finding alternatives for {selectedComponent?.name}...</p>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Recommendation */}
          {result.recommendation && (
            <div className="bg-indigo-950 border border-indigo-800 rounded-xl p-4">
              <p className="text-indigo-400 text-xs font-semibold mb-1">🤖 AI Recommendation</p>
              <p className="text-slate-300 text-sm">{result.recommendation}</p>
            </div>
          )}

          {/* Substitutions */}
          <div className="space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              {sortedSubs.length} Substitutions — ranked by {priority}
            </p>
            {sortedSubs.map(function(sub, i) {
              return (
                <SubstitutionCard
                  key={sub.name || i}
                  sub={sub}
                  isRecommended={i === 0}
                />
              )
            })}
          </div>

          {/* General tips */}
          {result.generalTips && result.generalTips.length > 0 && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs text-slate-500 font-semibold mb-2">💡 General Tips</p>
              <ul className="space-y-1">
                {result.generalTips.map(function(tip, i) {
                  return (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-indigo-400 shrink-0">→</span>
                      <p className="text-slate-300">{tip}</p>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          <button
            onClick={handleFind}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Search Again
          </button>
        </>
      )}

      {/* Search history */}
      {history.length > 0 && !result && (
        <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Recent Searches</p>
          <div className="space-y-2">
            {history.map(function(item, i) {
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 cursor-pointer hover:bg-[#13131f] rounded-lg p-2 transition"
                  onClick={function() { setSelectedComponent(item.component); setResult(item.result) }}
                >
                  <span className="text-lg">{item.component.icon || '🔧'}</span>
                  <div className="flex-1">
                    <p className="text-white text-xs font-medium">{item.component.name}</p>
                    <p className="text-slate-500 text-xs">{(item.result.substitutions || []).length} alternatives found</p>
                  </div>
                  <span className="text-slate-600 text-xs">→</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!selectedComponent && components.length > 0 && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🔄</div>
          <p className="text-white font-semibold mb-1">Substitution Finder 2.0</p>
          <p className="text-slate-500 text-sm">Select a component above to find alternatives</p>
        </div>
      )}
    </div>
  )
}

export default SubstitutionFinder