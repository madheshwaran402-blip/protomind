import { useState } from 'react'
import { generateVersionHistory, saveVersionHistory, getVersionHistory } from '../services/hardwareVersionService'
import { notify } from '../services/toast'
function HardwareVersionHistory({ idea, components }) {
  const [result, setResult] = useState(getVersionHistory(idea))
  const [loading, setLoading] = useState(false)
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await generateVersionHistory(idea, components); setResult(d); saveVersionHistory(idea, d); notify.success((d.versions||[]).length+' versions documented!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  const versions = result?.versions || []
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Document hardware version history with changes and breaking updates</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Generating...':'Generate History'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Generating version history...</p></div>}
      {result&&!loading&&(
        <>
          <div className="space-y-3">{versions.map(function(v,i){return(<div key={i} className={'rounded-xl border p-4 '+(v.breaking?'bg-red-950 border-red-800':'bg-[#13131f] border-[#2e2e4e]')}><div className="flex items-center gap-3 mb-2"><span className={'text-xs font-black px-2 py-0.5 rounded '+(i===0?'bg-indigo-600 text-white':'bg-[#0d0d1a] text-slate-400')}>v{v.version}</span>{v.date&&<span className="text-slate-500 text-xs">{v.date}</span>}{v.breaking&&<span className="text-red-400 text-xs ml-auto font-bold">BREAKING</span>}</div>{v.notes&&<p className="text-slate-400 text-xs mb-2">{v.notes}</p>}<ul className="space-y-0.5">{(v.changes||[]).map(function(c,j){return<li key={j} className="text-slate-300 text-xs flex gap-2"><span className="text-indigo-400 shrink-0">+</span>{c}</li>})}</ul></div>)})}</div>
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">📜</div><p className="text-white font-semibold mb-1">Hardware Version History</p><p className="text-slate-500 text-sm">Document version history with changes and breaking updates</p></div>}
    </div>
  )
}
export default HardwareVersionHistory
