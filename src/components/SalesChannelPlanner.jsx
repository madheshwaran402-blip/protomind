import { useState } from 'react'
import { planSalesChannels, saveSalesChannels, getSalesChannels } from '../services/salesChannelService'
import { notify } from '../services/toast'
const TYPE_COLORS={Online:'#6366f1',Retail:'#22c55e',B2B:'#0ea5e9',Direct:'#f59e0b',Marketplace:'#a855f7'}
function SalesChannelPlanner({ idea, components }) {
  const [result, setResult] = useState(getSalesChannels(idea))
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await planSalesChannels(idea, components); setResult(d); saveSalesChannels(idea, d); notify.success((d.channels||[]).length+' sales channels planned!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  const channels = result?.channels || []
  const active = channels[selected]
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Plan your sales channels from direct to marketplace distribution</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-blue-700 hover:bg-blue-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Planning...':'Plan Channels'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Planning sales channels...</p></div>}
      {result&&!loading&&(
        <>
          <div className="flex gap-1 overflow-x-auto pb-1">{channels.map(function(ch,i){const color=TYPE_COLORS[ch.type]||'#6366f1';return<button key={i} onClick={function(){setSelected(i)}} className={'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition '+(selected===i?'text-white':'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')} style={selected===i?{backgroundColor:color}:{}}>{ch.name}</button>})}</div>
          {active&&<div className="space-y-3">
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-4"><div className="flex items-center gap-3 mb-2"><p className="text-white font-black text-xl">{active.name}</p>{active.type&&<span className="text-xs px-2 py-0.5 rounded" style={{backgroundColor:(TYPE_COLORS[active.type]||'#6366f1')+'20',color:TYPE_COLORS[active.type]||'#6366f1'}}>{active.type}</span>}</div><div className="flex gap-4 text-xs">{active.potential&&<span className="text-green-400">Potential: {active.potential}</span>}{active.effort&&<span className="text-yellow-400">Effort: {active.effort}</span>}{active.commission&&<span className="text-red-400">Commission: {active.commission}</span>}</div></div>
            {active.steps?.length>0&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-slate-500 text-xs font-semibold mb-2">Setup Steps</p><ol className="space-y-1">{active.steps.map(function(s,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-blue-400 shrink-0">{i+1}.</span>{s}</li>})}</ol></div>}
            <div className="flex gap-2"><button onClick={function(){setSelected(Math.max(0,selected-1))}} disabled={selected===0} className="flex-1 py-1.5 bg-[#1e1e2e] text-slate-400 rounded-lg text-xs disabled:opacity-30">Prev</button><button onClick={function(){setSelected(Math.min(channels.length-1,selected+1))}} disabled={selected===channels.length-1} className="flex-1 py-1.5 bg-blue-700 text-white rounded-lg text-xs disabled:opacity-30">Next</button></div>
          </div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Replan</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">🏪</div><p className="text-white font-semibold mb-1">Sales Channel Planner</p><p className="text-slate-500 text-sm">Plan sales channels from direct to marketplace distribution</p></div>}
    </div>
  )
}
export default SalesChannelPlanner
