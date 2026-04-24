import { useState, useEffect } from 'react'
import {
  getTimeline,
  toggleMilestone,
  updateMilestoneNote,
  addCustomMilestone,
  deleteCustomMilestone,
  getProgress,
} from '../services/timeline'
import { notify } from '../services/toast'

function MilestoneCard({ milestone, onToggle, onNoteUpdate, onDelete, index, isLast }) {
  const [editingNote, setEditingNote] = useState(false)
  const [note, setNote] = useState(milestone.notes || '')

  function handleSaveNote() {
    onNoteUpdate(milestone.id, note)
    setEditingNote(false)
    notify.success('Note saved!')
  }

  const date = milestone.completedAt
    ? new Date(milestone.completedAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null

  return (
    <div className="flex gap-4">
      {/* Timeline line */}
      <div className="flex flex-col items-center shrink-0">
        <button
          onClick={() => onToggle(milestone.id)}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition shrink-0 ${
            milestone.completed
              ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900'
              : 'bg-[#13131f] border-[#2e2e4e] hover:border-indigo-600'
          }`}
        >
          {milestone.completed ? '✓' : milestone.icon}
        </button>
        {!isLast && (
          <div className={`w-0.5 flex-1 mt-1 min-h-8 ${
            milestone.completed ? 'bg-indigo-800' : 'bg-[#1e1e2e]'
          }`} />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-6 ${isLast ? '' : ''}`}>
        <div className={`rounded-xl border p-4 transition ${
          milestone.completed
            ? 'bg-indigo-950 border-indigo-900'
            : 'bg-[#13131f] border-[#2e2e4e]'
        }`}>
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              <p className={`text-sm font-semibold ${milestone.completed ? 'text-white' : 'text-slate-400'}`}>
                {milestone.label}
              </p>
              {milestone.isCustom && (
                <span className="text-xs bg-[#1e1e2e] text-slate-500 px-1.5 py-0.5 rounded">custom</span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              {date && (
                <span className="text-xs text-indigo-400">{date}</span>
              )}
              {milestone.isCustom && (
                <button
                  onClick={() => onDelete(milestone.id)}
                  className="text-slate-600 hover:text-red-400 text-xs transition"
                >
                  🗑
                </button>
              )}
            </div>
          </div>

          <p className="text-slate-500 text-xs mb-2">{milestone.desc}</p>

          {/* Note */}
          {editingNote ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add notes about this milestone..."
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <button onClick={handleSaveNote} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs transition">Save</button>
                <button onClick={() => { setEditingNote(false); setNote(milestone.notes || '') }} className="px-3 py-1.5 bg-[#1e1e2e] text-slate-400 rounded-lg text-xs transition">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              {milestone.notes ? (
                <p className="text-slate-400 text-xs flex-1 italic">"{milestone.notes}"</p>
              ) : (
                <p className="text-slate-700 text-xs flex-1">No notes</p>
              )}
              <button
                onClick={() => setEditingNote(true)}
                className="text-xs text-slate-600 hover:text-indigo-400 transition shrink-0"
              >
                {milestone.notes ? '✏️ Edit' : '+ Note'}
              </button>
            </div>
          )}

          {/* Mark complete button */}
          <button
            onClick={() => onToggle(milestone.id)}
            className={`mt-3 w-full py-1.5 rounded-lg text-xs font-medium transition ${
              milestone.completed
                ? 'bg-indigo-900 text-indigo-300 hover:bg-red-950 hover:text-red-400'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {milestone.completed ? '✓ Completed — click to undo' : '→ Mark Complete'}
          </button>
        </div>
      </div>
    </div>
  )
}

function BuildTimeline({ idea }) {
  const [timeline, setTimeline] = useState(getTimeline(idea))
  const [progress, setProgress] = useState(getProgress(idea))
  const [newMilestoneLabel, setNewMilestoneLabel] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    setTimeline(getTimeline(idea))
    setProgress(getProgress(idea))
  }, [idea])

  function handleToggle(milestoneId) {
    const updated = toggleMilestone(idea, milestoneId)
    setTimeline(updated)
    setProgress(getProgress(idea))
    const m = updated.milestones.find(m => m.id === milestoneId)
    if (m?.completed) {
      notify.success(m.label + ' marked complete! 🎉')
    }
  }

  function handleNoteUpdate(milestoneId, note) {
    const updated = updateMilestoneNote(idea, milestoneId, note)
    setTimeline(updated)
  }

  function handleAddMilestone() {
    if (!newMilestoneLabel.trim()) return
    const updated = addCustomMilestone(idea, newMilestoneLabel)
    setTimeline(updated)
    setProgress(getProgress(idea))
    setNewMilestoneLabel('')
    setShowAddForm(false)
    notify.success('Milestone added!')
  }

  function handleDeleteMilestone(milestoneId) {
    const updated = deleteCustomMilestone(idea, milestoneId)
    setTimeline(updated)
    setProgress(getProgress(idea))
    notify.success('Milestone removed')
  }

  const completedCount = timeline.milestones.filter(m => m.completed).length

  return (
    <div className="space-y-4">

      {/* Progress header */}
      <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-white text-sm font-semibold">Build Progress</p>
          <span className="text-indigo-400 font-bold text-sm">{progress.percent}%</span>
        </div>
        <div className="w-full bg-[#1e1e2e] rounded-full h-2.5 mb-2">
          <div
            className="h-2.5 rounded-full bg-indigo-600 transition-all duration-500"
            style={{ width: progress.percent + '%' }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-600">
          <span>{completedCount} of {progress.total} milestones complete</span>
          {progress.percent === 100 && (
            <span className="text-yellow-400 font-semibold">🎉 Build Complete!</span>
          )}
        </div>
      </div>

      {/* Milestone icons overview */}
      <div className="flex gap-1 flex-wrap">
        {timeline.milestones.map(m => (
          <div
            key={m.id}
            title={m.label}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm cursor-pointer transition ${
              m.completed ? 'bg-indigo-600' : 'bg-[#13131f] border border-[#2e2e4e]'
            }`}
            onClick={() => handleToggle(m.id)}
          >
            {m.completed ? '✓' : m.icon}
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="mt-4">
        {timeline.milestones.map((milestone, index) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            index={index}
            isLast={index === timeline.milestones.length - 1}
            onToggle={handleToggle}
            onNoteUpdate={handleNoteUpdate}
            onDelete={handleDeleteMilestone}
          />
        ))}
      </div>

      {/* Add custom milestone */}
      {showAddForm ? (
        <div className="flex gap-2">
          <input
            value={newMilestoneLabel}
            onChange={e => setNewMilestoneLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddMilestone()}
            placeholder="New milestone name..."
            className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
            autoFocus
          />
          <button onClick={handleAddMilestone} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition">Add</button>
          <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-[#1e1e2e] text-slate-400 rounded-xl text-xs transition">Cancel</button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-2.5 border-2 border-dashed border-[#2e2e4e] hover:border-indigo-700 text-slate-500 hover:text-indigo-400 rounded-xl text-sm transition"
        >
          + Add Custom Milestone
        </button>
      )}
    </div>
  )
}

export default BuildTimeline