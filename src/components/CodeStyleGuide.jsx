import { useState } from 'react'
import { generateCodeStyle, saveCodeStyle, getCodeStyle } from '../services/codeStyleService'
import { notify } from '../services/toast'
const CAT_COLORS={'Naming':'#6366f1','Functions':'#0ea5e9','Comments':'#22c55e','Structure':'#f59e0b','Safety':'#ef4444'}
function CodeStyleGuide({ idea, components }) {
  const [result, setResult] = useState(getCodeStyle(idea))
  const [loading, setLoading] = useState(false)
  const [filterCat, setFilterCat] = useState('All')
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await generateCodeStyle(idea, components); setResult(d); saveCodeStyle(idea, d); notify.success('Code style guide ready!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  const rules = result?.rules || []
  const cats = ['All', ...new Set(rules.map(function(r){return r.category}).filter(Boolean))]
  const filtered = filterCat==='All' ? rules : rules.filter(function(r){return r.category===filterCat})
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate firmware coding style guide with good/bad examples</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Generating...':'Generate Style Guide'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Generating code style guide...</p></div>}
      {result&&!loading&&(
        <>
          <div className="flex gap-1 flex-wrap">{cats.map(function(c){const color=CAT_COLORS[c]||'#6366f1';return(<button key={c} onClick={function(){setFilterCat(c)}} className={'text-xs px-2 py-1 rounded-lg border transition '+(filterCat===c?'text-white':'bg-[#13131f] text-slate-500 border-[#2e2e4e]')} style={filterCat===c?{backgroundColor:color,borderColor:color}:{}}>{c}</button>)})}</div>
          <div className="space-y-3">{filtered.map(function(rule,i){const color=CAT_COLORS[rule.category]||'#6366f1';return(<div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><div className="flex items-center gap-2 mb-2"><span className="text-xs px-1.5 py-0.5 rounded" style={{backgroundColor:color+'20',color}}>{rule.category}</span><p className="text-white font-bold text-sm">{rule.rule}</p></div>{rule.reason&&<p className="text-slate-400 text-xs mb-2">{rule.reason}</p>}<div className="grid grid-cols-2 gap-2">{rule.good&&<div className="bg-green-950 border border-green-900 rounded-lg p-2"><p className="text-green-400 text-xs font-semibold mb-1">Good</p><pre className="text-green-300 text-xs overflow-x-auto">{rule.good}</pre></div>}{rule.bad&&<div className="bg-red-950 border border-red-900 rounded-lg p-2"><p className="text-red-400 text-xs font-semibold mb-1">Bad</p><pre className="text-red-300 text-xs overflow-x-auto">{rule.bad}</pre></div>}</div></div>)})}</div>
          {result.linterConfig&&<div className="bg-[#0a0a0f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-slate-500 text-xs font-semibold mb-2">Linter Config</p><pre className="text-green-400 text-xs overflow-x-auto">{result.linterConfig}</pre></div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">📐</div><p className="text-white font-semibold mb-1">Code Style Guide</p><p className="text-slate-500 text-sm">Generate coding standards with good/bad examples and linter config</p></div>}
    </div>
  )
}
export default CodeStyleGuide
