import { useState } from 'react'
import { auditAccessibility, saveAudit, getAudit } from '../services/accessibilityAuditService'
import { notify } from '../services/toast'
const SEV = { Critical:'text-red-400 bg-red-950 border-red-800', High:'text-orange-400 bg-orange-950 border-orange-800', Medium:'text-yellow-400 bg-yellow-950 border-yellow-800', Low:'text-blue-400 bg-blue-950 border-blue-800' }
function AccessibilityAuditor({ idea, components }) {
  const [result, setResult] = useState(getAudit(idea))
  const [loading, setLoading] = useState(false)
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await auditAccessibility(idea, components); setResult(d); saveAudit(idea, d); notify.success('Audit complete! Score: ' + d.score + '/100') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  const sc = result?.score || 0
  const scColor = sc >= 70 ? '#22c55e' : sc >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Audit your prototype for accessibility compliance and inclusive design</p>
        <button onClick={handle} disabled={loading || !components.length} className="px-5 py-2.5 bg-blue-700 hover:bg-blue-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading ? 'Auditing...' : 'Audit Accessibility'}</button>
      </div>
      {loading && <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /><p className="text-slate-400 text-sm">Auditing accessibility...</p></div>}
      {result && !loading && (
        <>
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 flex items-center gap-5">
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#1e1e2e" strokeWidth="5" /><circle cx="32" cy="32" r="28" fill="none" stroke={scColor} strokeWidth="5" strokeDasharray={2*Math.PI*28} strokeDashoffset={2*Math.PI*28*(1-sc/100)} strokeLinecap="round" /></svg>
              <div className="absolute inset-0 flex items-center justify-center"><p className="text-sm font-black" style={{color:scColor}}>{sc}</p></div>
            </div>
            <div><p className="text-white font-bold">Accessibility Score</p><p className="text-slate-400 text-xs">{(result.issues||[]).length} issues found</p></div>
          </div>
          <div className="space-y-2">{(result.issues||[]).map(function(issue,i){const s=SEV[issue.severity]||SEV.Low; return(<div key={i} className={'rounded-xl border p-4 '+s}><div className="flex items-center gap-2 mb-1"><p className="text-white font-bold text-sm">{issue.area}</p><span className={'text-xs px-1.5 py-0.5 rounded border ml-auto '+s}>{issue.severity}</span></div><p className="text-slate-300 text-xs mb-1">{issue.issue}</p>{issue.fix&&<p className="text-green-400 text-xs">Fix: {issue.fix}</p>}</div>)})}</div>
          {result.recommendations?.length>0&&<div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4"><p className="text-indigo-400 text-xs font-semibold mb-2">Recommendations</p><ul className="space-y-1">{result.recommendations.map(function(r,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-indigo-400 shrink-0">{i+1}.</span>{r}</li>})}</ul></div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Re-audit</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">♿</div><p className="text-white font-semibold mb-1">Accessibility Auditor</p><p className="text-slate-500 text-sm">Audit for accessibility issues and inclusive design recommendations</p></div>}
    </div>
  )
}
export default AccessibilityAuditor
