import { useState, useEffect } from 'react'
import { generateTimeline, saveTimelinePlan, saveTaskProgress, getTaskProgress } from '../services/timelinePlannerService'
import { notify } from '../services/toast'

const PHASE_COLORS = [
  '#6366f1', '#0ea5e9', '#22c55e', '#f59e0b',
  '#ef4444', '#a855f7', '#14b8a6', '#f97316',
]

const PRIORITY_STYLES = {
  Critical: 'text-red-400 bg-red-950 border-red-800',
  High: 'text-orange-400 bg-orange-950 border-orange-800',
  Medium: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Low: 'text-green-400 bg-green-950 border-green-800',
}

function GanttBar({ phase, totalWeeks, color, progress }) {
  const left = ((phase.weekStart - 1) / totalWeeks) * 100
  const width = ((phase.weekEnd - phase.weekStart + 1) / totalWeeks) * 100

  return (
    <div className="flex items-center gap-3 mb-2">
      <p className="text-slate-400 text-xs w-24 shrink-0 truncate">{phase.name}</p>
      <div className="flex-1 relative h-7 bg-[#1e1e2e] rounded-lg overflow-hidden">
        <div
          className="absolute top-0 h-full rounded-lg flex items-center px-2 transition-all"
          style={{
            left: left + '%',
            width: width + '%',
            backgroundColor: color + '33',
            border: '1px solid ' + color + '66',
          }}
        >
          {progress > 0 && (
            <div
              className="absolute left-0 top-0 h-full rounded-lg opacity-60"
              style={{ width: progress + '%', backgroundColor: color }}
            />
          )}
          <span className="text-xs font-medium z-10 relative truncate" style={{ color }}>
            W{phase.weekStart}-W{phase.weekEnd}
          </span>
        </div>
      </div>
      <span className="text-xs text-slate-500 w-8 shrink-0">{progress}%</span>
    </div>
  )
}

