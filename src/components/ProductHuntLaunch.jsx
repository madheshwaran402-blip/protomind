import { useState } from 'react'
import { generateProductHuntLaunch, saveProductHunt, getProductHunt } from '../services/productHuntService'
import { notify } from '../services/toast'
function ProductHuntLaunch({ idea, components }) {
  const [result, setResult] = useState(getProductHunt(idea))
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(null)
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await generateProductHuntLaunch(idea, components); setResult(d); saveProductHunt(idea, d); notify.success('Product Hunt launch strategy ready!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  function copy(text, idx) { navigator.clipboard.writeText(text); setCopied(idx); setTimeout(function(){setCopied(null)},2000); notify.success('Copied!') }
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate complete Product Hunt launch strategy with tagline and schedule</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-orange-700 hover:bg-orange-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Generating...':'Generate Launch'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Generating Product Hunt strategy...</p></div>}
      {result&&!loading&&(
        <>
          {result.tagline&&<div className="bg-orange-950 border border-orange-800 rounded-2xl p-5"><p className="text-orange-400 text-xs font-semibold mb-1">Tagline</p><p className="text-white font-black text-xl">"{result.tagline}"</p><button onClick={function(){copy(result.tagline,0)}} className="text-xs text-slate-500 hover:text-white mt-1">{copied===0?'ok':'copy'}</button></div>}
          {result.description&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-slate-500 text-xs font-semibold mb-1">Description</p><p className="text-slate-300 text-sm">{result.description}</p><button onClick={function(){copy(result.description,1)}} className="text-xs text-slate-500 hover:text-white mt-1">{copied===1?'ok':'copy'}</button></div>}
          {result.firstComment&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-orange-400 text-xs font-semibold mb-1">First Comment (Maker comment)</p><p className="text-slate-300 text-sm">{result.firstComment}</p><button onClick={function(){copy(result.firstComment,2)}} className="text-xs text-slate-500 hover:text-white mt-1">{copied===2?'ok':'copy'}</button></div>}
          {result.topics?.length>0&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-slate-500 text-xs font-semibold mb-2">Topics</p><div className="flex flex-wrap gap-1">{result.topics.map(function(t,i){return<span key={i} className="text-xs bg-orange-950 text-orange-400 border border-orange-800 px-2 py-0.5 rounded-full">{t}</span>})}</div></div>}
          {result.launchDaySchedule?.length>0&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-slate-500 text-xs font-semibold mb-2">Launch Day Schedule</p><div className="space-y-1">{result.launchDaySchedule.map(function(item,i){return<div key={i} className="flex gap-3 text-xs"><span className="text-orange-400 shrink-0 w-16">{item.time}</span><p className="text-slate-300">{item.action}</p></div>})}</div></div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">🚀</div><p className="text-white font-semibold mb-1">Product Hunt Launch</p><p className="text-slate-500 text-sm">Generate tagline, description, maker comment and launch day schedule</p></div>}
    </div>
  )
}
export default ProductHuntLaunch
