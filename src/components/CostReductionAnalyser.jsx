import { useState } from 'react'
import { analyseCostReduction, saveCostReduction, getCostReduction } from '../services/costReductionService'
import { notify } from '../services/toast'
function CostReductionAnalyser({ idea, components }) {
  const [result, setResult] = useState(getCostReduction(idea))
  const [loading, setLoading] = useState(false)
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await analyseCostReduction(idea, components); setResult(d); saveCostReduction(idea, d); notify.success('Cost reduction analysis complete!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  const RISK={Low:'text-green-400',Medium:'text-yellow-400',High:'text-red-400'}
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Find opportunities to reduce hardware costs without sacrificing quality</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-green-700 hover:bg-green-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Analysing...':'Analyse Costs'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Analysing cost reduction...</p></div>}
      {result&&!loading&&(
        <>
          {result.totalSaving&&<div className="bg-green-950 border border-green-800 rounded-2xl p-5 text-center"><p className="text-green-400 text-xs font-semibold mb-1">Total Potential Saving</p><p className="text-white font-black text-4xl">{result.totalSaving}</p></div>}
          <div className="space-y-2">{(result.opportunities||[]).map(function(opp,i){const rc=RISK[opp.risk]||RISK.Medium;return(<div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><div className="flex items-center gap-2 mb-2"><p className="text-white font-bold text-sm flex-1">{opp.area}</p><span className={'text-xs '+rc}>{opp.risk} risk</span></div><div className="grid grid-cols-3 gap-2 text-xs mb-2"><div className="bg-red-950 rounded-lg p-2 text-center"><p className="text-red-400">Current</p><p className="text-white font-bold">{opp.currentCost}</p></div><div className="bg-green-950 rounded-lg p-2 text-center"><p className="text-green-400">Reduced</p><p className="text-white font-bold">{opp.reducedCost}</p></div><div className="bg-yellow-950 rounded-lg p-2 text-center"><p className="text-yellow-400">Saving</p><p className="text-white font-bold">{opp.saving}</p></div></div><p className="text-slate-400 text-xs">{opp.method}</p></div>)})}</div>
          {result.quickWins?.length>0&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-green-400 text-xs font-semibold mb-2">Quick Wins</p><ul className="space-y-1">{result.quickWins.map(function(w,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-green-400 shrink-0">+</span>{w}</li>})}</ul></div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Re-analyse</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">💸</div><p className="text-white font-semibold mb-1">Cost Reduction Analyser</p><p className="text-slate-500 text-sm">Find opportunities to reduce BOM and production costs</p></div>}
    </div>
  )
}
export default CostReductionAnalyser
