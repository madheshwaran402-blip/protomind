import { useState } from 'react'
import { generateInvestorUpdate, saveInvestorUpdate, getInvestorUpdate } from '../services/investorUpdateService'
import { notify } from '../services/toast'
function InvestorUpdateGenerator({ idea, components }) {
  const [result, setResult] = useState(getInvestorUpdate(idea))
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await generateInvestorUpdate(idea, components); setResult(d); saveInvestorUpdate(idea, d); notify.success('Investor update ready!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  const TREND_ICONS = { up: 'up', down: 'down', flat: 'flat' }
  const TREND_COLORS = { up: 'text-green-400', down: 'text-red-400', flat: 'text-slate-400' }
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate a monthly investor update email with metrics and highlights</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Generating...':'Generate Update'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Generating investor update...</p></div>}
      {result&&!loading&&(
        <>
          {result.subject&&<div className="bg-[#0d0d1a] border border-indigo-800 rounded-xl p-4"><p className="text-slate-500 text-xs mb-1">Subject</p><p className="text-white font-bold">{result.subject}</p></div>}
          {result.highlights?.length>0&&<div className="bg-green-950 border border-green-800 rounded-xl p-4"><p className="text-green-400 text-xs font-semibold mb-2">Highlights</p><ul className="space-y-1">{result.highlights.map(function(h,i){return<li key={i} className="text-slate-300 text-sm flex gap-2"><span className="text-green-400 shrink-0">+</span>{h}</li>})}</ul></div>}
          {result.metrics?.length>0&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-slate-500 text-xs font-semibold mb-2">Key Metrics</p><div className="space-y-1">{result.metrics.map(function(m,i){const tc=TREND_COLORS[m.trend]||'text-slate-400';return<div key={i} className="flex items-center gap-3"><p className="text-slate-400 text-xs flex-1">{m.metric}</p><p className="text-white text-xs font-bold">{m.value}</p><span className={'text-xs '+tc}>{m.trend}</span></div>})}</div></div>}
          {result.challenges?.length>0&&<div className="bg-yellow-950 border border-yellow-800 rounded-xl p-4"><p className="text-yellow-400 text-xs font-semibold mb-2">Challenges</p><ul className="space-y-1">{result.challenges.map(function(c,i){return<li key={i} className="text-slate-300 text-sm flex gap-2"><span className="text-yellow-400 shrink-0">!</span>{c}</li>})}</ul></div>}
          {result.nextMonth?.length>0&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-slate-500 text-xs font-semibold mb-2">Next Month</p><ul className="space-y-1">{result.nextMonth.map(function(n,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-indigo-400 shrink-0">{i+1}.</span>{n}</li>})}</ul></div>}
          {result.ask&&<div className="bg-indigo-950 border border-indigo-800 rounded-xl p-4"><p className="text-indigo-400 text-xs font-semibold mb-1">The Ask</p><p className="text-white text-sm">{result.ask}</p></div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">📧</div><p className="text-white font-semibold mb-1">Investor Update Generator</p><p className="text-slate-500 text-sm">Generate monthly investor updates with metrics and highlights</p></div>}
    </div>
  )
}
export default InvestorUpdateGenerator
