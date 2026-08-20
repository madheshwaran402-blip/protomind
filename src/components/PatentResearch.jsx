import { useState } from 'react'
import { researchPatents, savePatentResearch, getPatentResearch } from '../services/patentResearchService'
import { notify } from '../services/toast'

const PATENTABILITY_STYLES = {
  High: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800', icon: '🟢' },
  Medium: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800', icon: '🟡' },
  Low: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800', icon: '🔴' },
}

function PatentResearch({ idea, components }) {
  const [result, setResult] = useState(getPatentResearch(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  async function handleResearch() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await researchPatents(idea, components)
      setResult(data)
      savePatentResearch(idea, data)
      notify.success('Patent research complete!')
    } catch { notify.error('Research failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const patStyle = result ? (PATENTABILITY_STYLES[result.patentability] || PATENTABILITY_STYLES.Medium) : null
  const TABS = [{ id: 'overview', label: '📋 Overview' }, { id: 'claims', label: '📜 Claims' }, { id: 'priorart', label: '🔍 Prior Art' }]

  return (
    <div className="space-y-4">
      <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-3">
        <p className="text-yellow-400 text-xs">⚠️ AI-generated for educational purposes only. Consult a patent attorney for legal advice.</p>
      </div>
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">AI researches the patent landscape and identifies potential claims</p>
        <button onClick={handleResearch} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? '📜 Researching...' : '📜 Research Patents'}
        </button>
      </div>
      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Researching patent landscape...</p>
        </div>
      )}
      {result && !loading && (
        <>
          <div className={'rounded-2xl border p-5 flex items-center gap-4 ' + patStyle.bg + ' ' + patStyle.border}>
            <span className="text-4xl">{patStyle.icon}</span>
            <div className="flex-1">
              <p className={'font-black text-lg ' + patStyle.color}>{result.patentability} Patentability</p>
              <p className="text-slate-400 text-sm">Novelty Score: {result.noveltyScore}/100</p>
              <div className="w-full bg-[#1e1e2e] rounded-full h-2 mt-1">
                <div className="h-2 rounded-full" style={{ width: result.noveltyScore + '%', backgroundColor: result.noveltyScore >= 70 ? '#22c55e' : result.noveltyScore >= 40 ? '#f59e0b' : '#ef4444' }} />
              </div>
            </div>
          </div>
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (activeTab === tab.id ? 'bg-indigo-700 text-white' : 'text-slate-500 hover:text-white')}>
                  {tab.label}
                </button>
              )
            })}
          </div>
          {activeTab === 'overview' && (
            <div className="space-y-3">
              {result.relatedPatentAreas && result.relatedPatentAreas.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-2">Related Patent Areas</p>
                  <div className="flex flex-wrap gap-1">
                    {result.relatedPatentAreas.map(function(area, i) {
                      return <span key={i} className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded-full">{area}</span>
                    })}
                  </div>
                </div>
              )}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
                  <p className="text-indigo-400 text-xs font-semibold mb-2">💡 Recommendations</p>
                  <ul className="space-y-1">
                    {result.recommendations.map(function(rec, i) {
                      return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-indigo-400">{i+1}.</span>{rec}</li>
                    })}
                  </ul>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={function() { window.open('https://patents.google.com/?q=' + encodeURIComponent(idea), '_blank') }}
                  className="flex-1 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition">
                  🔍 Google Patents
                </button>
              </div>
            </div>
          )}
          {activeTab === 'claims' && (
            <div className="space-y-2">
              {(result.potentialClaims || []).map(function(claim, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 px-1.5 py-0.5 rounded">{claim.type}</span>
                      <span className="text-xs text-slate-400">{claim.strength}</span>
                    </div>
                    <p className="text-slate-300 text-sm">{claim.claim}</p>
                  </div>
                )
              })}
            </div>
          )}
          {activeTab === 'priorart' && (
            <div className="space-y-2">
              {(result.priorArt || []).map(function(art, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-semibold text-sm">{art.area}</p>
                      <span className="text-xs text-slate-400">{art.impact} impact</span>
                    </div>
                    <p className="text-slate-400 text-xs">{art.description}</p>
                  </div>
                )
              })}
            </div>
          )}
          <button onClick={handleResearch} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">↺ Re-research</button>
        </>
      )}
      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">📜</div>
          <p className="text-white font-semibold mb-1">Patent Research Tool</p>
          <p className="text-slate-500 text-sm">Research patentability, potential claims and prior art</p>
        </div>
      )}
    </div>
  )
}

export default PatentResearch
