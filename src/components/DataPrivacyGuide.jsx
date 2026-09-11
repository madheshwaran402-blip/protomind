import { useState } from 'react'
import { generatePrivacyGuide, savePrivacy, getPrivacy } from '../services/dataPrivacyService'
import { notify } from '../services/toast'
function DataPrivacyGuide({ idea, components }) {
  const [result, setResult] = useState(getPrivacy(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('data')
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await generatePrivacyGuide(idea, components); setResult(d); savePrivacy(idea, d); notify.success('Privacy guide ready!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  const TABS=[{id:'data',label:'Data Collected'},{id:'gdpr',label:'GDPR'},{id:'design',label:'Privacy by Design'}]
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate data privacy guide with GDPR checklist and privacy by design</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Generating...':'Generate Guide'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Generating privacy guide...</p></div>}
      {result&&!loading&&(
        <>
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">{TABS.map(function(t){return<button key={t.id} onClick={function(){setActiveTab(t.id)}} className={'flex-1 py-2 rounded-lg text-xs font-medium transition '+(activeTab===t.id?'bg-slate-700 text-white':'text-slate-500 hover:text-white')}>{t.label}</button>})}</div>
          {activeTab==='data'&&<div className="space-y-2">{(result.dataCollected||[]).map(function(d,i){return(<div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-white font-bold text-sm mb-1">{d.dataType}</p><div className="grid grid-cols-3 gap-2 text-xs"><div><p className="text-slate-500">Purpose</p><p className="text-slate-300">{d.purpose}</p></div><div><p className="text-slate-500">Retention</p><p className="text-slate-300">{d.retention}</p></div><div><p className="text-slate-500">Storage</p><p className="text-slate-300">{d.storage}</p></div></div></div>)})}</div>}
          {activeTab==='gdpr'&&<div className="space-y-1">{(result.gdprChecklist||[]).map(function(item,i){return<div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 flex gap-2"><span className="text-green-400 shrink-0">+</span><p className="text-slate-300 text-xs">{item}</p></div>})}</div>}
          {activeTab==='design'&&<div className="space-y-1">{(result.privacyByDesign||[]).map(function(item,i){return<div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 flex gap-2"><span className="text-blue-400 shrink-0">{i+1}.</span><p className="text-slate-300 text-xs">{item}</p></div>})}</div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">🔐</div><p className="text-white font-semibold mb-1">Data Privacy Guide</p><p className="text-slate-500 text-sm">Generate GDPR checklist, data inventory and privacy by design principles</p></div>}
    </div>
  )
}
export default DataPrivacyGuide
