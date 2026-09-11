import { useState } from 'react'
import { generateInvestorQA, saveInvestorQA, getInvestorQA } from '../services/investorQAService'
import { notify } from '../services/toast'
function InvestorQAPrep({ idea, components }) {
  const [result, setResult] = useState(getInvestorQA(idea))
  const [loading, setLoading] = useState(false)
  const [activeQ, setActiveQ] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await generateInvestorQA(idea, components); setResult(d); saveInvestorQA(idea, d); setActiveQ(0); setShowAnswer(false); notify.success((d.questions||[]).length+' tough questions prepared!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  const qs = result?.questions || []
  const active = qs[activeQ]
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Prepare for tough investor Q&A with model answers and red flags</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-green-700 hover:bg-green-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Preparing...':'Prepare Q&A'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Preparing investor Q&A...</p></div>}
      {result&&!loading&&(
        <>
          <div className="flex gap-1 overflow-x-auto pb-1">{qs.map(function(q,i){return<button key={i} onClick={function(){setActiveQ(i);setShowAnswer(false)}} className={'flex-shrink-0 w-8 h-8 rounded-xl text-xs font-bold transition '+(activeQ===i?'bg-green-700 text-white':'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')}>{i+1}</button>})}</div>
          {active&&(
            <div className="space-y-3">
              <div className="bg-[#0d0d1a] border border-green-800 rounded-xl p-4"><p className="text-white font-bold text-base">{active.question}</p></div>
              {!showAnswer?<button onClick={function(){setShowAnswer(true)}} className="w-full py-3 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-sm transition">Reveal Best Answer</button>:(
                <div className="space-y-2">
                  <div className="bg-green-950 border border-green-800 rounded-xl p-4"><p className="text-green-400 text-xs font-semibold mb-1">Best Answer</p><p className="text-white text-sm">{active.bestAnswer}</p></div>
                  {active.redFlags&&<div className="bg-red-950 border border-red-900 rounded-xl p-3"><p className="text-red-400 text-xs font-semibold">Red Flags to Avoid</p><p className="text-slate-300 text-xs">{active.redFlags}</p></div>}
                  {active.followUp&&<div className="bg-yellow-950 border border-yellow-800 rounded-xl p-3"><p className="text-yellow-400 text-xs font-semibold">Likely Follow-up</p><p className="text-slate-300 text-xs">{active.followUp}</p></div>}
                </div>
              )}
              <div className="flex gap-2"><button onClick={function(){setActiveQ(Math.max(0,activeQ-1));setShowAnswer(false)}} disabled={activeQ===0} className="flex-1 py-1.5 bg-[#1e1e2e] text-slate-400 rounded-lg text-xs disabled:opacity-30">Prev</button><button onClick={function(){setActiveQ(Math.min(qs.length-1,activeQ+1));setShowAnswer(false)}} disabled={activeQ===qs.length-1} className="flex-1 py-1.5 bg-green-700 text-white rounded-lg text-xs disabled:opacity-30">Next</button></div>
            </div>
          )}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">💰</div><p className="text-white font-semibold mb-1">Investor Q&A Prep</p><p className="text-slate-500 text-sm">Prepare for tough investor questions with model answers and red flags</p></div>}
    </div>
  )
}
export default InvestorQAPrep
