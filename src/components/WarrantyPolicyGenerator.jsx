import { useState } from 'react'
import { generateWarrantyPolicy, saveWarranty, getWarranty } from '../services/warrantyPolicyService'
import { notify } from '../services/toast'
function WarrantyPolicyGenerator({ idea, components }) {
  const [result, setResult] = useState(getWarranty(idea))
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await generateWarrantyPolicy(idea, components); setResult(d); saveWarranty(idea, d); notify.success('Warranty policy ready!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  function copyAll() {
    if (!result) return
    const parts = ['WARRANTY POLICY','','Period: '+(result.warrantyPeriod||''),'','COVERED:',... (result.covered||[]).map(function(c){return '+ '+c}),'','NOT COVERED:',... (result.notCovered||[]).map(function(c){return '- '+c}),'','CLAIM PROCESS:',... (result.claimProcess||[]).map(function(c,i){return (i+1)+'. '+c}),'','RETURNS: '+(result.returnPolicy||''),'','REFUNDS: '+(result.refundPolicy||'')]
    navigator.clipboard.writeText(parts.join('
'))
    setCopied(true); setTimeout(function(){setCopied(false)},2000); notify.success('Policy copied!')
  }
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate complete warranty, returns and refund policy for your product</p>
        <div className="flex gap-2 shrink-0">
          {result&&<button onClick={copyAll} className="px-3 py-2.5 bg-[#1e1e2e] text-slate-300 rounded-xl text-xs transition">{copied?'ok':'Copy'}</button>}
          <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-blue-700 hover:bg-blue-600 rounded-xl text-sm font-semibold transition disabled:opacity-50">{loading?'Generating...':'Generate Policy'}</button>
        </div>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Generating warranty policy...</p></div>}
      {result&&!loading&&(
        <>
          {result.warrantyPeriod&&<div className="bg-blue-950 border border-blue-800 rounded-2xl p-5 text-center"><p className="text-blue-400 text-xs font-semibold mb-1">WARRANTY PERIOD</p><p className="text-white font-black text-3xl">{result.warrantyPeriod}</p></div>}
          <div className="grid grid-cols-1 gap-3">
            {result.covered?.length>0&&<div className="bg-green-950 border border-green-800 rounded-xl p-4"><p className="text-green-400 text-xs font-semibold mb-2">Covered</p><ul className="space-y-1">{result.covered.map(function(c,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-green-400 shrink-0">+</span>{c}</li>})}</ul></div>}
            {result.notCovered?.length>0&&<div className="bg-red-950 border border-red-900 rounded-xl p-4"><p className="text-red-400 text-xs font-semibold mb-2">Not Covered</p><ul className="space-y-1">{result.notCovered.map(function(c,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-red-400 shrink-0">-</span>{c}</li>})}</ul></div>}
            {result.claimProcess?.length>0&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-slate-500 text-xs font-semibold mb-2">Claim Process</p><ol className="space-y-1">{result.claimProcess.map(function(s,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-blue-400 shrink-0">{i+1}.</span>{s}</li>})}</ol></div>}
            <div className="grid grid-cols-2 gap-2">
              {result.returnPolicy&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3"><p className="text-slate-500 text-xs font-semibold mb-1">Returns</p><p className="text-slate-300 text-xs">{result.returnPolicy}</p></div>}
              {result.refundPolicy&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3"><p className="text-slate-500 text-xs font-semibold mb-1">Refunds</p><p className="text-slate-300 text-xs">{result.refundPolicy}</p></div>}
            </div>
          </div>
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">📄</div><p className="text-white font-semibold mb-1">Warranty Policy Generator</p><p className="text-slate-500 text-sm">Generate complete warranty, returns and refund policy</p></div>}
    </div>
  )
}
export default WarrantyPolicyGenerator
