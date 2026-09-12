import { useState } from 'react'
import { projectRevenue, saveRevenue, getRevenue } from '../services/revenueProjectionService'
import { notify } from '../services/toast'
const SCENARIO_COLORS=['#22c55e','#6366f1','#ef4444']
function RevenueProjection({ idea, components }) {
  const [result, setResult] = useState(getRevenue(idea))
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await projectRevenue(idea, components); setResult(d); saveRevenue(idea, d); notify.success('Revenue projections ready!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  const scenarios = result?.scenarios || []
  const active = scenarios[selected]
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Project revenue across optimistic, realistic and pessimistic scenarios</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Projecting...':'Project Revenue'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Projecting revenue...</p></div>}
      {result&&!loading&&(
        <>
          <div className="grid grid-cols-2 gap-2">{result.breakEven&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center"><p className="text-slate-500 text-xs">Break Even</p><p className="text-emerald-400 font-bold mt-1">{result.breakEven}</p></div>}{result.burnRate&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center"><p className="text-slate-500 text-xs">Burn Rate</p><p className="text-red-400 font-bold mt-1">{result.burnRate}</p></div>}</div>
          <div className="flex gap-1">{scenarios.map(function(sc,i){const color=SCENARIO_COLORS[i]||'#6366f1';return<button key={i} onClick={function(){setSelected(i)}} className={'flex-1 py-2 rounded-xl text-xs font-bold transition '+(selected===i?'text-white':'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')} style={selected===i?{backgroundColor:color}:{}}>{sc.name}</button>})}</div>
          {active&&<div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">{[['Year 1',active.year1,'#6366f1'],['Year 2',active.year2,'#0ea5e9'],['Year 3',active.year3,'#22c55e']].map(function(yr){return yr[1]&&(<div key={yr[0]} className="rounded-xl border p-3 text-center" style={{backgroundColor:yr[2]+'12',borderColor:yr[2]+'30'}}><p className="text-slate-500 text-xs">{yr[0]}</p><p className="font-black text-lg" style={{color:yr[2]}}>{yr[1]}</p></div>)})}</div>
            {active.assumptions?.length>0&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-slate-500 text-xs font-semibold mb-2">Assumptions</p><ul className="space-y-1">{active.assumptions.map(function(a,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-emerald-400 shrink-0">+</span>{a}</li>})}</ul></div>}
            {active.risks?.length>0&&<div className="bg-red-950 border border-red-900 rounded-xl p-4"><p className="text-red-400 text-xs font-semibold mb-2">Risks</p><ul className="space-y-1">{active.risks.map(function(r,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-red-400 shrink-0">!</span>{r}</li>})}</ul></div>}
          </div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Reproject</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">📈</div><p className="text-white font-semibold mb-1">Revenue Projection</p><p className="text-slate-500 text-sm">Project 3-year revenue across optimistic, realistic and pessimistic scenarios</p></div>}
    </div>
  )
}
export default RevenueProjection