function PhaseCard({ phase, idea, color, progress, onProgressChange }) {
  const [expanded, setExpanded] = useState(false)
  const [taskStates, setTaskStates] = useState(function() {
    const saved = getTaskProgress(idea)
    return saved[phase.id] || {}
  })

  function toggleTask(taskId) {
    const newDone = !taskStates[taskId]
    const newStates = Object.assign({}, taskStates, { [taskId]: newDone })
    setTaskStates(newStates)
    saveTaskProgress(idea, phase.id, taskId, newDone)

    const tasks = phase.tasks || []
    const doneCount = tasks.filter(function(t) { return newStates[t.id] }).length
    const newProgress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0
    onProgressChange(phase.id, newProgress)
  }

  const tasks = phase.tasks || []
  const doneCount = tasks.filter(function(t) { return taskStates[t.id] }).length

  return (
    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
      <button
        onClick={function() { setExpanded(!expanded) }}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#1e1e2e] transition"
      >
        <div
          className="w-3 h-12 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-white font-semibold text-sm">{phase.name}</p>
            <span className="text-xs text-slate-500">Week {phase.weekStart}-{phase.weekEnd}</span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-500">{phase.hours || 0}h</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#1e1e2e] rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{ width: progress + '%', backgroundColor: color }}
              />
            </div>
            <span className="text-xs shrink-0" style={{ color }}>
              {doneCount}/{tasks.length}
            </span>
          </div>
        </div>
        <span className="text-slate-600 shrink-0">{expanded ? '↑' : '↓'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[#2e2e4e] pt-3 space-y-2">
          <p className="text-slate-400 text-xs">{phase.description}</p>
          {tasks.map(function(task) {
            const isDone = taskStates[task.id] || false
            const priClass = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium
            return (
              <div
                key={task.id}
                className={'flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition ' + (
                  isDone ? 'bg-green-950 border border-green-900' : 'bg-[#0d0d1a] border border-[#2e2e4e] hover:border-indigo-600'
                )}
                onClick={function() { toggleTask(task.id) }}
              >
                <div className={'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ' + (
                  isDone ? 'bg-green-600 border-green-500' : 'border-slate-600'
                )}>
                  {isDone && <span className="text-white text-xs">✓</span>}
                </div>
                <p className={'text-sm flex-1 ' + (isDone ? 'line-through text-slate-500' : 'text-white')}>
                  {task.name}
                </p>
                {task.hours && (
                  <span className="text-slate-500 text-xs shrink-0">{task.hours}h</span>
                )}
                {task.priority && !isDone && (
                  <span className={'text-xs px-1.5 py-0.5 rounded border shrink-0 ' + priClass}>
                    {task.priority}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TimelinePlanner({ idea, components }) {
  const [timeline, setTimeline] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('gantt')
  const [options, setOptions] = useState({
    skillLevel: 'Intermediate',
    hoursPerWeek: 10,
    targetDate: '',
  })
  const [phaseProgress, setPhaseProgress] = useState({})

  function updateOption(key, value) {
    setOptions(function(prev) {
      const next = Object.assign({}, prev)
      next[key] = value
      return next
    })
  }

  function handleProgressChange(phaseId, progress) {
    setPhaseProgress(function(prev) {
      const next = Object.assign({}, prev)
      next[phaseId] = progress
      return next
    })
  }

  async function handleGenerate() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    setTimeline(null)
    setPhaseProgress({})
    try {
      const data = await generateTimeline(idea, components, options)
      setTimeline(data)
      saveTimelinePlan(idea, data)
      const initialProgress = {}
      ;(data.phases || []).forEach(function(phase) {
        const saved = getTaskProgress(idea)
        const phaseProgress = saved[phase.id] || {}
        const tasks = phase.tasks || []
        const doneCount = tasks.filter(function(t) { return phaseProgress[t.id] }).length
        initialProgress[phase.id] = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0
      })
      setPhaseProgress(initialProgress)
      notify.success('Timeline generated — ' + (data.totalWeeks || 0) + ' weeks, ' + (data.totalHours || 0) + 'h total')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const overallProgress = timeline && timeline.phases && timeline.phases.length > 0
    ? Math.round(
        Object.values(phaseProgress).reduce(function(a, b) { return a + b }, 0) /
        timeline.phases.length
      )
    : 0

  const TABS = [
    { id: 'gantt', label: '📊 Gantt' },
    { id: 'phases', label: '📋 Phases' },
    { id: 'milestones', label: '🎯 Milestones' },
    { id: 'tips', label: '💡 Tips' },
  ]

  return (
    <div className="space-y-4">

      {/* Options */}
      <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 space-y-3">
        <p className="text-xs text-slate-500 uppercase tracking-wide">Planning Options</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">Skill Level</p>
            <select
              value={options.skillLevel}
              onChange={function(e) { updateOption('skillLevel', e.target.value) }}
              className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Hours / Week</p>
            <input
              type="number"
              value={options.hoursPerWeek}
              onChange={function(e) { updateOption('hoursPerWeek', parseInt(e.target.value) || 10) }}
              min="1"
              max="40"
              className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
            />
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Target Completion Date (optional)</p>
          <input
            type="date"
            value={options.targetDate}
            onChange={function(e) { updateOption('targetDate', e.target.value) }}
            className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || components.length === 0}
        className="w-full py-3 bg-purple-700 hover:bg-purple-600 rounded-xl text-sm font-bold transition disabled:opacity-50"
      >
        {loading ? '📅 Planning...' : '📅 Generate Build Timeline'}
      </button>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is planning your build timeline...</p>
        </div>
      )}

      {timeline && !loading && (
        <>
          {/* Summary */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-base">{timeline.projectName}</h3>
              <span className="text-purple-400 text-sm font-bold">{overallProgress}% done</span>
            </div>

            <div className="w-full bg-[#1e1e2e] rounded-full h-3 mb-4">
              <div
                className="h-3 rounded-full bg-purple-600 transition-all"
                style={{ width: overallProgress + '%' }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Weeks', value: timeline.totalWeeks || 0, icon: '📅' },
                { label: 'Total Hours', value: (timeline.totalHours || 0) + 'h', icon: '⏱️' },
                { label: 'Phases', value: (timeline.phases || []).length, icon: '📋' },
              ].map(function(stat) {
                return (
                  <div key={stat.label} className="bg-[#0d0d1a] rounded-xl p-3 text-center">
                    <p className="text-lg mb-1">{stat.icon}</p>
                    <p className="text-white font-bold text-sm">{stat.value}</p>
                    <p className="text-slate-600 text-xs">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 overflow-x-auto">
            {TABS.map(function(tab) {
              return (
                <button
                  key={tab.id}
                  onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ' + (
                    activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Gantt tab */}
          {activeTab === 'gantt' && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide flex-1">Build Schedule</p>
                <div className="flex gap-2 text-xs text-slate-600">
                  <span>W1</span>
                  <span className="flex-1 text-right">W{timeline.totalWeeks}</span>
                </div>
              </div>
              {(timeline.phases || []).map(function(phase, i) {
                const color = PHASE_COLORS[i % PHASE_COLORS.length]
                const progress = phaseProgress[phase.id] || 0
                return (
                  <GanttBar
                    key={phase.id || i}
                    phase={phase}
                    totalWeeks={timeline.totalWeeks || 8}
                    color={color}
                    progress={progress}
                  />
                )
              })}

              {/* Milestones on gantt */}
              {(timeline.milestones || []).filter(function(m) { return m.critical }).length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#2e2e4e]">
                  <p className="text-xs text-slate-500 mb-2">Critical Milestones</p>
                  <div className="flex flex-wrap gap-2">
                    {(timeline.milestones || []).filter(function(m) { return m.critical }).map(function(m, i) {
                      return (
                        <span key={i} className="text-xs bg-yellow-950 text-yellow-400 border border-yellow-800 px-2 py-0.5 rounded-full">
                          🏆 W{m.week}: {m.name}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Phases tab */}
          {activeTab === 'phases' && (
            <div className="space-y-2">
              <p className="text-slate-500 text-xs mb-2">Click tasks to mark as complete</p>
              {(timeline.phases || []).map(function(phase, i) {
                const color = PHASE_COLORS[i % PHASE_COLORS.length]
                const progress = phaseProgress[phase.id] || 0
                return (
                  <PhaseCard
                    key={phase.id || i}
                    phase={phase}
                    idea={idea}
                    color={color}
                    progress={progress}
                    onProgressChange={handleProgressChange}
                  />
                )
              })}
            </div>
          )}

          {/* Milestones tab */}
          {activeTab === 'milestones' && (
            <div className="space-y-2">
              {(timeline.milestones || []).map(function(milestone, i) {
                return (
                  <div
                    key={i}
                    className={'flex items-start gap-3 rounded-xl border p-4 ' + (
                      milestone.critical
                        ? 'bg-yellow-950 border-yellow-800'
                        : 'bg-[#13131f] border-[#2e2e4e]'
                    )}
                  >
                    <div className="flex flex-col items-center shrink-0">
                      <div className={'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ' + (
                        milestone.critical
                          ? 'bg-yellow-600 border-yellow-500 text-white'
                          : 'bg-[#1e1e2e] border-slate-600 text-slate-400'
                      )}>
                        W{milestone.week}
                      </div>
                      {i < (timeline.milestones || []).length - 1 && (
                        <div className="w-0.5 h-6 bg-[#2e2e4e] mt-1" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className={'font-semibold text-sm ' + (milestone.critical ? 'text-yellow-300' : 'text-white')}>
                          {milestone.name}
                        </p>
                        {milestone.critical && (
                          <span className="text-xs bg-yellow-900 text-yellow-400 border border-yellow-700 px-1.5 py-0.5 rounded-full">
                            Critical
                          </span>
                        )}
                      </div>
                      <p className={'text-xs ' + (milestone.critical ? 'text-yellow-400' : 'text-slate-400')}>
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Tips tab */}
          {activeTab === 'tips' && (
            <div className="space-y-3">
              {timeline.risks && timeline.risks.length > 0 && (
                <div className="bg-red-950 border border-red-900 rounded-xl p-4">
                  <p className="text-red-400 text-xs font-semibold mb-2">⚠️ Schedule Risks</p>
                  <ul className="space-y-1">
                    {timeline.risks.map(function(risk, i) {
                      return (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <span className="text-red-400 shrink-0">•</span>
                          <p className="text-red-200">{risk}</p>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {timeline.tips && timeline.tips.length > 0 && (
                <div className="space-y-2">
                  {timeline.tips.map(function(tip, i) {
                    return (
                      <div key={i} className="flex items-start gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3">
                        <span className="text-purple-400 font-bold text-sm shrink-0">{i + 1}.</span>
                        <p className="text-slate-300 text-sm">{tip}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleGenerate}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Regenerate Timeline
          </button>
        </>
      )}

      {!timeline && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">📅</div>
          <p className="text-white font-semibold mb-1">Build Timeline Planner</p>
          <p className="text-slate-500 text-sm mb-4">
            AI breaks your build into phases with tasks, milestones and a Gantt chart
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ Gantt chart</span>
            <span>✓ Phase breakdown</span>
            <span>✓ Task tracking</span>
            <span>✓ Milestones</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default TimelinePlanner