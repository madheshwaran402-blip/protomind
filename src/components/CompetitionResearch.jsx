import { useState } from 'react'
import { researchCompetition, saveResearch, getResearch } from '../services/competitionResearchService'
import { notify } from '../services/toast'

function CompetitionResearch({ idea, components }) {
  const [result, setResult] = useState(getResearch(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('competitors')

  async function handleResearch() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    try {
      const data = await researchCompetition(idea, components)
      setResult(data)
      saveResearch(idea, data)
      notify.success('Market research complete — ' + (data.competitors?.length || 0) + ' competitors found!')
    } catch {
      notify.error('Research failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const TABS = [
    { id: 'competitors', label: '🏢 Competitors' },
    { id: 'market', label: '📈 Market' },
    { id: 'strategy', label: '🎯 Strategy' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">AI researches similar products, market gaps and your competitive advantages</p>
        <button
          onClick={handleResearch}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0"
        >
          {loading ? '🔍 Researching...' : '🔍 Research Market'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Researching competition...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <p className="text-slate-500 text-xs mb-1">Market Category</p>
            <p className="text-white font-bold">{result.marketCategory}</p>
            {result.marketSize && (
              <p className="text-indigo-400 text-xs mt-1">📈 Market Size: {result.marketSize}</p>
            )}
          </div>

          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (
                    activeTab === tab.id ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'
                  )}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'competitors' && (
            <div className="space-y-3">
              {(result.competitors || []).map(function(comp, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-white font-bold text-sm">{comp.name}</p>
                      {comp.price && <span className="text-emerald-400 text-xs font-mono">{comp.price}</span>}
                    </div>
                    <p className="text-slate-400 text-xs mb-2">{comp.description}</p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {comp.pros && comp.pros.length > 0 && (
                        <div>
                          <p className="text-green-400 text-xs font-semibold mb-1">✓ Pros</p>
                          {comp.pros.map(function(p, j) {
                            return <p key={j} className="text-slate-300 text-xs">• {p}</p>
                          })}
                        </div>
                      )}
                      {comp.cons && comp.cons.length > 0 && (
                        <div>
                          <p className="text-red-400 text-xs font-semibold mb-1">✗ Cons</p>
                          {comp.cons.map(function(c, j) {
                            return <p key={j} className="text-slate-400 text-xs">• {c}</p>
                          })}
                        </div>
                      )}
                    </div>
                    {comp.differentiator && (
                      <p className="text-yellow-400 text-xs">⭐ Key differentiator: {comp.differentiator}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'market' && (
            <div className="space-y-3">
              <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                <p className="text-xs text-slate-500 font-semibold mb-2">👥 Target Market</p>
                <p className="text-slate-300 text-sm">{result.targetMarket}</p>
              </div>
              {result.marketGaps && result.marketGaps.length > 0 && (
                <div className="bg-green-950 border border-green-800 rounded-xl p-4">
                  <p className="text-green-400 text-xs font-semibold mb-2">🎯 Market Gaps (Opportunities)</p>
                  <ul className="space-y-1">
                    {result.marketGaps.map(function(gap, i) {
                      return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-green-400">{i+1}.</span>{gap}</li>
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'strategy' && (
            <div className="space-y-3">
              {result.uniqueAdvantages && result.uniqueAdvantages.length > 0 && (
                <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
                  <p className="text-indigo-400 text-xs font-semibold mb-2">⭐ Your Unique Advantages</p>
                  <ul className="space-y-1">
                    {result.uniqueAdvantages.map(function(adv, i) {
                      return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-indigo-400">→</span>{adv}</li>
                    })}
                  </ul>
                </div>
              )}
              {result.recommendation && (
                <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-4">
                  <p className="text-yellow-400 text-xs font-semibold mb-2">💡 Strategic Recommendation</p>
                  <p className="text-slate-300 text-sm">{result.recommendation}</p>
                </div>
              )}
            </div>
          )}

          <button onClick={handleResearch}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
            ↺ Re-research
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-white font-semibold mb-1">Competition Research</p>
          <p className="text-slate-500 text-sm">Discover competitors, market gaps and your unique advantages</p>
        </div>
      )}
    </div>
  )
}

export default CompetitionResearch