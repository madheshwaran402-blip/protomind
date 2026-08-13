import { useState, useEffect, useRef } from 'react'
import {
  getProgress,
  toggleMilestone,
  addCustomMilestone,
  updateMilestoneNotes,
  getProgressStats,
  getAIEncouragement,
} from '../services/progressTrackerService'
import { notify } from '../services/toast'

const CATEGORY_COLORS = {
  Planning: '#6366f1',
  Build: '#0ea5e9',
  Code: '#22c55e',
  Testing: '#f59e0b',
  Polish: '#a855f7',
  Launch: '#ef4444',
  Custom: '#14b8a6',
}

const CELEBRATION_MESSAGES = {
  25: { icon: '🎉', message: '25% done! Great start!' },
  50: { icon: '🔥', message: 'Halfway there! Keep pushing!' },
  75: { icon: '⚡', message: '75% done! Almost there!' },
  100: { icon: '🏆', message: 'PROJECT COMPLETE! Amazing work!' },
}

function CelebrationBurst({ celebration, onDone }) {
  useEffect(function() {
    const timer = setTimeout(onDone, 4000)
    return function() { clearTimeout(timer) }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="text-center animate-bounce">
        <div className="text-8xl mb-4">{celebration.icon}</div>
        <p className="text-white text-2xl font-black">{celebration.message}</p>
      </div>
    </div>
  )
}

function MilestoneItem({ milestone, onToggle, onNotesChange, isNext }) {
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState(milestone.notes || '')
  const catColor = CATEGORY_COLORS[milestone.category] || '#6366f1'

  function handleNoteSave() {
    onNotesChange(milestone.id, notes)
    setShowNotes(false)
    notify.success('Notes saved!')
  }

  return (
    <div className={'flex gap-3 ' + (milestone.completed ? 'opacity-100' : isNext ? 'opacity-100' : 'opacity-60')}>
      {/* Timeline line */}
      <div className="flex flex-col items-center shrink-0">
        <button
          onClick={function() { onToggle(milestone.id) }}
          className={'w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg transition hover:scale-110 ' + (
            milestone.completed
              ? 'border-transparent'
              : isNext
              ? 'border-indigo-500 bg-indigo-950 animate-pulse'
              : 'border-[#2e2e4e] bg-[#13131f]'
          )}
          style={milestone.completed ? { backgroundColor: catColor, borderColor: catColor } : {}}
        >
          {milestone.completed ? '✓' : milestone.icon}
        </button>
        <div className={'w-0.5 flex-1 mt-1 min-h-4 ' + (milestone.completed ? '' : 'bg-[#2e2e4e]')}
          style={milestone.completed ? { backgroundColor: catColor + '40' } : {}}
        />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div
          className={'rounded-xl border p-3 ' + (
            milestone.completed
              ? 'border-[#2e2e4e]'
              : isNext
              ? 'border-indigo-800 bg-indigo-950'
              : 'border-[#2e2e4e] bg-[#13131f]'
          )}
          style={milestone.completed ? { borderColor: catColor + '40', backgroundColor: catColor + '10' } : {}}
        >
          <div className="flex items-center gap-2 mb-1">
            <p className={'font-semibold text-sm ' + (milestone.completed ? 'text-white' : isNext ? 'text-indigo-300' : 'text-slate-400')}>
              {milestone.label}
            </p>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full ml-auto"
              style={{ backgroundColor: catColor + '20', color: catColor }}
            >
              {milestone.category}
            </span>
            {milestone.completed && milestone.completedAt && (
              <span className="text-slate-500 text-xs">
                {new Date(milestone.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
          <p className={'text-xs ' + (milestone.completed ? 'text-slate-400' : 'text-slate-500')}>
            {milestone.description}
          </p>

          {milestone.notes && (
            <p className="text-xs text-slate-500 mt-1 italic">"{milestone.notes}"</p>
          )}

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={function() { onToggle(milestone.id) }}
              className={'text-xs px-2 py-1 rounded-lg transition ' + (
                milestone.completed
                  ? 'bg-[#1e1e2e] text-slate-500 hover:text-red-400'
                  : 'text-white font-semibold'
              )}
              style={!milestone.completed ? { backgroundColor: catColor, } : {}}
            >
              {milestone.completed ? '↺ Undo' : '✓ Complete'}
            </button>
            <button
              onClick={function() { setShowNotes(!showNotes) }}
              className="text-xs text-slate-600 hover:text-slate-300 transition"
            >
              {milestone.notes ? '✏️ Edit note' : '+ Add note'}
            </button>
          </div>

          {showNotes && (
            <div className="mt-2 flex gap-2">
              <input
                value={notes}
                onChange={function(e) { setNotes(e.target.value) }}
                onKeyDown={function(e) { if (e.key === 'Enter') handleNoteSave() }}
                placeholder="Add a note about this milestone..."
                className="flex-1 bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-indigo-500"
              />
              <button onClick={handleNoteSave} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs">Save</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProgressTracker({ idea, components }) {
  const projectId = 'progress_' + idea.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')
  const [progress, setProgress] = useState(getProgress(projectId))
  const [stats, setStats] = useState(getProgressStats(getProgress(projectId)))
  const [celebration, setCelebration] = useState(null)
  const [encouragement, setEncouragement] = useState('')
  const [encouragementLoading, setEncouragementLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMilestone, setNewMilestone] = useState({ label: '', icon: '⭐', description: '', category: 'Custom' })
  const [filterCategory, setFilterCategory] = useState('All')
  const prevPct = useRef(stats.pct)

  useEffect(function() {
    const newStats = getProgressStats(progress)
    const newPct = newStats.pct
    const oldPct = prevPct.current

    const thresholds = [25, 50, 75, 100]
    thresholds.forEach(function(threshold) {
      if (oldPct < threshold && newPct >= threshold) {
        setCelebration(CELEBRATION_MESSAGES[threshold])
      }
    })

    prevPct.current = newPct
    setStats(newStats)
  }, [progress])

  function refresh() {
    const p = getProgress(projectId)
    setProgress(p)
  }

  function handleToggle(milestoneId) {
    const updated = toggleMilestone(projectId, milestoneId)
    setProgress(updated)
    const ms = updated.milestones.find(function(m) { return m.id === milestoneId })
    if (ms && ms.completed) {
      notify.success(ms.label + ' completed!')
    }
  }

  function handleNotesChange(milestoneId, notes) {
    updateMilestoneNotes(projectId, milestoneId, notes)
    refresh()
  }

  function handleAddCustom() {
    if (!newMilestone.label.trim()) {
      notify.warning('Enter a milestone name')
      return
    }
    addCustomMilestone(projectId, newMilestone)
    refresh()
    setNewMilestone({ label: '', icon: '⭐', description: '', category: 'Custom' })
    setShowAddForm(false)
    notify.success('Custom milestone added!')
  }

  async function handleGetEncouragement() {
    setEncouragementLoading(true)
    try {
      const msg = await getAIEncouragement(idea, stats.pct)
      setEncouragement(msg)
    } catch {
      setEncouragement('You are making amazing progress! Keep building — every prototype teaches you something new.')
    } finally {
      setEncouragementLoading(false)
    }
  }

  const allMilestones = progress.milestones || []
  const filteredMilestones = filterCategory === 'All'
    ? allMilestones
    : allMilestones.filter(function(m) { return m.category === filterCategory })

  const nextMilestone = allMilestones.find(function(m) { return !m.completed })

  const progressColor = stats.pct >= 75 ? '#22c55e' : stats.pct >= 50 ? '#6366f1' : stats.pct >= 25 ? '#f59e0b' : '#64748b'

  const categories = ['All', ...new Set(allMilestones.map(function(m) { return m.category }))]

  return (
    <div className="space-y-4">

      {celebration && (
        <CelebrationBurst
          celebration={celebration}
          onDone={function() { setCelebration(null) }}
        />
      )}

      {/* Progress summary */}
      <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
        <div className="flex items-center gap-5 mb-4">
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="35" fill="none" stroke="#1e1e2e" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="35"
                fill="none"
                stroke={progressColor}
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 35}
                strokeDashoffset={2 * Math.PI * 35 * (1 - stats.pct / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xl font-black" style={{ color: progressColor }}>{stats.pct}%</p>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-base mb-1">Project Progress</p>
            <p className="text-slate-400 text-xs mb-2">
              {stats.completed} of {stats.total} milestones complete
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-slate-500">Days Active</p>
                <p className="text-white font-bold">{stats.daysActive || 0}d</p>
              </div>
              {nextMilestone && (
                <div>
                  <p className="text-slate-500">Next Up</p>
                  <p className="text-indigo-400 font-bold truncate">{nextMilestone.icon} {nextMilestone.label}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category progress */}
        <div className="space-y-2">
          {Object.entries(stats.categoryProgress).map(function(entry) {
            const cat = entry[0]
            const catStats = entry[1]
            const catPct = catStats.total > 0 ? Math.round((catStats.completed / catStats.total) * 100) : 0
            const catColor = CATEGORY_COLORS[cat] || '#6366f1'
            return (
              <div key={cat} className="flex items-center gap-2">
                <p className="text-slate-500 text-xs w-16 shrink-0">{cat}</p>
                <div className="flex-1 bg-[#1e1e2e] rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: catPct + '%', backgroundColor: catColor }}
                  />
                </div>
                <span className="text-xs w-8 text-right shrink-0" style={{ color: catColor }}>
                  {catStats.completed}/{catStats.total}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Encouragement */}
      {encouragement ? (
        <div className="bg-indigo-950 border border-indigo-800 rounded-xl p-4 flex gap-3">
          <span className="text-2xl shrink-0">🤖</span>
          <div className="flex-1">
            <p className="text-indigo-300 text-sm leading-relaxed">{encouragement}</p>
          </div>
          <button
            onClick={function() { setEncouragement('') }}
            className="text-slate-600 hover:text-white text-xs shrink-0"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={handleGetEncouragement}
          disabled={encouragementLoading}
          className="w-full py-2.5 bg-[#13131f] hover:bg-[#1e1e2e] border border-[#2e2e4e] text-slate-400 rounded-xl text-xs transition disabled:opacity-50"
        >
          {encouragementLoading ? '🤖 Getting encouragement...' : '🤖 Get AI Encouragement'}
        </button>
      )}

      {/* Toolbar */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={function() { setShowAddForm(!showAddForm) }}
          className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition"
        >
          + Custom Milestone
        </button>
        <div className="flex gap-1 flex-wrap">
          {categories.map(function(cat) {
            const catColor = CATEGORY_COLORS[cat] || '#6366f1'
            return (
              <button
                key={cat}
                onClick={function() { setFilterCategory(cat) }}
                className={'text-xs px-2 py-1.5 rounded-lg border transition ' + (
                  filterCategory === cat
                    ? 'text-white'
                    : 'bg-[#0d0d1a] text-slate-500 border-[#1e1e2e] hover:border-slate-500'
                )}
                style={filterCategory === cat ? { backgroundColor: catColor, borderColor: catColor } : {}}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Add custom milestone form */}
      {showAddForm && (
        <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 space-y-3">
          <p className="text-white text-sm font-semibold">Add Custom Milestone</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <input
                value={newMilestone.label}
                onChange={function(e) { setNewMilestone(function(prev) { return Object.assign({}, prev, { label: e.target.value }) }) }}
                placeholder="Milestone name *"
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <input
              value={newMilestone.icon}
              onChange={function(e) { setNewMilestone(function(prev) { return Object.assign({}, prev, { icon: e.target.value }) }) }}
              placeholder="Icon emoji"
              className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none text-center text-2xl"
            />
            <input
              value={newMilestone.description}
              onChange={function(e) { setNewMilestone(function(prev) { return Object.assign({}, prev, { description: e.target.value }) }) }}
              placeholder="Description"
              className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={function() { setShowAddForm(false) }}
              className="flex-1 py-2 bg-[#0d0d1a] text-slate-400 rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCustom}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
            >
              Add Milestone
            </button>
          </div>
        </div>
      )}

      {/* Milestone timeline */}
      <div>
        {filteredMilestones.map(function(milestone) {
          return (
            <MilestoneItem
              key={milestone.id}
              milestone={milestone}
              onToggle={handleToggle}
              onNotesChange={handleNotesChange}
              isNext={nextMilestone?.id === milestone.id}
            />
          )
        })}
      </div>
    </div>
  )
}

export default ProgressTracker