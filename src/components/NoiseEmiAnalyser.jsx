import { useState } from 'react'
import { analyseNoise, saveNoiseAnalysis, getNoiseAnalysis } from '../services/noiseEmiService'
import { notify } from '../services/toast'

const RISK_STYLES = {
  Low: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800', icon: '🟢' },
  Medium: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800', icon: '🟡' },
  High: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800', icon: '🔴' },
}

function NoiseEmiAnalyser({ idea, components }) {
  const [result, setResult] = useState(getNoiseAnalysis(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('sources')

  async function handleAnalyse() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await analyseNoise(idea, components)
      setResult(data)
      saveNoiseAnalysis(idea, data)
      notify.success('EMI analysis complete!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const riskStyle = result ? (RISK_STYLES[result.overallRisk] || RISK_STYLES.Medium) : null
  const TABS = [{ id: 'sources', label: 'Noise Sources' }, { id: 'shielding', label: 'Shielding' }, { id: 'filtering', label: 'Filtering' }]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Analyse EMI and noise risks to protect your prototype from interference</p>
        <button onClick={handleAnalyse} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-purple-700 hover:bg-purple-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Analysing...' : 'Analyse EMI'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Analysing noise and EMI...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className={'rounded-2xl border p-4 flex items-center gap-4 ' + riskStyle.bg + ' ' + riskStyle.border}>
            <span className="text-4xl">{riskStyle.icon}</span>
            <div>
              <p className={'font-black text-xl ' + riskStyle.color}>{result.overallRisk} EMI Risk</p>
              <p className="text-slate-400 text-xs">{(result.noiseSources || []).length} noise sources identified</p>
            </div>
          </div>

          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (activeTab === tab.id ? 'bg-purple-700 text-white' : 'text-slate-500 hover:text-white')}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'sources' && (
            <div className="space-y-2">
              {(result.noiseSources || []).map(function(ns, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-bold text-sm">{ns.source}</p>
                      {ns.frequency && <span className="text-purple-400 text-xs">{ns.frequency}</span>}
                      {ns.level && <span className="text-slate-500 text-xs ml-auto">{ns.level}</span>}
                    </div>
                    {ns.affectedComponents?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {ns.affectedComponents.map(function(c, j) {
                          return <span key={j} className="text-xs bg-[#0d0d1a] text-slate-400 border border-[#2e2e4e] px-1.5 py-0.5 rounded-full">Affects: {c}</span>
                        })}
                      </div>
                    )}
                    {ns.mitigation && <p className="text-green-400 text-xs">Fix: {ns.mitigation}</p>}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'shielding' && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs text-slate-500 font-semibold mb-2">Shielding Recommendations</p>
              <ul className="space-y-2">
                {(result.shieldingRecommendations || []).map(function(rec, i) {
                  return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-purple-400 shrink-0">{i+1}.</span>{rec}</li>
                })}
              </ul>
            </div>
          )}

          {activeTab === 'filtering' && (
            <div className="space-y-2">
              {(result.filteringTips || []).map(function(tip, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-bold text-sm">{tip.filter}</p>
                      <span className="text-slate-500 text-xs ml-auto">@ {tip.location}</span>
                    </div>
                    <p className="text-slate-400 text-xs">{tip.reason}</p>
                  </div>
                )
              })}
            </div>
          )}

          <button onClick={handleAnalyse} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Re-analyse</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">📡</div>
          <p className="text-white font-semibold mb-1">Noise & EMI Analyser</p>
          <p className="text-slate-500 text-sm">Identify noise sources and get shielding and filtering recommendations</p>
        </div>
      )}
    </div>
  )
}

export default NoiseEmiAnalyser
