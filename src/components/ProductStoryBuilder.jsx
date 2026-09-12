import { useState } from 'react'
import { generateProductStory, saveProductStory, getProductStory } from '../services/productStoryService'
import { notify } from '../services/toast'
function ProductStoryBuilder({ idea, components }) {
  const [result, setResult] = useState(getProductStory(idea))
  const [loading, setLoading] = useState(false)
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await generateProductStory(idea, components); setResult(d); saveProductStory(idea, d); notify.success('Product story ready!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  const sections = result ? [
    {key:'origin',label:'Origin Story',icon:'🌱',color:'text-green-400'},
    {key:'problem',label:'The Problem',icon:'❗',color:'text-red-400'},
    {key:'hero',label:'The Hero (User)',icon:'🦸',color:'text-blue-400'},
    {key:'solution',label:'The Solution',icon:'💡',color:'text-yellow-400'},
    {key:'impact',label:'The Impact',icon:'🌍',color:'text-purple-400'},
    {key:'vision',label:'The Vision',icon:'🔮',color:'text-indigo-400'},
  ] : []
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Craft a compelling narrative around your product for investors and customers</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-purple-700 hover:bg-purple-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Crafting...':'Craft Story'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Crafting product story...</p></div>}
      {result&&!loading&&(
        <>
          {result.taglines?.length>0&&<div className="bg-purple-950 border border-purple-800 rounded-xl p-4"><p className="text-purple-400 text-xs font-semibold mb-2">Taglines</p><div className="space-y-1">{result.taglines.map(function(t,i){return<p key={i} className="text-white font-bold italic">"{t}"</p>})}</div></div>}
          <div className="space-y-3">{sections.map(function(sec){return result[sec.key]&&(<div key={sec.key} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><div className="flex items-center gap-2 mb-2"><span className="text-xl">{sec.icon}</span><p className={'text-xs font-semibold '+sec.color}>{sec.label}</p></div><p className="text-white text-sm leading-relaxed">{result[sec.key]}</p></div>)})}</div>
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Rewrite</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">📖</div><p className="text-white font-semibold mb-1">Product Story Builder</p><p className="text-slate-500 text-sm">Craft a compelling origin story, problem, solution and vision narrative</p></div>}
    </div>
  )
}
export default ProductStoryBuilder
