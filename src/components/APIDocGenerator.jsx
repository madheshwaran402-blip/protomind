import { useState } from 'react'
import { generateAPIDoc, saveAPIDoc, getAPIDoc } from '../services/apiDocService'
import { notify } from '../services/toast'
const METHOD_COLORS = {GET:'text-green-400 bg-green-950',POST:'text-blue-400 bg-blue-950',PUT:'text-yellow-400 bg-yellow-950',DELETE:'text-red-400 bg-red-950',PATCH:'text-orange-400 bg-orange-950'}
function APIDocGenerator({ idea, components }) {
  const [result, setResult] = useState(getAPIDoc(idea))
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(null)
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await generateAPIDoc(idea, components); setResult(d); saveAPIDoc(idea, d); notify.success((d.endpoints||[]).length + ' endpoints documented!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate complete API documentation with endpoints, params and examples</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-green-700 hover:bg-green-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Generating...':'Generate API Docs'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Generating API docs...</p></div>}
      {result&&!loading&&(
        <>
          {result.baseUrl&&<div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-3"><p className="text-slate-500 text-xs">Base URL</p><p className="text-green-400 font-mono text-sm">{result.baseUrl}</p>{result.authentication&&<p className="text-slate-400 text-xs mt-1">Auth: {result.authentication}</p>}</div>}
          <div className="space-y-2">{(result.endpoints||[]).map(function(ep,i){const mc=METHOD_COLORS[ep.method]||METHOD_COLORS.GET;const isExp=expanded===i;return(<div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden"><button onClick={function(){setExpanded(isExp?null:i)}} className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#1e1e2e] transition"><span className={'text-xs font-black px-2 py-0.5 rounded '+mc}>{ep.method}</span><p className="text-white font-mono text-sm flex-1">{ep.path}</p><p className="text-slate-500 text-xs">{ep.description}</p><span className="text-slate-600 shrink-0">{isExp?'-':'+'}</span></button>{isExp&&<div className="px-4 pb-4 bg-[#0d0d1a] border-t border-[#1e1e2e] pt-3 space-y-2">{ep.params?.length>0&&<div><p className="text-slate-500 text-xs font-semibold mb-1">Parameters</p>{ep.params.map(function(p,j){return<p key={j} className="text-slate-300 text-xs font-mono">• {p}</p>})}</div>}{ep.response&&<div><p className="text-slate-500 text-xs font-semibold mb-1">Response</p><p className="text-slate-300 text-xs">{ep.response}</p></div>}{ep.example&&<div><p className="text-slate-500 text-xs font-semibold mb-1">Example</p><pre className="bg-[#13131f] rounded-lg p-2 text-green-400 text-xs overflow-x-auto">{ep.example}</pre></div>}</div>}</div>)})}</div>
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">📋</div><p className="text-white font-semibold mb-1">API Doc Generator</p><p className="text-slate-500 text-sm">Generate complete API documentation with endpoints and examples</p></div>}
    </div>
  )
}
export default APIDocGenerator
