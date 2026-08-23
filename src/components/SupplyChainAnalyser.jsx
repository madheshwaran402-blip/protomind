import { useState } from 'react'
import { analyseSupplyChain, saveSupplyChain, getSupplyChain } from '../services/supplyChainService'
import { notify } from '../services/toast'

const RISK_STYLES = {
  Low: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800', icon: '🟢' },
  Medium: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800', icon: '🟡' },
  High: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800', icon: '🔴' },
}

function SupplyChainAnalyser({ idea, components }) {
  const [result, setResult] = useState(getSupplyChain(idea))
  const [loading, setLoading] = useState(false)

  async function handleAnalyse() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await analyseSupplyChain(idea, components)
      setResult(data)
      saveSupplyChain(idea, data)
      notify.success('Supply chain analysis complete!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const riskColor = result ? (result.riskScore <= 30 ? '#22c55e' : result.riskScore <= 60 ? '#f59e0b' : '#ef4444') : '#6366f1'

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Analyse supply chain risks, component availability and lead times</p>
        <button onClick={handleAnalyse} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-orange-700 hover:bg-orange-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Analysing...' : 'Analyse Supply Chain'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Analysing supply chain...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 flex items-center gap-5">
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#1e1e2e" strokeWidth="5" />
                <circle cx="32" cy="32" r="28" fill="none" stroke={riskColor} strokeWidth="5"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - result.riskScore / 100)} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm font-black" style={{ color: riskColor }}>{result.riskScore}</p>
              </div>
            </div>
            <div>
              <p className="text-white font-bold">Supply Chain Risk Score</p>
              <p className="text-slate-400 text-xs">{result.riskScore <= 30 ? 'Low risk - good supply chain' : result.riskScore <= 60 ? 'Medium risk - some concerns' : 'High risk - action needed'}</p>
            </div>
          </div>

          <div className="space-y-2">
            {(result.components || []).map(function(comp, i) {
              const rStyle = RISK_STYLES[comp.riskLevel] || RISK_STYLES.Medium
              return (
                <div key={i} className={'rounded-xl border p-4 ' + rStyle.bg + ' ' + rStyle.border}>
                  <div className="flex items-center gap-2 mb-2">
                    <span>{rStyle.icon}</span>
                    <p className="text-white font-bold text-sm">{comp.name}</p>
                    <span className={'text-xs ml-auto ' + rStyle.color}>{comp.riskLevel} Risk</span>
                  </div>
                  <div className="flex gap-3 text-xs mb-1">
                    {comp.availability && <span className="text-slate-400">Stock: {comp.availability}</span>}
                    {comp.leadTime && <span className="text-slate-400">Lead time: {comp.leadTime}</span>}
                  </div>
                  {comp.alternativeSuppliers && comp.alternativeSuppliers.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {comp.alternativeSuppliers.map(function(sup, j) {
                        return <span key={j} className="text-xs bg-[#0d0d1a] text-slate-400 border border-[#2e2e4e] px-1.5 py-0.5 rounded-full">{sup}</span>
                      })}
                    </div>
                  )}
                  {comp.notes && <p className="text-slate-500 text-xs mt-1">{comp.notes}</p>}
                </div>
              )
            })}
          </div>

          {result.recommendations && result.recommendations.length > 0 && (
            <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
              <p className="text-indigo-400 text-xs font-semibold mb-2">Recommendations</p>
              <ul className="space-y-1">
                {result.recommendations.map(function(rec, i) {
                  return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-indigo-400">{i+1}.</span>{rec}</li>
                })}
              </ul>
            </div>
          )}

          <button onClick={handleAnalyse} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Re-analyse</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🏭</div>
          <p className="text-white font-semibold mb-1">Supply Chain Analyser</p>
          <p className="text-slate-500 text-sm">Analyse component availability, lead times and supply chain risks</p>
        </div>
      )}
    </div>
  )
}

export default SupplyChainAnalyser
