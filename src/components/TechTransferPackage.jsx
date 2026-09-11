import { useState } from 'react'
import { generateTechTransfer, saveTechTransfer, getTechTransfer } from '../services/techTransferService'
import { notify } from '../services/toast'
function TechTransferPackage({ idea, components }) {
  const [result, setResult] = useState(getTechTransfer(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('docs')
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await generateTechTransfer(idea, components); setResult(d); saveTechTransfer(idea, d); notify.success('Tech transfer package ready!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  const TABS=[{id:'docs',label:'Documents'},{id:'ip',label:'IP Assets'},{id:'mfg',label:'Manufacturing'}]
  const TYPE_COLORS={'Patent':'#6366f1','Trade Secret':'#f59e0b','Copyright':'#22c55e','Trademark':'#0ea5e9'}
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate a complete technology transfer package for manufacturing or licensing</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Generating...':'Generate Package'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Generating tech transfer package...</p></div>}
      {result&&!loading&&(
        <>
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">{TABS.map(function(t){return<button key={t.id} onClick={function(){setActiveTab(t.id)}} className={'flex-1 py-2 rounded-lg text-xs font-medium transition '+(activeTab===t.id?'bg-indigo-700 text-white':'text-slate-500 hover:text-white')}>{t.label}</button>})}</div>
          {activeTab==='docs'&&<div className="space-y-2">{(result.documents||[]).map(function(doc,i){return(<div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-white font-bold text-sm mb-1">{doc.title}</p><p className="text-slate-400 text-xs mb-2">{doc.purpose}</p>{doc.contents?.length>0&&<ul className="space-y-0.5">{doc.contents.map(function(c,j){return<li key={j} className="text-slate-500 text-xs flex gap-1"><span className="text-indigo-400">-</span>{c}</li>})}</ul>}</div>)})}</div>}
          {activeTab==='ip'&&<div className="space-y-2">{(result.ipAssets||[]).map(function(ip,i){const color=TYPE_COLORS[ip.type]||'#6366f1';return(<div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><div className="flex items-center gap-2 mb-1"><p className="text-white font-bold text-sm">{ip.asset}</p><span className="text-xs px-1.5 py-0.5 rounded ml-auto" style={{backgroundColor:color+'20',color}}>{ip.type}</span></div><p className="text-slate-400 text-xs">{ip.protection}</p></div>)})}</div>}
          {activeTab==='mfg'&&<div className="space-y-3"><div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-slate-500 text-xs font-semibold mb-2">Manufacturing Notes</p><ul className="space-y-1">{(result.manufacturingNotes||[]).map(function(n,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-indigo-400 shrink-0">{i+1}.</span>{n}</li>})}</ul></div><div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-slate-500 text-xs font-semibold mb-2">Quality Standards</p><ul className="space-y-1">{(result.qualityStandards||[]).map(function(s,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-green-400 shrink-0">+</span>{s}</li>})}</ul></div></div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">📋</div><p className="text-white font-semibold mb-1">Tech Transfer Package</p><p className="text-slate-500 text-sm">Generate complete tech transfer package for manufacturing or licensing</p></div>}
    </div>
  )
}
export default TechTransferPackage
