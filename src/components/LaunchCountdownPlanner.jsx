import { useState } from 'react'
import { buildLaunchCountdown, saveLaunchPlan, getLaunchPlan } from '../services/launchCountdownService'
import { notify } from '../services/toast'

const MILESTONE_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#0ea5e9', '#6366f1', '#a855f7']

function LaunchCountdownPlanner({ idea, components }) {
  const saved = getLaunchPlan(idea)
  const [result, setResult] = useState(saved?.result || null)
  const [launchDate, setLaunchDate] = useState(saved?.launchDate || '')
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState({})

  async function handleBuild() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await buildLaunchCountdown(idea, components, launchDate)
      setResult(data)
      saveLaunchPlan(idea, data, launchDate)
      setCompleted({})
      notify.success('Launch countdown plan ready!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function toggleTask(milestoneIdx, taskIdx) {
    const key = milestoneIdx + '_' + taskIdx
    setCompleted(function(prev) {
      const next = Object.assign({}, prev)
      next[key] = !next[key]
      return next
    })
  }

  const milestones = result?.milestones || []
  const allTasks = milestones.flatMap(function(m, mi) { return (m.tasks || []).map(function(t, ti) { return mi + '_' + ti }) })
  const completedCount = allTasks.filter(function(k) { return completed[k] }).length

  const daysLeft = launchDate ? Math.ceil((new Date(launchDate) - new Date()) / (1000 * 60 * 60 * 24)) : null

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <p className="text-xs text-slate-500 mb-1">Launch Date (optional)</p>
          <input type="date" value={launchDate} onChange={function(e) { setLaunchDate(e.target.value) }}
            className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-red-500" />
        </div>
        <div className="flex items-end">
          <button onClick={handleBuild} disabled={loading || components.length === 0}
            className="px-5 py-2.5 bg-red-700 hover:bg-red-600 rounded-xl text-sm font-semibold transition disabled:opacity-50">
            {loading ? 'Building...' : '🚀 Build Plan'}
          </button>
        </div>
      </div>

      {daysLeft !== null && (
        <div className={'rounded-xl border p-4 flex items-center gap-4 ' + (daysLeft > 14 ? 'bg-green-950 border-green-800' : daysLeft > 7 ? 'bg-yellow-950 border-yellow-800' : 'bg-red-950 border-red-800')}>
          <p className={'font-black text-4xl ' + (daysLeft > 14 ? 'text-green-400' : daysLeft > 7 ? 'text-yellow-400' : 'text-red-400')}>{daysLeft}</p>
          <div>
            <p className="text-white font-bold">Days Until Launch</p>
            <p className="text-slate-400 text-xs">{new Date(launchDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Building launch countdown...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 flex items-center gap-3">
            <div className="flex-1 bg-[#1e1e2e] rounded-full h-2">
              <div className="h-2 bg-red-600 rounded-full transition-all"
                style={{ width: allTasks.length > 0 ? (completedCount / allTasks.length * 100) + '%' : '0%' }} />
            </div>
            <span className="text-red-400 text-xs">{completedCount}/{allTasks.length} tasks done</span>
          </div>

          <div className="space-y-3">
            {milestones.sort(function(a, b) { return (b.daysBeforeLaunch || 0) - (a.daysBeforeLaunch || 0) }).map(function(milestone, mi) {
              const color = MILESTONE_COLORS[mi % MILESTONE_COLORS.length]
              const miTasks = milestone.tasks || []
              const miDone = miTasks.filter(function(t, ti) { return completed[mi + '_' + ti] }).length
              return (
                <div key={mi} className="rounded-xl border overflow-hidden" style={{ borderColor: color + '40' }}>
                  <div className="p-4" style={{ backgroundColor: color + '10' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                        style={{ backgroundColor: color }}>
                        {milestone.daysBeforeLaunch || '?'}D
                      </div>
                      <p className="text-white font-bold">{milestone.title}</p>
                      <span className="text-slate-500 text-xs ml-auto">{miDone}/{miTasks.length}</span>
                      {milestone.owner && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: color + '20', color }}>{milestone.owner}</span>}
                    </div>
                    <div className="w-full bg-[#1e1e2e] rounded-full h-1 mb-2">
                      <div className="h-1 rounded-full" style={{ width: miTasks.length > 0 ? (miDone / miTasks.length * 100) + '%' : '0%', backgroundColor: color }} />
                    </div>
                    <div className="space-y-1">
                      {miTasks.map(function(task, ti) {
                        const key = mi + '_' + ti
                        const done = !!completed[key]
                        return (
                          <div key={ti} onClick={function() { toggleTask(mi, ti) }}
                            className={'flex items-center gap-2 cursor-pointer rounded-lg p-1.5 hover:bg-black hover:bg-opacity-20 transition ' + (done ? 'opacity-50' : '')}>
                            <div className={'w-4 h-4 rounded border flex items-center justify-center shrink-0 ' + (done ? 'border-green-500 bg-green-600' : 'border-slate-600')}>
                              {done && <span className="text-white text-xs">v</span>}
                            </div>
                            <p className={'text-xs ' + (done ? 'line-through text-slate-500' : 'text-slate-300')}>{task}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-center">
            <p className="text-4xl mb-1">🚀</p>
            <p className="text-red-400 font-black text-xl">LAUNCH DAY</p>
            {launchDate && <p className="text-slate-400 text-xs">{new Date(launchDate).toLocaleDateString()}</p>}
          </div>

          <button onClick={handleBuild} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Rebuild Plan</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🚀</div>
          <p className="text-white font-semibold mb-1">Launch Countdown Planner</p>
          <p className="text-slate-500 text-sm">Build a milestone-based countdown with tasks and progress tracking</p>
        </div>
      )}
    </div>
  )
}

export default LaunchCountdownPlanner
