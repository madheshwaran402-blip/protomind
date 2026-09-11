import { useState } from 'react'
import { generateErrorHandling, saveErrorHandling, getErrorHandling } from '../services/errorHandlingService'
import { notify } from '../services/toast'
const SEV={Critical:'text-red-400',High:'text-orange-400',Medium:'text-yellow-400',Low:'text-blue-400'}
function ErrorHandlingGuide({ idea, components }) {
  const [result, setResult] = useState(getErrorHandling(idea))
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(null)
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await generateErrorHandling(idea, components); setResult(d); saveErrorHandling(idea, d); notify.success((d.errors||[]).length + ' error patterns documented!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate comprehensive error handling guide with recovery procedures</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-red-700 hover:bg-red-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Generating...':'Generate Guide'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Generating error handling guide...</p></div>}
      {result&&!loading&&(
        <>
          <div className="space-y-2">{(result.errors||[]).map(function(err,i){const sc=SEV[err.severity]||SEV.Medium;const isExp=expanded===i;return(<div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden"><button onClick={function(){setExpanded(isExp?null:i)}} className="w-full flex items-start gap-3 p-4 text-left hover:bg-[#1e1e2e] transition"><div className="flex-1"><div className="flex items-center gap-2 mb-0.5"><p className="text-white font-bold text-sm">{err.name}</p>{err.code&&<span className="text-slate-500 text-xs font-mono">[{err.code}]</span>}<span className={'ml-auto text-xs '+sc}>{err.severity}</span></div><p className="text-slate-400 text-xs">{err.cause}</p></div><span className="text-slate-600 shrink-0">{isExp?'-':'+'}</span></button>{isExp&&<div className="px-4 pb-4 bg-[#0d0d1a] border-t border-[#1e1e2e] pt-3 space-y-2"><div><p className="text-blue-400 text-xs font-semibold mb-1">Detection</p><p className="text-slate-300 text-xs">{err.detection}</p></div><div><p className="text-green-400 text-xs font-semibold mb-1">Recovery</p><p className="text-slate-300 text-xs">{err.recovery}</p></div></div>}</div>)})}</div>
          {result.bestPractices?.length>0&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-slate-500 text-xs font-semibold mb-2">Best Practices</p><ul className="space-y-1">{result.bestPractices.map(function(p,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-green-400 shrink-0">+</span>{p}</li>})}</ul></div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">🚨</div><p className="text-white font-semibold mb-1">Error Handling Guide</p><p className="text-slate-500 text-sm">Generate error codes, detection methods and recovery procedures</p></div>}
    </div>
  )
}
export default ErrorHandlingGuide
