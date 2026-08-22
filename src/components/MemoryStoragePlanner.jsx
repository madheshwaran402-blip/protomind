import { useState } from 'react'
import { planMemoryStorage, saveMemoryPlan, getMemoryPlan } from '../services/memoryStorageService'
import { notify } from '../services/toast'

const MEM_COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#a855f7', '#ef4444']

function MemoryStoragePlanner({ idea, components }) {
  const [result, setResult] = useState(getMemoryPlan(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('ram')

  async function handlePlan() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await planMemoryStorage(idea, components)
      setResult(data)
      saveMemoryPlan(idea, data)
      notify.success('Memory plan ready!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const TABS = [{ id: 'ram', label: 'RAM' }, { id: 'flash', label: 'Flash' }, { id: 'storage', label: 'Storage' }, { id: 'tips', label: 'Optimise' }]

  function MemoryChart({ analysis, color }) {
    if (!analysis) return null
    const usage = analysis.usage || []
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-500">Total: {analysis.total}</span>
        </div>
        <div className="flex h-6 rounded-lg overflow-hidden gap-0.5">
          {usage.map(function(u, i) {
            return (
              <div key={i} className="flex-1 rounded" style={{ backgroundColor: MEM_COLORS[i % MEM_COLORS.length] }}
                title={u.section + ': ' + u.size} />
            )
          })}
        </div>
        <div className="space-y-1.5">
          {usage.map(function(u, i) {
            return (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded shrink-0" style={{ backgroundColor: MEM_COLORS[i % MEM_COLORS.length] }} />
                <span className="text-white text-xs font-medium">{u.section}</span>
                <span className="text-slate-500 text-xs">{u.size}</span>
                <span className="text-slate-600 text-xs ml-auto">{u.description}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Plan RAM, Flash and external storage for your prototype</p>
        <button onClick={handlePlan} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Planning...' : 'Plan Memory'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Planning memory and storage...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 overflow-x-auto">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ' + (activeTab === tab.id ? 'bg-indigo-700 text-white' : 'text-slate-500 hover:text-white')}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'ram' && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs text-slate-500 font-semibold mb-3">RAM Usage</p>
              <MemoryChart analysis={result.ramAnalysis} color="#6366f1" />
            </div>
          )}

          {activeTab === 'flash' && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs text-slate-500 font-semibold mb-3">Flash Usage</p>
              <MemoryChart analysis={result.flashAnalysis} color="#0ea5e9" />
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-2">
              {(result.storageOptions || []).map(function(opt, i) {
                const color = MEM_COLORS[i % MEM_COLORS.length]
                return (
                  <div key={i} className="rounded-xl border p-4" style={{ backgroundColor: color + '10', borderColor: color + '30' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-white font-bold text-sm">{opt.type}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: color + '20', color }}>{opt.capacity}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs mb-1">
                      {opt.interface && <span className="text-slate-400">Interface: {opt.interface}</span>}
                      {opt.readSpeed && <span className="text-green-400">Read: {opt.readSpeed}</span>}
                      {opt.writeSpeed && <span className="text-blue-400">Write: {opt.writeSpeed}</span>}
                    </div>
                    {opt.bestFor && <p className="text-slate-500 text-xs">Best for: {opt.bestFor}</p>}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs text-slate-500 font-semibold mb-2">Optimisation Tips</p>
              <ul className="space-y-2">
                {(result.optimizationTips || []).map(function(tip, i) {
                  return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-indigo-400 shrink-0">{i+1}.</span>{tip}</li>
                })}
              </ul>
            </div>
          )}

          <button onClick={handlePlan} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Replan</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">💾</div>
          <p className="text-white font-semibold mb-1">Memory & Storage Planner</p>
          <p className="text-slate-500 text-sm">Plan RAM, Flash and storage layout for your microcontroller</p>
        </div>
      )}
    </div>
  )
}

export default MemoryStoragePlanner
