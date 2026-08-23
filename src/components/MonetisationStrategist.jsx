import { useState } from 'react'
import { buildMonetisationStrategy, saveMonetisation, getMonetisation } from '../services/monetisationService'
import { notify } from '../services/toast'

const TIER_COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b']
const EFFORT_STYLES = { Low: 'text-green-400', Medium: 'text-yellow-400', High: 'text-red-400' }

function MonetisationStrategist({ idea, components }) {
  const [result, setResult] = useState(getMonetisation(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('streams')

  async function handleBuild() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await buildMonetisationStrategy(idea, components)
      setResult(data)
      saveMonetisation(idea, data)
      notify.success('Monetisation strategy ready!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const TABS = [{ id: 'streams', label: 'Revenue Streams' }, { id: 'pricing', label: 'Pricing' }, { id: 'gtm', label: 'Go-to-Market' }]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Build a complete monetisation strategy with revenue streams and pricing tiers</p>
        <button onClick={handleBuild} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Building...' : 'Build Strategy'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Building monetisation strategy...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="bg-emerald-950 border border-emerald-800 rounded-xl p-4">
            <p className="text-emerald-400 text-xs font-semibold mb-1">Primary Model</p>
            <p className="text-white font-black text-xl">{result.primaryModel}</p>
          </div>

          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (activeTab === tab.id ? 'bg-emerald-700 text-white' : 'text-slate-500 hover:text-white')}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'streams' && (
            <div className="space-y-2">
              {(result.revenueStreams || []).map(function(stream, i) {
                const effortColor = EFFORT_STYLES[stream.effort] || EFFORT_STYLES.Medium
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-bold text-sm">{stream.stream}</p>
                      <div className="flex gap-2 text-xs">
                        {stream.potential && <span className="text-emerald-400">{stream.potential}</span>}
                        {stream.effort && <span className={effortColor}>{stream.effort} effort</span>}
                      </div>
                    </div>
                    <p className="text-slate-400 text-xs mb-1">{stream.description}</p>
                    {stream.timeToRevenue && <p className="text-slate-500 text-xs">Time to revenue: {stream.timeToRevenue}</p>}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'pricing' && result.pricingStrategy && (
            <div className="space-y-3">
              <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                <p className="text-white font-bold text-lg">{result.pricingStrategy.recommended}</p>
                <p className="text-slate-400 text-xs mt-1">{result.pricingStrategy.rationale}</p>
              </div>
              <div className="space-y-2">
                {(result.pricingStrategy.tiers || []).map(function(tier, i) {
                  const color = TIER_COLORS[i % TIER_COLORS.length]
                  return (
                    <div key={i} className="rounded-xl border p-4" style={{ backgroundColor: color + '10', borderColor: color + '30' }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-bold">{tier.name}</p>
                        <p className="font-black text-lg" style={{ color }}>{tier.price}</p>
                      </div>
                      <ul className="space-y-0.5">
                        {(tier.features || []).map(function(f, j) {
                          return <li key={j} className="text-slate-300 text-xs flex gap-1"><span style={{ color }}>+</span>{f}</li>
                        })}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'gtm' && result.gtmStrategy && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs text-slate-500 font-semibold mb-2">Go-to-Market Strategy</p>
              <p className="text-white text-sm leading-relaxed">{result.gtmStrategy}</p>
            </div>
          )}

          <button onClick={handleBuild} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Rebuild Strategy</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">💰</div>
          <p className="text-white font-semibold mb-1">Monetisation Strategist</p>
          <p className="text-slate-500 text-sm">Build revenue streams, pricing tiers and go-to-market strategy</p>
        </div>
      )}
    </div>
  )
}

export default MonetisationStrategist
