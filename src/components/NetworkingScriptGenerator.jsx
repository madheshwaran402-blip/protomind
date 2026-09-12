import { useState } from 'react'
import { generateNetworkingScript, saveNetworking, getNetworking } from '../services/networkingScriptService'
import { notify } from '../services/toast'
const CTX_ICONS={'Conference':'🎤','Coffee Chat':'☕','Demo Day':'🚀','LinkedIn':'💼','Email Introduction':'📧','Investor Meeting':'💰'}
function NetworkingScriptGenerator({ idea, components }) {
  const [result, setResult] = useState(getNetworking(idea))
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)
  const [copied, setCopied] = useState(false)
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await generateNetworkingScript(idea, components); setResult(d); saveNetworking(idea, d); notify.success('Networking scripts ready!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  const contexts = result?.contexts || []
  const active = contexts[selected]
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate networking scripts for conferences, demo days and investor meetings</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Generating...':'Generate Scripts'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Generating networking scripts...</p></div>}
      {result&&!loading&&(
        <>
          {result.elevatorPitch&&<div className="bg-teal-950 border border-teal-800 rounded-xl p-4"><p className="text-teal-400 text-xs font-semibold mb-1">30-Second Elevator Pitch</p><p className="text-white text-sm italic leading-relaxed">"{result.elevatorPitch}"</p><button onClick={function(){navigator.clipboard.writeText(result.elevatorPitch);setCopied(true);setTimeout(function(){setCopied(false)},2000);notify.success('Copied!')}} className="text-xs text-slate-500 hover:text-white mt-2">{copied?'ok':'copy'}</button></div>}
          <div className="flex gap-1 overflow-x-auto pb-1">{contexts.map(function(ctx,i){const icon=CTX_ICONS[ctx.context]||'💬';return<button key={i} onClick={function(){setSelected(i)}} className={'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition '+(selected===i?'bg-teal-700 text-white':'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')}>{icon} {ctx.context}</button>})}</div>
          {active&&<div className="space-y-3">
            {[{key:'opener',label:'Opener',color:'text-blue-400'},{key:'pitch',label:'Pitch',color:'text-green-400'},{key:'ask',label:'The Ask',color:'text-yellow-400'},{key:'followUp',label:'Follow Up',color:'text-purple-400'}].map(function(sec){return active[sec.key]&&<div key={sec.key} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className={'text-xs font-semibold mb-1 '+sec.color}>{sec.label}</p><p className="text-white text-sm leading-relaxed italic">"{active[sec.key]}"</p></div>})}
            <div className="flex gap-2"><button onClick={function(){setSelected(Math.max(0,selected-1))}} disabled={selected===0} className="flex-1 py-1.5 bg-[#1e1e2e] text-slate-400 rounded-lg text-xs disabled:opacity-30">Prev</button><button onClick={function(){setSelected(Math.min(contexts.length-1,selected+1))}} disabled={selected===contexts.length-1} className="flex-1 py-1.5 bg-teal-700 text-white rounded-lg text-xs disabled:opacity-30">Next</button></div>
          </div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">🤝</div><p className="text-white font-semibold mb-1">Networking Script Generator</p><p className="text-slate-500 text-sm">Generate scripts for conferences, demo days and investor meetings</p></div>}
    </div>
  )
}
export default NetworkingScriptGenerator
