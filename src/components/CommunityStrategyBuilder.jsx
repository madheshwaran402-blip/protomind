import { useState } from 'react'
import { buildCommunityStrategy, saveCommunity, getCommunity } from '../services/communityStrategyService'
import { notify } from '../services/toast'
const PLAT_COLORS={'Discord':'#5865F2','Reddit':'#FF4500','Twitter':'#1DA1F2','LinkedIn':'#0077B5','YouTube':'#FF0000','GitHub':'#333'}
function CommunityStrategyBuilder({ idea, components }) {
  const [result, setResult] = useState(getCommunity(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('channels')
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await buildCommunityStrategy(idea, components); setResult(d); saveCommunity(idea, d); notify.success('Community strategy ready!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  const TABS=[{id:'channels',label:'Channels'},{id:'content',label:'Content'},{id:'growth',label:'Growth'}]
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Build a community strategy across platforms with content pillars and growth tactics</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-purple-700 hover:bg-purple-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Building...':'Build Strategy'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Building community strategy...</p></div>}
      {result&&!loading&&(
        <>
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">{TABS.map(function(t){return<button key={t.id} onClick={function(){setActiveTab(t.id)}} className={'flex-1 py-2 rounded-lg text-xs font-medium transition '+(activeTab===t.id?'bg-purple-700 text-white':'text-slate-500 hover:text-white')}>{t.label}</button>})}</div>
          {activeTab==='channels'&&<div className="space-y-3">{(result.channels||[]).map(function(ch,i){const color=PLAT_COLORS[ch.platform]||'#6366f1';return(<div key={i} className="rounded-xl border p-4" style={{backgroundColor:color+'12',borderColor:color+'30'}}><div className="flex items-center gap-2 mb-2"><p className="text-white font-bold text-sm">{ch.platform}</p>{ch.frequency&&<span className="text-xs text-slate-500 ml-auto">{ch.frequency}</span>}</div><p className="text-slate-400 text-xs mb-2">{ch.purpose}</p>{ch.contentTypes?.length>0&&<div className="flex flex-wrap gap-1">{ch.contentTypes.map(function(ct,j){return<span key={j} className="text-xs px-2 py-0.5 rounded-full" style={{backgroundColor:color+'20',color}}>{ct}</span>})}</div>}</div>)})}</div>}
          {activeTab==='content'&&<div className="space-y-2">{(result.contentPillars||[]).map(function(p,i){return<div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 flex gap-2"><span className="text-purple-400 shrink-0">{i+1}.</span><p className="text-slate-300 text-sm">{p}</p></div>})}</div>}
          {activeTab==='growth'&&<div className="space-y-2">{(result.growthTactics||[]).map(function(t,i){return<div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 flex gap-2"><span className="text-green-400 shrink-0">+</span><p className="text-slate-300 text-sm">{t}</p></div>})}</div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Rebuild</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">👥</div><p className="text-white font-semibold mb-1">Community Strategy Builder</p><p className="text-slate-500 text-sm">Build community strategy across platforms with growth tactics</p></div>}
    </div>
  )
}
export default CommunityStrategyBuilder
