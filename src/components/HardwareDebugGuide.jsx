import { useState } from 'react'
import { generateDebugGuide, saveDebugGuide, getDebugGuide } from '../services/hardwareDebugService'
import { notify } from '../services/toast'
function HardwareDebugGuide({ idea, components }) {
  const [result, setResult] = useState(getDebugGuide(idea))
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [search, setSearch] = useState('')
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await generateDebugGuide(idea, components); setResult(d); saveDebugGuide(idea, d); notify.success((d.symptoms||[]).length+' debug scenarios documented!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  const symptoms = (result?.symptoms||[]).filter(function(s){return !search||s.symptom.toLowerCase().includes(search.toLowerCase())})
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Hardware debugging guide with symptoms, causes and step-by-step fixes</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-orange-700 hover:bg-orange-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Generating...':'Generate Debug Guide'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Generating debug guide...</p></div>}
      {result&&!loading&&(
        <>
          <input value={search} onChange={function(e){setSearch(e.target.value)}} placeholder="Search symptoms..." className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-orange-500"/>
          <div className="space-y-2">{symptoms.map(function(s,i){const isExp=expanded===i;return(<div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden"><button onClick={function(){setExpanded(isExp?null:i)}} className="w-full flex items-start gap-3 p-4 text-left hover:bg-[#1e1e2e] transition"><div className="flex-1"><p className="text-white font-bold text-sm">{s.symptom}</p>{s.likelyCause&&<p className="text-orange-400 text-xs mt-0.5">Cause: {s.likelyCause}</p>}{s.tools&&<p className="text-slate-500 text-xs">Tools: {s.tools}</p>}</div><span className="text-slate-600 shrink-0">{isExp?'-':'+'}</span></button>{isExp&&<div className="px-4 pb-4 bg-[#0d0d1a] border-t border-[#1e1e2e] pt-3 space-y-2"><div><p className="text-orange-400 text-xs font-semibold mb-1">Debug Steps</p><ol className="space-y-1">{(s.debugSteps||[]).map(function(step,j){return<li key={j} className="text-slate-300 text-xs flex gap-2"><span className="text-orange-400 shrink-0">{j+1}.</span>{step}</li>})}</ol></div>{s.fix&&<div className="bg-green-950 border border-green-900 rounded-lg p-2"><p className="text-green-400 text-xs font-semibold">Fix</p><p className="text-slate-300 text-xs">{s.fix}</p></div>}</div>}</div>)})}</div>
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">🔍</div><p className="text-white font-semibold mb-1">Hardware Debug Guide</p><p className="text-slate-500 text-sm">Symptom-based debugging guide with step-by-step fixes</p></div>}
    </div>
  )
}
export default HardwareDebugGuide
