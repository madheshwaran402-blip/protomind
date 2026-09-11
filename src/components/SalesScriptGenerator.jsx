import { useState } from 'react'
import { generateSalesScript, saveSalesScript, getSalesScript } from '../services/salesScriptService'
import { notify } from '../services/toast'
function SalesScriptGenerator({ idea, components }) {
  const [result, setResult] = useState(getSalesScript(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('script')
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await generateSalesScript(idea, components); setResult(d); saveSalesScript(idea, d); notify.success('Sales script ready!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  const TABS=[{id:'script',label:'Script'},{id:'objections',label:'Objections'}]
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate a complete sales script with objection handling</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-green-700 hover:bg-green-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Writing...':'Generate Script'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Writing sales script...</p></div>}
      {result&&!loading&&(
        <>
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">{TABS.map(function(t){return<button key={t.id} onClick={function(){setActiveTab(t.id)}} className={'flex-1 py-2 rounded-lg text-xs font-medium transition '+(activeTab===t.id?'bg-green-700 text-white':'text-slate-500 hover:text-white')}>{t.label}</button>})}</div>
          {activeTab==='script'&&<div className="space-y-3">
            {[{key:'opener',label:'Opener',color:'text-blue-400'},{key:'pitch',label:'Pitch',color:'text-green-400'},{key:'close',label:'Close',color:'text-yellow-400'},{key:'followUp',label:'Follow Up',color:'text-purple-400'}].map(function(sec){return result[sec.key]&&(<div key={sec.key} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className={'text-xs font-semibold mb-1 '+sec.color}>{sec.label}</p><p className="text-white text-sm leading-relaxed italic">"{result[sec.key]}"</p></div>)})}
            {result.discovery?.length>0&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-slate-500 text-xs font-semibold mb-2">Discovery Questions</p><ul className="space-y-1">{result.discovery.map(function(q,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-green-400 shrink-0">?</span>{q}</li>})}</ul></div>}
          </div>}
          {activeTab==='objections'&&<div className="space-y-2">{(result.objections||[]).map(function(obj,i){return(<div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-red-400 text-xs font-semibold mb-1">Objection</p><p className="text-white text-sm mb-2">{obj.objection}</p><p className="text-green-400 text-xs font-semibold mb-1">Response</p><p className="text-slate-300 text-sm">{obj.response}</p></div>)})}</div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">🗣️</div><p className="text-white font-semibold mb-1">Sales Script Generator</p><p className="text-slate-500 text-sm">Generate complete sales script with objection handling</p></div>}
    </div>
  )
}
export default SalesScriptGenerator
