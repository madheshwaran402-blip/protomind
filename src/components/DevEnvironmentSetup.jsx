import { useState } from 'react'
import { generateDevEnvironment, saveDevEnv, getDevEnv } from '../services/devEnvironmentService'
import { notify } from '../services/toast'
function DevEnvironmentSetup({ idea, components }) {
  const [result, setResult] = useState(getDevEnv(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('tools')
  const [copied, setCopied] = useState(null)
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await generateDevEnvironment(idea, components); setResult(d); saveDevEnv(idea, d); notify.success('Dev environment guide ready!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  function copy(text, idx) { navigator.clipboard.writeText(text); setCopied(idx); setTimeout(function(){setCopied(null)},2000); notify.success('Copied!') }
  const TABS = [{id:'tools',label:'Tools'},{id:'configs',label:'Configs'},{id:'tips',label:'Tips'}]
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate complete dev environment setup with tools and configs</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Generating...':'Generate Setup'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Generating dev environment...</p></div>}
      {result&&!loading&&(
        <>
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">{TABS.map(function(t){return<button key={t.id} onClick={function(){setActiveTab(t.id)}} className={'flex-1 py-2 rounded-lg text-xs font-medium transition '+(activeTab===t.id?'bg-cyan-700 text-white':'text-slate-500 hover:text-white')}>{t.label}</button>})}</div>
          {activeTab==='tools'&&<div className="space-y-2">{(result.tools||[]).map(function(tool,i){return(<div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><div className="flex items-center gap-2 mb-1"><p className="text-white font-bold text-sm">{tool.name}</p>{tool.version&&<span className="text-cyan-400 text-xs">{tool.version}</span>}</div><p className="text-slate-400 text-xs mb-2">{tool.purpose}</p>{tool.installCmd&&<div className="flex items-center gap-2 bg-[#0d0d1a] rounded-lg p-2"><code className="text-green-400 text-xs flex-1">{tool.installCmd}</code><button onClick={function(){copy(tool.installCmd,i)}} className="text-slate-500 hover:text-white text-xs">{copied===i?'ok':'copy'}</button></div>}</div>)})}</div>}
          {activeTab==='configs'&&<div className="space-y-3">{(result.configs||[]).map(function(cfg,i){return(<div key={i} className="bg-[#0a0a0f] border border-[#2e2e4e] rounded-xl overflow-hidden"><div className="flex items-center gap-2 px-4 py-2 bg-[#13131f] border-b border-[#2e2e4e]"><span className="text-slate-400 text-xs">{cfg.filename}</span><button onClick={function(){copy(cfg.content,100+i)}} className="ml-auto text-xs text-slate-500 hover:text-white">{copied===100+i?'ok':'copy'}</button></div><pre className="px-4 py-3 text-green-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-48">{cfg.content}</pre></div>)})}</div>}
          {activeTab==='tips'&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><ul className="space-y-2">{(result.tips||[]).map(function(tip,i){return<li key={i} className="text-slate-300 text-sm flex gap-2"><span className="text-cyan-400 shrink-0">{i+1}.</span>{tip}</li>})}</ul></div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">💻</div><p className="text-white font-semibold mb-1">Dev Environment Setup</p><p className="text-slate-500 text-sm">Generate complete dev environment with tools, configs and tips</p></div>}
    </div>
  )
}
export default DevEnvironmentSetup
