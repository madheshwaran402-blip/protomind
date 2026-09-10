import { useState } from 'react'
import { getRapidAdvice, saveRapidAdvice, getRapidSaved, TIME_OPTIONS } from '../services/rapidPrototypeService'
import { notify } from '../services/toast'

const PHASE_COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#a855f7']

function RapidPrototypeAdvisor({ idea, components }) {
  const [timeLimit, setTimeLimit] = useState('24 hours')
  const [result, setResult] = useState(getRapidSaved(idea, '24 hours'))
  const [loading, setLoading] = useState(false)
  const [completedTasks, setCompletedTasks] = useState({})
  const [activePhase, setActivePhase] = useState(0)

  function handleSelectTime(t) {
    setTimeLimit(t)
    setResult(getRapidSaved(idea, t))
    setActivePhase(0)
    setCompletedTasks({})
  }

  async function handleAdvise() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await getRapidAdvice(idea, components, timeLimit)
      setResult(data)
      saveRapidAdvice(idea, timeLimit, data)
      setCompletedTasks({})
      setActivePhase(0)
      notify.success('Rapid prototype plan ready!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function toggleTask(phaseIdx, taskIdx) {
    const key = phaseIdx + '_' + taskIdx
    setCompletedTasks(function(prev) {
      const next = Object.assign({}, prev)
      next[key] = !next[key]
      return next
    })
  }

  const phases = result?.phases || []
  const allTasks = phases.flatMap(function(p, pi) { return (p.tasks || []).map(function(t, ti) { return pi + '_' + ti }) })
  const completedCount = allTasks.filter(function(k) { return completedTasks[k] }).length

  return (
    <div className="space-y-4">
      <div className="flex gap-1 flex-wrap">
        {TIME_OPTIONS.map(function(t) {
          const hasCache = !!getRapidSaved(idea, t)
          return (
            <button key={t} onClick={function() { handleSelectTime(t) }}
              className={'text-xs px-3 py-1.5 rounded-xl border transition relative ' + (timeLimit === t ? 'bg-orange-700 text-white border-orange-600' : 'bg-[#13131f] text-slate-400 border-[#2e2e4e]')}>
              {t}
              {hasCache && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-green-500" />}
            </button>
          )
        })}
      </div>

      <button onClick={handleAdvise} disabled={loading || components.length === 0}
        className="w-full py-3 bg-orange-700 hover:bg-orange-600 rounded-xl text-sm font-semibold transition disabled:opacity-50">
        {loading ? 'Planning...' : 'Get Rapid Prototype Plan for ' + timeLimit}
      </button>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Building rapid prototype plan...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="bg-orange-950 border border-orange-800 rounded-xl p-4">
            <p className="text-orange-400 text-xs font-semibold mb-1">MVP Scope for {timeLimit}</p>
            <p className="text-white text-sm">{result.mvpScope}</p>
            {completedCount > 0 && (
              <div className="mt-2">
                <div className="flex-1 bg-[#1e1e2e] rounded-full h-1.5">
                  <div className="h-1.5 bg-orange-600 rounded-full" style={{ width: (completedCount / allTasks.length * 100) + '%' }} />
                </div>
                <p className="text-orange-400 text-xs mt-1">{completedCount}/{allTasks.length} tasks done</p>
              </div>
            )}
          </div>

          {result.cutFeatures?.length > 0 && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-slate-500 text-xs font-semibold mb-2">Cut for Now (do later)</p>
              <div className="flex flex-wrap gap-1">
                {result.cutFeatures.map(function(f, i) {
                  return <span key={i} className="text-xs bg-[#0d0d1a] text-slate-400 border border-[#2e2e4e] px-2 py-0.5 rounded-full line-through">{f}</span>
                })}
              </div>
            </div>
          )}

          <div className="flex gap-1 overflow-x-auto pb-1">
            {phases.map(function(phase, i) {
              const color = PHASE_COLORS[i % PHASE_COLORS.length]
              const phaseDone = (phase.tasks || []).filter(function(t, ti) { return completedTasks[i + '_' + ti] }).length
              return (
                <button key={i} onClick={function() { setActivePhase(i) }}
                  className={'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition ' + (activePhase === i ? 'text-white' : 'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')}
                  style={activePhase === i ? { backgroundColor: color } : {}}>
                  {phase.phase}
                  <span className="ml-1 opacity-60">{phase.duration}</span>
                  {phaseDone > 0 && <span className="ml-1">({phaseDone}✓)</span>}
                </button>
              )
            })}
          </div>

          {phases[activePhase] && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PHASE_COLORS[activePhase % PHASE_COLORS.length] }} />
                <p className="text-white font-bold">{phases[activePhase].phase}</p>
                <span className="text-slate-500 text-xs">{phases[activePhase].duration}</span>
              </div>
              {(phases[activePhase].tasks || []).map(function(task, ti) {
                const key = activePhase + '_' + ti
                const done = !!completedTasks[key]
                return (
                  <div key={ti} onClick={function() { toggleTask(activePhase, ti) }}
                    className={'flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ' + (done ? 'bg-green-950 border-green-900 opacity-60' : 'bg-[#13131f] border-[#2e2e4e] hover:border-orange-700')}>
                    <div className={'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ' + (done ? 'bg-green-600 border-green-500' : 'border-[#2e2e4e]')}>
                      {done && <span className="text-white text-xs">v</span>}
                    </div>
                    <p className={'text-sm ' + (done ? 'line-through text-slate-500' : 'text-white')}>{task}</p>
                  </div>
                )
              })}
              {phases[activePhase].deliverable && (
                <div className="bg-[#0d0d1a] border border-orange-800 rounded-xl p-3">
                  <p className="text-orange-400 text-xs font-semibold">Deliverable: {phases[activePhase].deliverable}</p>
                </div>
              )}
            </div>
          )}

          {result.shortcuts?.length > 0 && (
            <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-4">
              <p className="text-yellow-400 text-xs font-semibold mb-2">⚡ Shortcuts & Tradeoffs</p>
              {result.shortcuts.map(function(s, i) {
                return (
                  <div key={i} className="mb-1">
                    <span className="text-white text-xs font-medium">{s.shortcut}</span>
                    <span className="text-slate-500 text-xs"> — {s.tradeoff}</span>
                  </div>
                )
              })}
            </div>
          )}

          {result.riskyAssumptions?.length > 0 && (
            <div className="bg-red-950 border border-red-900 rounded-xl p-4">
              <p className="text-red-400 text-xs font-semibold mb-2">⚠️ Risky Assumptions to Validate</p>
              <ul className="space-y-1">
                {result.riskyAssumptions.map(function(r, i) {
                  return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-red-400 shrink-0">!</span>{r}</li>
                })}
              </ul>
            </div>
          )}

          <button onClick={handleAdvise} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate Plan</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">⚡</div>
          <p className="text-white font-semibold mb-1">Rapid Prototype Advisor</p>
          <p className="text-slate-500 text-sm">Get a time-boxed build plan with shortcuts, tradeoffs and task tracking</p>
        </div>
      )}
    </div>
  )
}

export default RapidPrototypeAdvisor
