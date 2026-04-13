import { useState } from 'react'
import { suggestSubstitutions } from '../services/substitutionSuggester'
import { notify } from '../services/toast'

const COMPATIBILITY_CONFIG = {
  High: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-900', icon: '✅' },
  Medium: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-900', icon: '⚠️' },
  Low: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-900', icon: '❌' },
}

const PRICE_CONFIG = {
  cheaper: { color: 'text-green-400', icon: '↓', label: 'Cheaper' },
  similar: { color: 'text-slate-400', icon: '→', label: 'Similar price' },
  expensive: { color: 'text-red-400', icon: '↑', label: 'More expensive' },
}

function SubstituteCard({ sub, isRecommended }) {
  const [expanded, setExpanded] = useState(isRecommended)
  const compat = COMPATIBILITY_CONFIG[sub.compatibility] || COMPATIBILITY_CONFIG.Medium
  const price = PRICE_CONFIG[sub.priceChange] || PRICE_CONFIG.similar

  return (
    <div
      className={`rounded-xl border transition ${
        isRecommended
          ? 'bg-indigo-950 border-indigo-700'
          : 'bg-[#13131f] border-[#2e2e4e]'
      }`}
    >
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            {isRecommended && (
              <span className="text-xs bg-indigo-700 text-indigo-200 px-2 py-0.5 rounded-full">
                ⭐ Recommended
              </span>
            )}
          </div>
          <span className="text-slate-600 text-xs">{expanded ? '↑' : '↓'}</span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-white font-semibold text-sm">{sub.name}</p>
            <p className="text-slate-500 text-xs">{sub.category}</p>
          </div>
          <div className="text-right">
            <p className="text-emerald-400 font-bold">${sub.estimatedPrice}</p>
            <p className={`text-xs ${price.color}`}>
              {price.icon} {price.label}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${compat.color} ${compat.bg} ${compat.border}`}>
            {compat.icon} {sub.compatibility} compatibility
          </span>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[#2e2e4e] pt-3 space-y-3">
          <p className="text-indigo-300 text-xs italic">"{sub.verdict}"</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-green-400 mb-1">✅ Pros</p>
              <ul className="space-y-1">
                {sub.pros?.map((pro, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-1">
                    <span className="text-green-600 shrink-0">+</span>{pro}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-red-400 mb-1">❌ Cons</p>
              <ul className="space-y-1">
                {sub.cons?.map((con, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-1">
                    <span className="text-red-600 shrink-0">-</span>{con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {sub.codeChanges && (
            <div className="bg-[#0d0d1a] rounded-lg px-3 py-2">
              <p className="text-xs font-semibold text-yellow-400 mb-1">🔧 Changes needed</p>
              <p className="text-xs text-slate-400">{sub.codeChanges}</p>
            </div>
          )}

          <a
            href={sub.buyLink || 'https://www.amazon.com/s?k=' + encodeURIComponent(sub.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            🛒 Buy on Amazon →
          </a>
        </div>
      )}
    </div>
  )
}

function SubstitutionSuggester({ idea, components }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState(null)

  async function handleSuggest(comp) {
    setSelectedComponent(comp)
    setResult(null)
    setLoading(true)
    try {
      const data = await suggestSubstitutions(idea, components, comp)
      setResult(data)
      notify.success('Found ' + data.substitutes.length + ' substitutes for ' + comp.name)
    } catch {
      notify.error('Substitution search failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white">🔄 Component Substitution Suggester</h3>
        <p className="text-slate-500 text-xs mt-0.5">
          Click any component to find alternatives if it is unavailable or too expensive
        </p>
      </div>

      {/* Component selector */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {components.map(comp => (
          <button
            key={comp.id}
            onClick={() => handleSuggest(comp)}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition ${
              selectedComponent?.id === comp.id
                ? 'bg-indigo-950 border-indigo-700 text-white'
                : 'bg-[#13131f] border-[#2e2e4e] text-slate-400 hover:border-indigo-800 hover:text-white'
            } disabled:opacity-50`}
          >
            <span className="text-lg">{comp.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{comp.name}</p>
              <p className="text-xs text-slate-600">{comp.category}</p>
            </div>
            <span className="text-slate-600 text-xs shrink-0">→</span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">
            Finding substitutes for {selectedComponent?.name}...
          </p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4">
          {/* Original component info */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">{selectedComponent?.icon}</span>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">{result.original?.name}</p>
              <p className="text-slate-500 text-xs">{result.original?.reason}</p>
            </div>
            <span className="text-slate-600 text-xs">→ Replace with</span>
          </div>

          {/* Overall verdict */}
          <div className="bg-indigo-950 border border-indigo-900 rounded-xl px-4 py-3">
            <p className="text-indigo-300 text-sm">
              💡 <span className="font-semibold text-white">Best choice: {result.recommendation}</span>
            </p>
            <p className="text-slate-400 text-xs mt-1">{result.verdict}</p>
          </div>

          {/* Substitute cards */}
          <div className="space-y-3">
            {result.substitutes?.map((sub, i) => (
              <SubstituteCard
                key={i}
                sub={sub}
                isRecommended={sub.name === result.recommendation}
              />
            ))}
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-8 text-slate-600 text-sm">
          Click any component above to find substitutes
        </div>
      )}
    </div>
  )
}

export default SubstitutionSuggester