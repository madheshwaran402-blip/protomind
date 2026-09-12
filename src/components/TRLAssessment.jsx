import { useState } from 'react'
import { assessTRL, saveTRL, getTRL } from '../services/trlAssessmentService'
import { notify } from '../services/toast'
const TRL_COLORS=['#ef4444','#ef4444','#f97316','#f59e0b','#f59e0b','#eab308','#22c55e','#22c55e','#16a34a','#15803d']
const TRL_NAMES=['','Basic Research','Tech Concept','Proof of Concept','Lab Validation','Relevant Environment','Demonstration','Prototype Demo','System Complete','Actual System','Mission Proven']
function TRLAssessment({ idea, components }) {
  const [result, setResult] = useState(getTRL(idea))
  const [loading, setLoading] = useState(false)
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await assessTRL(idea, components); setResult(d); saveTRL(idea, d); notify.success('TRL assessed: Level '+d.currentTRL) }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  const trl = result?.currentTRL || 0
  const color = TRL_COLORS[trl] || '#6366f1'
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Assess your Technology Readiness Level (TRL 1-9) with gaps and next steps</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Assessing...':'Assess TRL'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Assessing TRL...</p></div>}
      {result&&!loading&&(
        <>
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
            <div className="flex items-center gap-5 mb-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center shrink-0" style={{backgroundColor:color+'20',border:'4px solid '+color}}>
                <p className="font-black text-3xl" style={{color}}>TRL{trl}</p>
              </div>
              <div><p className="text-white font-black text-xl">{TRL_NAMES[trl]||result.currentLevel?.name}</p>{result.recommendation&&<p className="text-slate-400 text-xs mt-1">{result.recommendation}</p>}</div>
            </div>
            <div className="flex gap-1">{[1,2,3,4,5,6,7,8,9].map(function(n){const c=TRL_COLORS[n];return<div key={n} className={'flex-1 h-2 rounded-full '+(n<=trl?'':'opacity-20')} style={{backgroundColor:c}} />})}</div>
            <div className="flex justify-between text-xs text-slate-600 mt-1"><span>TRL 1</span><span>TRL 9</span></div>
          </div>
          {result.currentLevel&&<div className="grid grid-cols-2 gap-2">
            <div className="bg-green-950 border border-green-800 rounded-xl p-4"><p className="text-green-400 text-xs font-semibold mb-2">Achieved</p><ul className="space-y-1">{(result.currentLevel.achieved||[]).map(function(a,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-green-400 shrink-0">+</span>{a}</li>})}</ul></div>
            <div className="bg-red-950 border border-red-900 rounded-xl p-4"><p className="text-red-400 text-xs font-semibold mb-2">Gaps</p><ul className="space-y-1">{(result.currentLevel.gaps||[]).map(function(g,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-red-400 shrink-0">-</span>{g}</li>})}</ul></div>
          </div>}
          {result.nextLevel&&<div className="bg-indigo-950 border border-indigo-800 rounded-xl p-4"><p className="text-indigo-400 text-xs font-semibold mb-2">To reach {result.nextLevel.name}</p><ul className="space-y-1">{(result.nextLevel.requirements||[]).map(function(r,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-indigo-400 shrink-0">{i+1}.</span>{r}</li>})}</ul>{result.nextLevel.estimatedTime&&<p className="text-slate-500 text-xs mt-2">Est. time: {result.nextLevel.estimatedTime}</p>}</div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Re-assess</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">🔬</div><p className="text-white font-semibold mb-1">TRL Assessment</p><p className="text-slate-500 text-sm">Assess Technology Readiness Level with gaps and advancement path</p></div>}
    </div>
  )
}
export default TRLAssessment
