import { useState } from 'react'
import { analysePricingPsychology, savePricingAnalysis, getPricingAnalysis } from '../services/pricingPsychologyService'
import { notify } from '../services/toast'

const IMPACT_COLORS = { High: '#22c55e', Medium: '#f59e0b', Low: '#0ea5e9' }
const ANCHOR_COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b']

function PricingPsychologyAnalyser({ idea, components }) {
  const [result, setResult] = useState(getPricingAnalysis(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('tactics')

  async function handleAnalyse() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await analysePricingPsychology(idea, components)
      setResult(data)
      savePricingAnalysis(idea, data)
      notify.success('Pricing psychology analysis complete!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const TABS = [{ id: 'tactics', label: 'Tactics' }, { id: 'anchors', label: 'Anchors' }, { id: 'avoid', label: 'Avoid' }]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Analyse pricing psychology tactics and anchoring strategies for your product</p>
        <button onClick={handleAnalyse} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Analysing...' : 'Analyse Pricing'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Analysing pricing psychology...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="bg-gradient-to-r from-emerald-950 to-[#0d0d1a] border border-emerald-700 rounded-2xl p-5">
            <p className="text-emerald-400 text-xs font-semibold mb-1">Recommended Price Point</p>
            <p className="text-white font-black text-4xl">{result.recommendedPrice}</p>
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

          {activeTab === 'tactics' && (
            <div className="space-y-3">
              {(result.psychologyTactics || []).map(function(tactic, i) {
                const impColor = IMPACT_COLORS[tactic.impact] || '#6366f1'
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-white font-bold text-sm">{tactic.tactic}</p>
                      {tactic.impact && <span className="text-xs ml-auto" style={{ color: impColor }}>{tactic.impact} impact</span>}
                    </div>
                    <p className="text-slate-400 text-xs mb-1">{tactic.description}</p>
                    {tactic.example && (
                      <p className="text-emerald-400 text-xs italic">Example: {tactic.example}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'anchors' && (
            <div className="space-y-2">
              {(result.priceAnchors || []).map(function(anchor, i) {
                const color = ANCHOR_COLORS[i % ANCHOR_COLORS.length]
                return (
                  <div key={i} className="rounded-xl border p-4" style={{ backgroundColor: color + '10', borderColor: color + '30' }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-bold text-sm">{anchor.anchor}</p>
                      <p className="font-black text-lg" style={{ color }}>{anchor.price}</p>
                    </div>
                    <p className="text-slate-400 text-xs">{anchor.purpose}</p>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'avoid' && (
            <div className="bg-red-950 border border-red-900 rounded-xl p-4">
              <p className="text-red-400 text-xs font-semibold mb-2">Pricing Mistakes to Avoid</p>
              <ul className="space-y-1">
                {(result.avoidPricing || []).map(function(item, i) {
                  return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-red-400 shrink-0">✗</span>{item}</li>
                })}
              </ul>
            </div>
          )}

          <button onClick={handleAnalyse} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Re-analyse</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">💰</div>
          <p className="text-white font-semibold mb-1">Pricing Psychology Analyser</p>
          <p className="text-slate-500 text-sm">Discover anchoring tactics and psychological pricing strategies</p>
        </div>
      )}
    </div>
  )
}

export default PricingPsychologyAnalyser
