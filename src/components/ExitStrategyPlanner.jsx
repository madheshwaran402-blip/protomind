import { useState } from 'react'
import { planExitStrategy, saveExitStrategy, getExitStrategy } from '../services/exitStrategyService'
import { notify } from '../services/toast'

const EXIT_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#0ea5e9', '#a855f7']

function ExitStrategyPlanner({ idea, components }) {
  const [result, setResult] = useState(getExitStrategy(idea))
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)

  async function handlePlan() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await planExitStrategy(idea, components)
      setResult(data)
      saveExitStrategy(idea, data)
      notify.success('Exit strategies planned!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const strategies = result?.strategies || []
  const active = strategies[selected]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Plan acquisition, IPO and other exit strategies for your hardware product</p>
        <button onClick={handlePlan} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Planning...' : 'Plan Exit'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Planning exit strategies...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {strategies.map(function(s, i) {
              const color = EXIT_COLORS[i % EXIT_COLORS.length]
              return (
                <button key={i} onClick={function() { setSelected(i) }}
                  className={'flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition ' + (selected === i ? 'text-white' : 'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')}
                  style={selected === i ? { backgroundColor: color } : {}}>
                  {s.type}
                </button>
              )
            })}
          </div>

          {active && (
            <div className="space-y-3">
              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: EXIT_COLORS[selected % EXIT_COLORS.length] + '20' }}>
                    <span className="text-2xl">🚪</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-black text-xl">{active.type}</p>
                    <p className="text-slate-400 text-sm mt-0.5">{active.description}</p>
                    <div className="flex gap-4 mt-2 text-xs">
                      {active.timeline && <span className="text-slate-500">Timeline: {active.timeline}</span>}
                      {active.valuationRange && <span style={{ color: EXIT_COLORS[selected % EXIT_COLORS.length] }}>Valuation: {active.valuationRange}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {active.acquirers?.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-slate-500 text-xs font-semibold mb-2">Potential Acquirers / Partners</p>
                  <div className="flex flex-wrap gap-1">
                    {active.acquirers.map(function(a, i) {
                      return (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: EXIT_COLORS[selected % EXIT_COLORS.length] + '20', color: EXIT_COLORS[selected % EXIT_COLORS.length] }}>
                          {a}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {active.steps?.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-slate-500 text-xs font-semibold mb-2">Preparation Steps</p>
                  <ol className="space-y-1">
                    {active.steps.map(function(step, i) {
                      return <li key={i} className="text-slate-300 text-xs flex gap-2"><span style={{ color: EXIT_COLORS[selected % EXIT_COLORS.length] }} className="shrink-0">{i+1}.</span>{step}</li>
                    })}
                  </ol>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {active.pros?.length > 0 && (
                  <div className="bg-green-950 border border-green-800 rounded-xl p-3">
                    <p className="text-green-400 text-xs font-semibold mb-1">Pros</p>
                    {active.pros.map(function(p, i) {
                      return <p key={i} className="text-slate-300 text-xs">+ {p}</p>
                    })}
                  </div>
                )}
                {active.cons?.length > 0 && (
                  <div className="bg-red-950 border border-red-800 rounded-xl p-3">
                    <p className="text-red-400 text-xs font-semibold mb-1">Cons</p>
                    {active.cons.map(function(c, i) {
                      return <p key={i} className="text-slate-400 text-xs">- {c}</p>
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <button onClick={handlePlan} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🚪</div>
          <p className="text-white font-semibold mb-1">Exit Strategy Planner</p>
          <p className="text-slate-500 text-sm">Plan acquisition, IPO and licensing exit strategies with valuation ranges</p>
        </div>
      )}
    </div>
  )
}

export default ExitStrategyPlanner
