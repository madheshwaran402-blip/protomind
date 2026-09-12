import { useState } from 'react'
import { validateIdea, saveValidation, getValidation } from '../services/ideaValidationService'
import { notify } from '../services/toast'
function IdeaValidationScorer({ idea, components }) {
  const [result, setResult] = useState(getValidation(idea))
  const [loading, setLoading] = useState(false)
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await validateIdea(idea, components); setResult(d); saveValidation(idea, d); notify.success('Idea validated! Score: '+d.score+'/100') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  const sc = result?.score || 0
  const scColor = sc>=70?'#22c55e':sc>=50?'#f59e0b':'#ef4444'
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Score your hardware idea across multiple validation dimensions</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Validating...':'Validate Idea'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Validating idea...</p></div>}
      {result&&!loading&&(
        <>
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 flex items-center gap-5">
            <div className="relative w-20 h-20 shrink-0"><svg className="w-full h-full -rotate-90" viewBox="0 0 80 80"><circle cx="40" cy="40" r="35" fill="none" stroke="#1e1e2e" strokeWidth="6"/><circle cx="40" cy="40" r="35" fill="none" stroke={scColor} strokeWidth="6" strokeDasharray={2*Math.PI*35} strokeDashoffset={2*Math.PI*35*(1-sc/100)} strokeLinecap="round"/></svg><div className="absolute inset-0 flex items-center justify-center"><p className="text-xl font-black" style={{color:scColor}}>{sc}</p></div></div>
            <div><p className="text-white font-bold text-xl">Idea Score</p>{result.verdict&&<p className="font-bold mt-0.5" style={{color:scColor}}>{result.verdict}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">{(result.dimensions||[]).map(function(dim,i){const c=dim.score>=70?'#22c55e':dim.score>=50?'#f59e0b':'#ef4444';return(<div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3"><div className="flex items-center justify-between mb-1"><p className="text-white text-xs font-medium">{dim.name}</p><span className="text-xs font-bold" style={{color:c}}>{dim.score}</span></div><div className="w-full bg-[#1e1e2e] rounded-full h-1.5 mb-1"><div className="h-1.5 rounded-full" style={{width:dim.score+'%',backgroundColor:c}}/></div>{dim.verdict&&<p className="text-slate-500 text-xs">{dim.verdict}</p>}</div>)})}</div>
          <div className="grid grid-cols-2 gap-2">
            {result.goSignals?.length>0&&<div className="bg-green-950 border border-green-800 rounded-xl p-4"><p className="text-green-400 text-xs font-semibold mb-2">Go Signals</p><ul className="space-y-1">{result.goSignals.map(function(s,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-green-400 shrink-0">+</span>{s}</li>})}</ul></div>}
            {result.topRisks?.length>0&&<div className="bg-red-950 border border-red-900 rounded-xl p-4"><p className="text-red-400 text-xs font-semibold mb-2">Top Risks</p><ul className="space-y-1">{result.topRisks.map(function(r,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-red-400 shrink-0">!</span>{r}</li>})}</ul></div>}
          </div>
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Re-validate</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">💡</div><p className="text-white font-semibold mb-1">Idea Validation Scorer</p><p className="text-slate-500 text-sm">Score your idea across market, technical, financial and feasibility dimensions</p></div>}
    </div>
  )
}
export default IdeaValidationScorer
