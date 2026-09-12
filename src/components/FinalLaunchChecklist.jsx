import { useState } from 'react'
import { generateFinalLaunchChecklist, saveFinalLaunch, getFinalLaunch } from '../services/finalLaunchService'
import { notify } from '../services/toast'
const CAT_COLORS=['#ef4444','#f59e0b','#22c55e','#6366f1','#0ea5e9','#a855f7']
function FinalLaunchChecklist({ idea, components }) {
  const saved = getFinalLaunch(idea)
  const [result, setResult] = useState(saved)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState({})
  const [activeCategory, setActiveCategory] = useState(0)
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await generateFinalLaunchChecklist(idea, components); setResult(d); saveFinalLaunch(idea, d); setDone({}); notify.success('Final launch checklist ready!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  function toggle(catIdx, itemIdx) { const key = catIdx+'_'+itemIdx; setDone(function(p){return Object.assign({},p,{[key]:!p[key]})}) }
  const categories = result?.categories || []
  const allItems = categories.flatMap(function(c,ci){return (c.items||[]).map(function(item,ii){return {key:ci+'_'+ii,critical:item.critical}})})
  const doneCount = allItems.filter(function(i){return done[i.key]}).length
  const criticalLeft = allItems.filter(function(i){return i.critical && !done[i.key]}).length
  const pct = allItems.length > 0 ? Math.round(doneCount/allItems.length*100) : 0
  const launchReady = criticalLeft === 0 && pct >= 80
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">The definitive final checklist before you hit launch</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-red-700 hover:bg-red-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Building...':'Build Final Checklist'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Building final launch checklist...</p></div>}
      {result&&!loading&&(
        <>
          <div className={launchReady?'bg-green-950 border-green-700 border rounded-2xl p-5':'bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5'}>
            <div className="flex items-center gap-3 mb-3"><div className="text-4xl">{launchReady?'🚀':'⏳'}</div><div><p className="text-white font-black text-xl">{launchReady?'READY TO LAUNCH!':'Launch Readiness'}</p><p className={launchReady?'text-green-400 text-xs':'text-slate-400 text-xs'}>{doneCount}/{allItems.length} tasks done {criticalLeft>0&&'• '+criticalLeft+' critical items remain'}</p></div></div>
            <div className="w-full bg-[#1e1e2e] rounded-full h-3"><div className={'h-3 rounded-full transition-all '+(pct>=80?'bg-green-600':pct>=50?'bg-yellow-600':'bg-red-600')} style={{width:pct+'%'}}/></div>
            <p className="text-right text-xs text-slate-500 mt-1">{pct}%</p>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">{categories.map(function(cat,i){const color=CAT_COLORS[i%CAT_COLORS.length];const catDone=(cat.items||[]).filter(function(item,ii){return done[i+'_'+ii]}).length;return<button key={i} onClick={function(){setActiveCategory(i)}} className={'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition '+(activeCategory===i?'text-white':'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')} style={activeCategory===i?{backgroundColor:color}:{}}>{cat.icon} {cat.name} <span className="opacity-70">({catDone}/{(cat.items||[]).length})</span></button>})}</div>
          {categories[activeCategory]&&<div className="space-y-1">{(categories[activeCategory].items||[]).map(function(item,ii){const key=activeCategory+'_'+ii;const isDone=!!done[key];return(<div key={ii} onClick={function(){toggle(activeCategory,ii)}} className={'flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition '+(isDone?'opacity-50 bg-[#0d0d1a] border-[#1e1e2e]':item.critical?'bg-red-950 border-red-900 hover:border-red-700':'bg-[#13131f] border-[#2e2e4e] hover:border-green-700')}><div className={'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 '+(isDone?'bg-green-600 border-green-500':'border-[#2e2e4e]')}>{isDone&&<span className="text-white text-xs">v</span>}</div><div className="flex-1"><p className={'text-sm '+(isDone?'line-through text-slate-500':item.critical?'text-red-200 font-medium':'text-white')}>{item.task}</p>{item.timeBeforeLaunch&&<p className="text-slate-500 text-xs">{item.timeBeforeLaunch}</p>}</div>{item.critical&&!isDone&&<span className="text-xs bg-red-900 text-red-300 border border-red-700 px-1.5 py-0.5 rounded-full shrink-0">Critical</span>}</div>)})}</div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Rebuild</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">🚀</div><p className="text-white font-semibold mb-1">Final Launch Checklist</p><p className="text-slate-500 text-sm">The definitive pre-launch checklist covering every critical item</p></div>}
    </div>
  )
}
export default FinalLaunchChecklist
