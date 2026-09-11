import { useState } from 'react'
import { generateFieldTest, saveFieldTest, getFieldTest } from '../services/fieldTestService'
import { notify } from '../services/toast'
function FieldTestPlanner({ idea, components }) {
  const [result, setResult] = useState(getFieldTest(idea))
  const [loading, setLoading] = useState(false)
  const [activeTest, setActiveTest] = useState(0)
  const [passed, setPassed] = useState({})
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await generateFieldTest(idea, components); setResult(d); saveFieldTest(idea, d); setPassed({}); notify.success((d.testCases||[]).length+' field test cases ready!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  const tests = result?.testCases || []
  const active = tests[activeTest]
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Plan comprehensive field tests with pass/fail criteria</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Planning...':'Plan Field Tests'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Planning field tests...</p></div>}
      {result&&!loading&&(
        <>
          {(result.testSites||[]).length>0&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3"><p className="text-slate-500 text-xs font-semibold mb-2">Test Sites</p><div className="flex flex-wrap gap-1">{result.testSites.map(function(s,i){return<span key={i} className="text-xs bg-teal-950 text-teal-400 border border-teal-800 px-2 py-0.5 rounded-full">{s}</span>})}</div></div>}
          <div className="flex gap-1 overflow-x-auto pb-1">{tests.map(function(t,i){const p=passed[i];return(<button key={i} onClick={function(){setActiveTest(i)}} className={'flex-shrink-0 px-3 py-2 rounded-xl text-xs transition '+(activeTest===i?'bg-teal-700 text-white':p==='pass'?'bg-green-950 text-green-400 border border-green-800':p==='fail'?'bg-red-950 text-red-400 border border-red-800':'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')}>{t.name}</button>)})}</div>
          {active&&<div className="space-y-3">
            <div className="bg-teal-950 border border-teal-800 rounded-xl p-4"><p className="text-teal-400 text-xs font-semibold mb-1">{active.setup}</p><p className="text-white font-bold">{active.name}</p></div>
            {active.procedure?.length>0&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-slate-500 text-xs font-semibold mb-2">Procedure</p><ol className="space-y-1">{active.procedure.map(function(s,i){return<li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-teal-400 shrink-0">{i+1}.</span>{s}</li>})}</ol></div>}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-950 border border-green-800 rounded-xl p-3"><p className="text-green-400 text-xs font-semibold mb-1">Pass Criteria</p><p className="text-slate-300 text-xs">{active.passCriteria}</p></div>
              <div className="bg-red-950 border border-red-900 rounded-xl p-3"><p className="text-red-400 text-xs font-semibold mb-1">Fail Criteria</p><p className="text-slate-300 text-xs">{active.failCriteria}</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={function(){setPassed(function(p){return Object.assign({},p,{[activeTest]:'pass'})})}} className={'flex-1 py-2 rounded-xl text-xs font-semibold transition '+(passed[activeTest]==='pass'?'bg-green-600 text-white':'bg-[#1e1e2e] text-green-400 hover:bg-green-950')}>PASS</button>
              <button onClick={function(){setPassed(function(p){return Object.assign({},p,{[activeTest]:'fail'})})}} className={'flex-1 py-2 rounded-xl text-xs font-semibold transition '+(passed[activeTest]==='fail'?'bg-red-600 text-white':'bg-[#1e1e2e] text-red-400 hover:bg-red-950')}>FAIL</button>
            </div>
          </div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">🧪</div><p className="text-white font-semibold mb-1">Field Test Planner</p><p className="text-slate-500 text-sm">Plan field tests with procedures, pass/fail criteria and result tracking</p></div>}
    </div>
  )
}
export default FieldTestPlanner
