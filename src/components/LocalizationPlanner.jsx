import { useState } from 'react'
import { planLocalization, saveLocalization, getLocalization } from '../services/localizationService'
import { notify } from '../services/toast'

const PRIORITY_STYLES = {
  High: 'text-green-400 bg-green-950 border-green-800',
  Medium: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Low: 'text-slate-400 bg-[#13131f] border-[#2e2e4e]',
}

const COUNTRY_FLAGS = {
  'USA': '🇺🇸', 'UK': '🇬🇧', 'Germany': '🇩🇪', 'France': '🇫🇷', 'Japan': '🇯🇵',
  'China': '🇨🇳', 'India': '🇮🇳', 'Australia': '🇦🇺', 'Canada': '🇨🇦', 'Brazil': '🇧🇷',
  'South Korea': '🇰🇷', 'Singapore': '🇸🇬', 'UAE': '🇦🇪', 'Netherlands': '🇳🇱',
}

function LocalizationPlanner({ idea, components }) {
  const [result, setResult] = useState(getLocalization(idea))
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('All')

  async function handlePlan() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await planLocalization(idea, components)
      setResult(data)
      saveLocalization(idea, data)
      notify.success((data.markets?.length || 0) + ' markets planned!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const markets = result?.markets || []
  const filtered = filter === 'All' ? markets : markets.filter(function(m) { return m.priority === filter })

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Plan global market entry with voltage, certifications and localisation requirements</p>
        <button onClick={handlePlan} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-blue-700 hover:bg-blue-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Planning...' : 'Plan Markets'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Planning global markets...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="flex gap-1">
            {['All', 'High', 'Medium', 'Low'].map(function(p) {
              return (
                <button key={p} onClick={function() { setFilter(p) }}
                  className={'text-xs px-3 py-1.5 rounded-xl border transition ' + (filter === p ? 'bg-blue-700 text-white border-blue-600' : 'bg-[#13131f] text-slate-400 border-[#2e2e4e]')}>
                  {p}
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-1 gap-2">
            {filtered.map(function(market, i) {
              const priStyle = PRIORITY_STYLES[market.priority] || PRIORITY_STYLES.Low
              const flag = COUNTRY_FLAGS[market.country] || '🌍'
              const isSel = selected === i
              return (
                <div key={i} className={'rounded-xl border overflow-hidden transition ' + (isSel ? 'border-blue-700' : 'border-[#2e2e4e]')}>
                  <button onClick={function() { setSelected(isSel ? null : i) }}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#1e1e2e] bg-[#13131f] transition">
                    <span className="text-2xl shrink-0">{flag}</span>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{market.country}</p>
                      <div className="flex gap-2 text-xs mt-0.5">
                        <span className="text-slate-400">{market.language}</span>
                        <span className="text-slate-500">{market.currency}</span>
                        {market.voltage && <span className="text-yellow-400">{market.voltage}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {market.marketSize && <span className="text-slate-500 text-xs">{market.marketSize}</span>}
                      <span className={'text-xs px-1.5 py-0.5 rounded border ' + priStyle}>{market.priority}</span>
                    </div>
                  </button>
                  {isSel && (
                    <div className="px-4 pb-4 bg-[#0d0d1a] border-t border-[#1e1e2e] pt-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { label: 'Plug Type', value: market.plugType, icon: '🔌' },
                          { label: 'Certification', value: market.certification, icon: '📋' },
                          { label: 'Voltage', value: market.voltage, icon: '⚡' },
                          { label: 'Market Size', value: market.marketSize, icon: '📈' },
                        ].map(function(item) {
                          return item.value ? (
                            <div key={item.label} className="bg-[#13131f] rounded-lg p-2">
                              <p className="text-slate-500">{item.icon} {item.label}</p>
                              <p className="text-white font-medium">{item.value}</p>
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <button onClick={handlePlan} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Replan</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🌍</div>
          <p className="text-white font-semibold mb-1">Localization Planner</p>
          <p className="text-slate-500 text-sm">Plan global markets with voltage, plug types and certification requirements</p>
        </div>
      )}
    </div>
  )
}

export default LocalizationPlanner
