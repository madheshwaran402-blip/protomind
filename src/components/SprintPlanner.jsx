import { useState } from 'react'
import { generateSprint, saveSprint, getSprint } from '../services/sprintPlannerService'
import { notify } from '../services/toast'

const TASK_TYPE_COLORS = {
  Hardware: '#6366f1',
  Software: '#22c55e',
  Testing: '#f59e0b',
  Documentation: '#0ea5e9',
  Design: '#a855f7',
  Research: '#ef4444',
}

const PRIORITY_STYLES = {
  High: 'text-red-400 bg-red-950 border-red-800',
  Medium: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Low: 'text-green-400 bg-green-950 border-green-800',
}

const DURATIONS = ['1 week', '2 weeks', '3 weeks', '4 weeks']

function SprintPlanner({ idea, components }) {
  const saved = getSprint(idea)
  const [sprint, setSprint] = useState(saved?.result || null)
  const [completed, setCompleted] = useState(saved?.completed || {})
  const [loading, setLoading] = useState(false)
  const [duration, setDuration] = useState('2 weeks')
  const [activeDay, setActiveDay] = useState(0)

  async function handleGenerate() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await generateSprint(idea, components, duration)
      setSprint(data)
      setCompleted({})
      saveSprint(idea, data, {})
      setActiveDay(0)
      notify.success('Sprint plan ready!')
    } catch { notify.error('Generation failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function toggleTask(taskId) {
    const newCompleted = Object.assign({}, completed, { [taskId]: !completed[taskId] })
    setCompleted(newCompleted)
    saveSprint(idea, sprint, newCompleted)
  }

  const days = sprint?.days || []
  const allTasks = days.flatMap(function(d) { return d.tasks || [] })
  const completedCount = Object.values(completed).filter(Boolean).length
  const totalTasks = allTasks.length
  const pct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select value={duration} onChange={function(e) { setDuration(e.target.value) }}
          className="bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none flex-1">
          {DURATIONS.map(function(d) { return <option key={d} value={d}>{d}</option> })}
        </select>
        <button onClick={handleGenerate} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-violet-700 hover:bg-violet-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? '🗓️ Planning...' : '🗓️ Plan Sprint'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Planning your sprint...</p>
        </div>
      )}

      {sprint && !loading && (
        <>
          <div className="bg-violet-950 border border-violet-800 rounded-xl p-4">
            <p className="text-violet-300 font-bold">{sprint.sprintName}</p>
            <p className="text-slate-400 text-xs mt-1">🎯 Goal: {sprint.goal}</p>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1 bg-[#1e1e2e] rounded-full h-2">
                <div className="h-2 bg-violet-600 rounded-full transition-all" style={{ width: pct + '%' }} />
              </div>
              <span className="text-violet-400 text-xs font-bold">{completedCount}/{totalTasks} ({pct}%)</span>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1">
            {days.map(function(day, i) {
              const dayDone = (day.tasks || []).filter(function(t) { return completed[t.id] }).length
              return (
                <button key={i} onClick={function() { setActiveDay(i) }}
                  className={'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition ' + (
                    activeDay === i ? 'bg-violet-700 text-white' : 'bg-[#13131f] text-slate-400 border border-[#2e2e4e]'
                  )}>
                  Day {day.day}
                  {dayDone > 0 && <span className="ml-1 text-green-400">({dayDone}✓)</span>}
                </button>
              )
            })}
          </div>

          {days[activeDay] && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">Day {days[activeDay].day} Tasks</p>
              {(days[activeDay].tasks || []).map(function(task) {
                const done = !!completed[task.id]
                const typeColor = TASK_TYPE_COLORS[task.type] || '#6366f1'
                const priStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium
                return (
                  <div key={task.id} onClick={function() { toggleTask(task.id) }}
                    className={'flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ' + (done ? 'bg-green-950 border-green-900 opacity-60' : 'bg-[#13131f] border-[#2e2e4e] hover:border-violet-700')}>
                    <div className={'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ' + (done ? 'bg-green-600 border-green-500' : 'border-[#2e2e4e]')}>
                      {done && <span className="text-white text-xs">✓</span>}
                    </div>
                    <p className={'text-sm flex-1 ' + (done ? 'line-through text-slate-500' : 'text-white')}>{task.title}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {task.estimate && <span className="text-slate-500 text-xs">{task.estimate}</span>}
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: typeColor + '20', color: typeColor }}>{task.type}</span>
                      <span className={'text-xs px-1.5 py-0.5 rounded border ' + priStyle}>{task.priority}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <button onClick={handleGenerate} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">↺ Regenerate Sprint</button>
        </>
      )}

      {!sprint && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🗓️</div>
          <p className="text-white font-semibold mb-1">AI Sprint Planner</p>
          <p className="text-slate-500 text-sm">Generate a day-by-day sprint plan for your prototype build</p>
        </div>
      )}
    </div>
  )
}

export default SprintPlanner
