import { useState } from 'react'
import { designPackaging, savePackaging, getPackaging } from '../services/packagingDesignService'
import { notify } from '../services/toast'
function PackagingDesigner({ idea, components }) {
  const [result, setResult] = useState(getPackaging(idea))
  const [loading, setLoading] = useState(false)
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await designPackaging(idea, components); setResult(d); savePackaging(idea, d); notify.success('Packaging design ready!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Design product packaging with unboxing experience and materials spec</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-amber-700 hover:bg-amber-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Designing...':'Design Packaging'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Designing packaging...</p></div>}
      {result&&!loading&&(
        <>
          <div className="bg-amber-950 border border-amber-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3"><span className="text-4xl">📦</span><div><p className="text-white font-black text-xl">{result.boxType}</p>{result.dimensions&&<p className="text-amber-400 text-xs">{result.dimensions}</p>}</div></div>
            {result.materials?.length>0&&<div className="flex flex-wrap gap-1">{result.materials.map(function(m,i){return<span key={i} className="text-xs bg-amber-900 text-amber-300 border border-amber-700 px-2 py-0.5 rounded-full">{m}</span>})}</div>}
          </div>
          {result.inTheBox?.length>0&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-slate-500 text-xs font-semibold mb-2">In the Box</p><ul className="space-y-1">{result.inTheBox.map(function(item,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-amber-400">+</span>{item}</li>})}</ul></div>}
          {result.unboxingExperience?.length>0&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-slate-500 text-xs font-semibold mb-2">Unboxing Experience</p><ol className="space-y-1">{result.unboxingExperience.map(function(step,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-amber-400 shrink-0">{i+1}.</span>{step}</li>})}</ol></div>}
          {result.sustainabilityNotes&&<div className="bg-green-950 border border-green-800 rounded-xl p-3"><p className="text-green-400 text-xs font-semibold">Sustainability</p><p className="text-slate-300 text-xs">{result.sustainabilityNotes}</p></div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Redesign</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">📦</div><p className="text-white font-semibold mb-1">Packaging Designer</p><p className="text-slate-500 text-sm">Design product packaging with materials, unboxing experience and sustainability</p></div>}
    </div>
  )
}
export default PackagingDesigner
