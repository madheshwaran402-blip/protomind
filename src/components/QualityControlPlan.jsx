import { useState } from 'react'
import { generateQualityControl, saveQualityControl, getQualityControl } from '../services/qualityControlService'
import { notify } from '../services/toast'
function QualityControlPlan({ idea, components }) {
  const [result, setResult] = useState(getQualityControl(idea))
  const [loading, setLoading] = useState(false)
  const [activeStage, setActiveStage] = useState(0)
  const [passed, setPassed] = useState({})
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await generateQualityControl(idea, components); setResult(d); saveQualityControl(idea, d); setPassed({}); notify.success('QC plan ready!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  const checkpoints = result?.checkpoints || []
  const active = checkpoints[activeStage]
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate quality control checkpoints with test methods and pass criteria</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-yellow-700 hover:bg-yellow-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Generating...':'Generate QC Plan'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Generating QC plan...</p></div>}
      {result&&!loading&&(
        <>
          <div className="flex gap-1 overflow-x-auto pb-1">{checkpoints.map(function(cp,i){return<button key={i} onClick={function(){setActiveStage(i)}} className={'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition '+(activeStage===i?'bg-yellow-700 text-white':'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')}>{cp.stage}</button>})}</div>
          {active&&<div className="space-y-2">
            <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-3"><p className="text-yellow-400 text-xs font-semibold">Stage: {active.stage}</p><p className="text-white text-sm font-bold">{(active.tests||[]).length} tests in this stage</p></div>
            {(active.tests||[]).map(function(test,i){const key=activeStage+'_'+i;const p=passed[key];return(<div key={i} className={'rounded-xl border p-4 '+(p==='pass'?'bg-green-950 border-green-800':p==='fail'?'bg-red-950 border-red-800':'bg-[#13131f] border-[#2e2e4e]')}><div className="flex items-start gap-2 mb-2"><div className="flex-1"><p className="text-white font-bold text-sm">{test.test}</p>{test.method&&<p className="text-slate-400 text-xs">Method: {test.method}</p>}{test.frequency&&<p className="text-slate-500 text-xs">{test.frequency}</p>}</div></div>{test.passValue&&<div className="grid grid-cols-2 gap-2 text-xs mb-2"><div className="bg-green-950 rounded-lg p-2 text-center"><p className="text-green-400">Pass</p><p className="text-white font-bold">{test.passValue}</p></div>{test.failAction&&<div className="bg-red-950 rounded-lg p-2 text-center"><p className="text-red-400">Fail Action</p><p className="text-white text-xs">{test.failAction}</p></div>}</div>}<div className="flex gap-2"><button onClick={function(){setPassed(function(prev){return Object.assign({},prev,{[key]:'pass'})})}} className={'flex-1 py-1.5 rounded-lg text-xs font-semibold '+(p==='pass'?'bg-green-600 text-white':'bg-[#1e1e2e] text-green-400 hover:bg-green-950')}>PASS</button><button onClick={function(){setPassed(function(prev){return Object.assign({},prev,{[key]:'fail'})})}} className={'flex-1 py-1.5 rounded-lg text-xs font-semibold '+(p==='fail'?'bg-red-600 text-white':'bg-[#1e1e2e] text-red-400 hover:bg-red-950')}>FAIL</button></div></div>)}
          </div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">✅</div><p className="text-white font-semibold mb-1">Quality Control Plan</p><p className="text-slate-500 text-sm">Generate QC checkpoints with test methods and pass/fail criteria</p></div>}
    </div>
  )
}
export default QualityControlPlan
