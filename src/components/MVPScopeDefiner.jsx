import { useState } from 'react'
import { defineMVPScope, saveMVP, getMVP } from '../services/mvpScopeService'
import { notify } from '../services/toast'
function MVPScopeDefiner({ idea, components }) {
  const [result, setResult] = useState(getMVP(idea))
  const [loading, setLoading] = useState(false)
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await defineMVPScope(idea, components); setResult(d); saveMVP(idea, d); notify.success('MVP scope defined!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Define your MVP scope using MoSCoW prioritisation framework</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Defining...':'Define MVP'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Defining MVP scope...</p></div>}
      {result&&!loading&&(
        <>
          <div className="grid grid-cols-3 gap-2">
            {result.validationGoal&&<div className="col-span-3 bg-emerald-950 border border-emerald-800 rounded-xl p-3"><p className="text-emerald-400 text-xs font-semibold">Validation Goal</p><p className="text-white text-sm">{result.validationGoal}</p></div>}
            {result.successMetric&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center"><p className="text-slate-500 text-xs">Success Metric</p><p className="text-white text-xs font-bold mt-1">{result.successMetric}</p></div>}
            {result.timeToMVP&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center col-span-2"><p className="text-slate-500 text-xs">Time to MVP</p><p className="text-emerald-400 font-bold mt-1">{result.timeToMVP}</p></div>}
          </div>
          {[{key:'mustHave',label:'Must Have',color:'#ef4444',bg:'bg-red-950',border:'border-red-800'},{key:'shouldHave',label:'Should Have',color:'#f59e0b',bg:'bg-yellow-950',border:'border-yellow-800'},{key:'wontHave',label:'Wont Have (Now)',color:'#6366f1',bg:'bg-indigo-950',border:'border-indigo-800'}].map(function(sec){return result[sec.key]?.length>0&&(<div key={sec.key} className={sec.bg+' '+sec.border+' border rounded-xl p-4'}><p className="text-xs font-semibold mb-2" style={{color:sec.color}}>{sec.label}</p><ul className="space-y-1">{result[sec.key].map(function(item,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span style={{color:sec.color}} className="shrink-0">+</span>{item}</li>})}</ul></div>)})}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Redefine</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">🎯</div><p className="text-white font-semibold mb-1">MVP Scope Definer</p><p className="text-slate-500 text-sm">Define MVP scope with MoSCoW prioritisation and validation goals</p></div>}
    </div>
  )
}
export default MVPScopeDefiner
