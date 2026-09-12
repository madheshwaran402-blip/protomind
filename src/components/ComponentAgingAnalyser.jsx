import { useState } from 'react'
import { analyseComponentAging, saveAgingAnalysis, getAgingAnalysis } from '../services/componentAgingService'
import { notify } from '../services/toast'
function ComponentAgingAnalyser({ idea, components }) {
  const [result, setResult] = useState(getAgingAnalysis(idea))
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await analyseComponentAging(idea, components); setResult(d); saveAgingAnalysis(idea, d); notify.success('Aging analysis complete!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  const comps = result?.components || []
  const active = comps[selected]
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Analyse component aging, failure modes and replacement intervals</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-orange-700 hover:bg-orange-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Analysing...':'Analyse Aging'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Analysing component aging...</p></div>}
      {result&&!loading&&(
        <>
          <div className="flex gap-1 overflow-x-auto pb-1">{comps.map(function(c,i){return<button key={i} onClick={function(){setSelected(i)}} className={'flex-shrink-0 px-3 py-2 rounded-xl text-xs transition '+(selected===i?'bg-orange-700 text-white':'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')}>{c.name}</button>})}</div>
          {active&&<div className="space-y-3">
            <div className="bg-orange-950 border border-orange-800 rounded-xl p-4"><p className="text-white font-black text-xl">{active.name}</p>{active.expectedLifespan&&<p className="text-orange-400 text-sm">Expected lifespan: {active.expectedLifespan}</p>}{active.failureMode&&<p className="text-slate-400 text-xs mt-1">Failure: {active.failureMode}</p>}{active.replacementInterval&&<p className="text-yellow-400 text-xs">Replace every: {active.replacementInterval}</p>}</div>}
            {active.wearIndicators?.length>0&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-slate-500 text-xs font-semibold mb-2">Wear Indicators</p><ul className="space-y-1">{active.wearIndicators.map(function(w,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-orange-400 shrink-0">!</span>{w}</li>})}</ul></div>}
            {active.maintenanceTips?.length>0&&<div className="bg-green-950 border border-green-800 rounded-xl p-4"><p className="text-green-400 text-xs font-semibold mb-2">Maintenance Tips</p><ul className="space-y-1">{active.maintenanceTips.map(function(t,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-green-400 shrink-0">{i+1}.</span>{t}</li>})}</ul></div>}
          </div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Re-analyse</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">⏳</div><p className="text-white font-semibold mb-1">Component Aging Analyser</p><p className="text-slate-500 text-sm">Analyse lifespan, failure modes and maintenance requirements</p></div>}
    </div>
  )
}
export default ComponentAgingAnalyser
