import { useState } from 'react'
import { findSubstitutes, saveSubstitutes, getSubstitutes } from '../services/partsSubstitutionService'
import { notify } from '../services/toast'

const COMPAT_STYLES = {
  'Drop-in': 'text-green-400 bg-green-950 border-green-800',
  'Pin-compatible': 'text-blue-400 bg-blue-950 border-blue-800',
  'Functional': 'text-yellow-400 bg-yellow-950 border-yellow-800',
  'Partial': 'text-orange-400 bg-orange-950 border-orange-800',
}

function PartsSubstitutionFinder({ idea, components }) {
  const [result, setResult] = useState(getSubstitutes(idea))
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)

  async function handleFind() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await findSubstitutes(idea, components)
      setResult(data)
      saveSubstitutes(idea, data)
      notify.success('Substitutes found!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const substitutes = result?.substitutes || []
  const active = substitutes[selected]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Find alternative components when originals are unavailable or too expensive</p>
        <button onClick={handleFind} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-amber-700 hover:bg-amber-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Searching...' : 'Find Substitutes'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Finding substitute components...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {substitutes.map(function(sub, i) {
              return (
                <button key={i} onClick={function() { setSelected(i) }}
                  className={'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition ' + (selected === i ? 'bg-amber-700 text-white' : 'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')}>
                  {sub.original}
                  <span className="ml-1 opacity-70">({(sub.alternatives || []).length})</span>
                </button>
              )
            })}
          </div>

          {active && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">Alternatives for <span className="text-amber-400 font-semibold">{active.original}</span></p>
              {(active.alternatives || []).map(function(alt, i) {
                const compatStyle = COMPAT_STYLES[alt.compatibility] || 'text-slate-400 bg-[#13131f] border-[#2e2e4e]'
                const priceDiff = alt.priceDiff || ''
                const priceColor = priceDiff.includes('-') ? 'text-green-400' : priceDiff.includes('+') ? 'text-red-400' : 'text-slate-400'
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-white font-bold text-sm">{alt.name}</p>
                      <div className="flex gap-2 shrink-0">
                        {priceDiff && <span className={'text-xs font-bold ' + priceColor}>{priceDiff}</span>}
                        <span className={'text-xs px-1.5 py-0.5 rounded border ' + compatStyle}>{alt.compatibility}</span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-xs mb-1">{alt.reason}</p>
                    {alt.notes && <p className="text-slate-600 text-xs">{alt.notes}</p>}
                    <button
                      onClick={function() { window.open('https://www.google.com/search?q=' + encodeURIComponent(alt.name + ' buy electronics'), '_blank') }}
                      className="mt-2 text-xs text-amber-400 hover:text-amber-300 transition">
                      Find on Digikey / Mouser →
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          <button onClick={handleFind} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Refresh</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🔄</div>
          <p className="text-white font-semibold mb-1">Parts Substitution Finder</p>
          <p className="text-slate-500 text-sm">Find drop-in and compatible alternatives for every component</p>
        </div>
      )}
    </div>
  )
}

export default PartsSubstitutionFinder
