import { useState } from 'react'
import { designBetaProgram, saveBeta, getBeta } from '../services/betaProgramService'
import { notify } from '../services/toast'
function BetaProgramDesigner({ idea, components }) {
  const [result, setResult] = useState(getBeta(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('phases')
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await designBetaProgram(idea, components); setResult(d); saveBeta(idea, d); notify.success('Beta program designed!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  const PHASE_COLORS=['#6366f1','#0ea5e9','#22c55e','#f59e0b']
  const TABS=[{id:'phases',label:'Phases'},{id:'criteria',label:'Criteria'},{id:'incentives',label:'Incentives'}]
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Design a structured beta testing program with phases and tester criteria</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-violet-700 hover:bg-violet-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Designing...':'Design Beta'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Designing beta program...</p></div>}
      {result&&!loading&&(
        <>
          {result.betaSize&&<div className="bg-violet-950 border border-violet-800 rounded-xl p-4 flex items-center gap-4"><span className="text-3xl">🧪</span><div><p className="text-white font-bold">Beta Size: {result.betaSize}</p>{result.feedbackMethods?.length>0&&<p className="text-slate-400 text-xs">Methods: {result.feedbackMethods.join(', ')}</p>}</div></div>}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">{TABS.map(function(t){return<button key={t.id} onClick={function(){setActiveTab(t.id)}} className={'flex-1 py-2 rounded-lg text-xs font-medium transition '+(activeTab===t.id?'bg-violet-700 text-white':'text-slate-500 hover:text-white')}>{t.label}</button>})}</div>
          {activeTab==='phases'&&<div className="space-y-2">{(result.phases||[]).map(function(phase,i){const color=PHASE_COLORS[i%PHASE_COLORS.length];return(<div key={i} className="rounded-xl border p-4" style={{backgroundColor:color+'12',borderColor:color+'35'}}><div className="flex items-center gap-2 mb-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0" style={{backgroundColor:color}}>{i+1}</div><p className="text-white font-bold">{phase.phase}</p><span className="text-slate-500 text-xs ml-auto">{phase.duration}</span></div><p className="text-slate-400 text-xs mb-1">{phase.goal}</p><p className="text-slate-500 text-xs">Participants: {phase.participants}</p></div>)})}</div>}
          {activeTab==='criteria'&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-slate-500 text-xs font-semibold mb-2">Tester Criteria</p><ul className="space-y-1">{(result.testerCriteria||[]).map(function(c,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-violet-400 shrink-0">+</span>{c}</li>})}</ul></div>}
          {activeTab==='incentives'&&<div className="space-y-2">{(result.incentives||[]).map(function(inc,i){return<div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 flex gap-2"><span className="text-yellow-400 shrink-0">★</span><p className="text-slate-300 text-sm">{inc}</p></div>})}{result.successCriteria?.length>0&&<div className="bg-green-950 border border-green-800 rounded-xl p-4"><p className="text-green-400 text-xs font-semibold mb-2">Success Criteria</p><ul className="space-y-1">{result.successCriteria.map(function(s,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-green-400 shrink-0">+</span>{s}</li>})}</ul></div>}</div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Redesign</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">🧪</div><p className="text-white font-semibold mb-1">Beta Program Designer</p><p className="text-slate-500 text-sm">Design structured beta program with phases, criteria and incentives</p></div>}
    </div>
  )
}
export default BetaProgramDesigner
