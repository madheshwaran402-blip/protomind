import { useState } from 'react'
import { planABTests, saveABTests, getABTests } from '../services/abTestService'
import { notify } from '../services/toast'

function ABTestPlanner({ idea, components }) {
  const [result, setResult] = useState(getABTests(idea))
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)
  const [winners, setWinners] = useState({})

  async function handlePlan() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await planABTests(idea, components)
      setResult(data)
      saveABTests(idea, data)
      notify.success((data.tests?.length || 0) + ' A/B tests planned!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function pickWinner(testIdx, variant) {
    setWinners(function(prev) { return Object.assign({}, prev, { [testIdx]: variant }) })
    notify.success('Winner recorded: Variant ' + variant)
  }

  const tests = result?.tests || []
  const activeTest = tests[selected]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Plan rigorous A/B tests to validate design decisions for your prototype</p>
        <button onClick={handlePlan} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Planning...' : 'Plan A/B Tests'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Planning A/B tests...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {tests.map(function(test, i) {
              const won = winners[i]
              return (
                <button key={i} onClick={function() { setSelected(i) }}
                  className={'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition ' + (selected === i ? 'bg-cyan-700 text-white' : 'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')}>
                  Test {i + 1}
                  {won && <span className="ml-1">{won === 'A' ? '🅰️' : '🅱️'}</span>}
                </button>
              )
            })}
          </div>

          {activeTest && (
            <div className="space-y-3">
              <div className="bg-cyan-950 border border-cyan-800 rounded-xl p-4">
                <p className="text-cyan-400 text-xs font-semibold mb-1">Test {selected + 1}</p>
                <p className="text-white font-bold text-lg">{activeTest.name}</p>
                <p className="text-slate-400 text-xs mt-1 italic">Hypothesis: {activeTest.hypothesis}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={'rounded-xl border p-4 ' + (winners[selected] === 'A' ? 'bg-green-950 border-green-700' : 'bg-[#13131f] border-[#2e2e4e]')}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🅰️</span>
                    <p className="text-white font-bold">Variant A</p>
                    {winners[selected] === 'A' && <span className="text-green-400 text-xs ml-auto">WINNER</span>}
                  </div>
                  <p className="text-slate-300 text-xs">{activeTest.variantA}</p>
                  {winners[selected] !== 'A' && (
                    <button onClick={function() { pickWinner(selected, 'A') }}
                      className="mt-2 w-full py-1 bg-[#0d0d1a] hover:bg-green-950 text-slate-400 hover:text-green-400 rounded-lg text-xs transition">
                      Mark as Winner
                    </button>
                  )}
                </div>
                <div className={'rounded-xl border p-4 ' + (winners[selected] === 'B' ? 'bg-green-950 border-green-700' : 'bg-[#13131f] border-[#2e2e4e]')}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🅱️</span>
                    <p className="text-white font-bold">Variant B</p>
                    {winners[selected] === 'B' && <span className="text-green-400 text-xs ml-auto">WINNER</span>}
                  </div>
                  <p className="text-slate-300 text-xs">{activeTest.variantB}</p>
                  {winners[selected] !== 'B' && (
                    <button onClick={function() { pickWinner(selected, 'B') }}
                      className="mt-2 w-full py-1 bg-[#0d0d1a] hover:bg-green-950 text-slate-400 hover:text-green-400 rounded-lg text-xs transition">
                      Mark as Winner
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Metric', value: activeTest.metric, icon: '📊' },
                  { label: 'Sample Size', value: activeTest.sampleSize, icon: '👥' },
                  { label: 'Duration', value: activeTest.duration, icon: '⏱️' },
                ].map(function(item) {
                  return item.value ? (
                    <div key={item.label} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center">
                      <p className="text-lg mb-0.5">{item.icon}</p>
                      <p className="text-white text-xs font-bold">{item.value}</p>
                      <p className="text-slate-500 text-xs">{item.label}</p>
                    </div>
                  ) : null
                })}
              </div>

              {activeTest.successCriteria && (
                <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-3">
                  <p className="text-indigo-400 text-xs font-semibold">Success Criteria</p>
                  <p className="text-slate-300 text-xs">{activeTest.successCriteria}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={function() { setSelected(Math.max(0, selected - 1)) }} disabled={selected === 0}
                  className="flex-1 py-1.5 bg-[#1e1e2e] text-slate-400 rounded-lg text-xs disabled:opacity-30">Prev Test</button>
                <button onClick={function() { setSelected(Math.min(tests.length - 1, selected + 1)) }} disabled={selected === tests.length - 1}
                  className="flex-1 py-1.5 bg-cyan-700 text-white rounded-lg text-xs disabled:opacity-30">Next Test</button>
              </div>
            </div>
          )}

          <button onClick={handlePlan} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🔬</div>
          <p className="text-white font-semibold mb-1">A/B Test Planner</p>
          <p className="text-slate-500 text-sm">Plan rigorous A/B tests to validate design and hardware decisions</p>
        </div>
      )}
    </div>
  )
}

export default ABTestPlanner
