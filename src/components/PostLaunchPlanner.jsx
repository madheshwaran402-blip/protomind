import { useState } from 'react'
import { generatePostLaunchPlan, savePostLaunch, getPostLaunch } from '../services/postLaunchService'
import { notify } from '../services/toast'
function PostLaunchPlanner({ idea, components }) {
  const [result, setResult] = useState(getPostLaunch(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('week1')
  const [checked, setChecked] = useState({})
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await generatePostLaunchPlan(idea, components); setResult(d); savePostLaunch(idea, d); setChecked({}); notify.success('Post-launch plan ready!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  function toggle(key) { setChecked(function(p){return Object.assign({},p,{[key]:!p[key]})}) }
  const TABS=[{id:'week1',label:'Week 1'},{id:'month1',label:'Month 1'},{id:'month3',label:'Month 3'},{id:'kpis',label:'KPIs'},{id:'issues',label:'Common Issues'}]
  const currentItems = activeTab==='week1'?result?.week1:activeTab==='month1'?result?.month1:activeTab==='month3'?result?.month3:null
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Plan the critical post-launch period with week-by-week action items</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Planning...':'Plan Post-Launch'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Planning post-launch...</p></div>}
      {result&&!loading&&(
        <>
          <div className="flex gap-1 overflow-x-auto pb-1 bg-[#13131f] rounded-xl p-1">{TABS.map(function(t){return<button key={t.id} onClick={function(){setActiveTab(t.id)}} className={'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition '+(activeTab===t.id?'bg-emerald-700 text-white':'text-slate-500 hover:text-white')}>{t.label}</button>})}</div>
          {currentItems&&<div className="space-y-1">{currentItems.map(function(item,i){const key=activeTab+'_'+i;const done=!!checked[key];return(<div key={i} onClick={function(){toggle(key)}} className={'flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition '+(done?'opacity-50 bg-[#0d0d1a] border-[#1e1e2e]':'bg-[#13131f] border-[#2e2e4e] hover:border-emerald-700')}><div className={'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 '+(done?'bg-green-600 border-green-500':'border-[#2e2e4e]')}>{done&&<span className="text-white text-xs">v</span>}</div><p className={'text-sm '+(done?'line-through text-slate-500':'text-white')}>{item}</p></div>)})}</div>}
          {activeTab==='kpis'&&<div className="space-y-2">{(result.kpis||[]).map(function(kpi,i){return(<div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3"><div className="flex items-center gap-2"><p className="text-white font-medium text-sm flex-1">{kpi.metric}</p><span className="text-emerald-400 text-xs">{kpi.target}</span><span className="text-slate-500 text-xs">{kpi.frequency}</span></div></div>)})}</div>}
          {activeTab==='issues'&&<div className="space-y-2">{(result.commonIssues||[]).map(function(issue,i){return(<div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-white font-bold text-sm mb-1">{issue.issue}</p><p className="text-green-400 text-xs">{issue.response}</p></div>)})}</div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Rebuild</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">📈</div><p className="text-white font-semibold mb-1">Post-Launch Planner</p><p className="text-slate-500 text-sm">Plan Week 1, Month 1, Month 3 actions with KPIs and issue handling</p></div>}
    </div>
  )
}
export default PostLaunchPlanner
