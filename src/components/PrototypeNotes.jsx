import { useState, useEffect } from 'react'
import {
  getNotesForProject,
  saveMainNote,
  saveComponentNote,
  addBuildLogEntry,
  deleteBuildLogEntry,
  addNextStep,
  toggleNextStep,
  deleteNextStep,
  updateProjectStatus,
} from '../services/notes'
import { notify } from '../services/toast'

const STATUSES = [
  { id: 'Planning', icon: '📋', color: 'text-slate-400', bg: 'bg-slate-900', border: 'border-slate-700' },
  { id: 'Building', icon: '🔧', color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800' },
  { id: 'Testing', icon: '🧪', color: 'text-blue-400', bg: 'bg-blue-950', border: 'border-blue-800' },
  { id: 'Working', icon: '✅', color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800' },
  { id: 'On Hold', icon: '⏸️', color: 'text-orange-400', bg: 'bg-orange-950', border: 'border-orange-800' },
]

function PrototypeNotes({ idea, components }) {
  const [notes, setNotes] = useState(getNotesForProject(idea))
  const [mainNote, setMainNote] = useState('')
  const [logEntry, setLogEntry] = useState('')
  const [nextStep, setNextStep] = useState('')
  const [activeTab, setActiveTab] = useState('notes')
  const [selectedComp, setSelectedComp] = useState(null)
  const [compNote, setCompNote] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const n = getNotesForProject(idea)
    setNotes(n)
    setMainNote(n.mainNote || '')
  }, [idea])

  function handleSaveMain() {
    saveMainNote(idea, mainNote)
    setNotes(getNotesForProject(idea))
    notify.success('Notes saved!')
  }

  function handleAddLog() {
    if (!logEntry.trim()) return
    addBuildLogEntry(idea, logEntry)
    setNotes(getNotesForProject(idea))
    setLogEntry('')
    notify.success('Build log entry added!')
  }

  function handleDeleteLog(id) {
    deleteBuildLogEntry(idea, id)
    setNotes(getNotesForProject(idea))
  }

  function handleAddStep() {
    if (!nextStep.trim()) return
    addNextStep(idea, nextStep)
    setNotes(getNotesForProject(idea))
    setNextStep('')
  }

  function handleToggleStep(id) {
    toggleNextStep(idea, id)
    setNotes(getNotesForProject(idea))
  }

  function handleDeleteStep(id) {
    deleteNextStep(idea, id)
    setNotes(getNotesForProject(idea))
  }

  function handleStatusChange(status) {
    updateProjectStatus(idea, status)
    setNotes(getNotesForProject(idea))
    notify.success('Status updated to ' + status)
  }

  function handleSaveCompNote() {
    if (!selectedComp) return
    saveComponentNote(idea, selectedComp, compNote)
    setNotes(getNotesForProject(idea))
    notify.success('Component note saved!')
  }

  const currentStatus = STATUSES.find(s => s.id === notes.status) || STATUSES[0]
  const doneSteps = (notes.nextSteps || []).filter(s => s.done).length
  const totalSteps = (notes.nextSteps || []).length

  const TABS = [
    { id: 'notes', label: '📝 Notes' },
    { id: 'log', label: '📋 Build Log' },
    { id: 'steps', label: '✅ Next Steps' },
    { id: 'components', label: '🔧 Component Notes' },
  ]

  return (
    <div className="mt-6 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h3 className="text-lg font-bold text-white">📝 Prototype Notes</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Build log, next steps, component annotations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-3 py-1 rounded-full border ${currentStatus.color} ${currentStatus.bg} ${currentStatus.border}`}>
            {currentStatus.icon} {currentStatus.id}
          </span>
          {totalSteps > 0 && (
            <span className="text-xs text-slate-500">{doneSteps}/{totalSteps} steps</span>
          )}
          <span className="text-slate-500 text-sm">{isOpen ? '↑' : '↓'}</span>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4">

          {/* Status selector */}
          <div className="flex gap-2 flex-wrap mb-4">
            <p className="text-xs text-slate-500 w-full">Project status:</p>
            {STATUSES.map(s => (
              <button
                key={s.id}
                onClick={() => handleStatusChange(s.id)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                  notes.status === s.id
                    ? s.bg + ' ' + s.color + ' ' + s.border
                    : 'bg-[#13131f] border-[#2e2e4e] text-slate-500 hover:border-indigo-800'
                }`}
              >
                {s.icon} {s.id}
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-[#13131f] rounded-xl p-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notes tab */}
          {activeTab === 'notes' && (
            <div className="space-y-3">
              <textarea
                value={mainNote}
                onChange={e => setMainNote(e.target.value)}
                placeholder="Write your prototype notes here... What are you building? What have you learned? Any ideas?"
                className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition resize-none"
                rows={6}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">{mainNote.length} characters</span>
                <button
                  onClick={handleSaveMain}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition"
                >
                  💾 Save Notes
                </button>
              </div>
              {notes.updatedAt && (
                <p className="text-xs text-slate-600">
                  Last saved: {new Date(notes.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Build log tab */}
          {activeTab === 'log' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  value={logEntry}
                  onChange={e => setLogEntry(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddLog()}
                  placeholder="What did you do today? e.g. Wired the sensor, tested voltage..."
                  className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition"
                />
                <button
                  onClick={handleAddLog}
                  disabled={!logEntry.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm transition disabled:opacity-50"
                >
                  + Add
                </button>
              </div>

              {(notes.buildLog || []).length === 0 ? (
                <div className="text-center py-8 text-slate-600 text-sm">
                  No build log entries yet. Start logging your progress!
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(notes.buildLog || []).map(entry => (
                    <div key={entry.id} className="flex items-start gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3">
                      <div className="flex-1">
                        <p className="text-white text-sm">{entry.text}</p>
                        <p className="text-slate-600 text-xs mt-1">
                          {new Date(entry.timestamp).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteLog(entry.id)}
                        className="text-slate-600 hover:text-red-400 text-xs transition shrink-0"
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Next steps tab */}
          {activeTab === 'steps' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  value={nextStep}
                  onChange={e => setNextStep(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddStep()}
                  placeholder="What needs to be done next? e.g. Order resistors, test I2C connection..."
                  className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition"
                />
                <button
                  onClick={handleAddStep}
                  disabled={!nextStep.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm transition disabled:opacity-50"
                >
                  + Add
                </button>
              </div>

              {totalSteps > 0 && (
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500">{doneSteps}/{totalSteps} completed</p>
                  <div className="w-32 bg-[#1e1e2e] rounded-full h-1.5">
                    <div
                      className="h-1.5 bg-indigo-600 rounded-full transition-all"
                      style={{ width: (totalSteps > 0 ? (doneSteps / totalSteps) * 100 : 0) + '%' }}
                    />
                  </div>
                </div>
              )}

              {(notes.nextSteps || []).length === 0 ? (
                <div className="text-center py-8 text-slate-600 text-sm">
                  No next steps yet. What do you need to do?
                </div>
              ) : (
                <div className="space-y-2">
                  {(notes.nextSteps || []).map(step => (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition ${
                        step.done
                          ? 'bg-green-950 border-green-900 opacity-60'
                          : 'bg-[#13131f] border-[#2e2e4e]'
                      }`}
                    >
                      <button
                        onClick={() => handleToggleStep(step.id)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition ${
                          step.done
                            ? 'bg-green-600 border-green-600'
                            : 'border-slate-600 hover:border-indigo-500'
                        }`}
                      >
                        {step.done && <span className="text-white text-xs">✓</span>}
                      </button>
                      <p className={`flex-1 text-sm ${step.done ? 'text-green-400 line-through' : 'text-white'}`}>
                        {step.text}
                      </p>
                      <button
                        onClick={() => handleDeleteStep(step.id)}
                        className="text-slate-600 hover:text-red-400 text-xs transition shrink-0"
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Component notes tab */}
          {activeTab === 'components' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 mb-3">
                {components.map(comp => (
                  <button
                    key={comp.id}
                    onClick={() => {
                      setSelectedComp(comp.name)
                      setCompNote(notes.componentNotes?.[comp.name] || '')
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition text-xs ${
                      selectedComp === comp.name
                        ? 'bg-indigo-950 border-indigo-700 text-white'
                        : 'bg-[#13131f] border-[#2e2e4e] text-slate-400 hover:border-indigo-800'
                    }`}
                  >
                    <span>{comp.icon}</span>
                    <span className="truncate">{comp.name.split(' ')[0]}</span>
                    {notes.componentNotes?.[comp.name] && (
                      <span className="text-indigo-400 shrink-0">📝</span>
                    )}
                  </button>
                ))}
              </div>

              {selectedComp ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">Notes for: <span className="text-white">{selectedComp}</span></p>
                  <textarea
                    value={compNote}
                    onChange={e => setCompNote(e.target.value)}
                    placeholder={`Notes about ${selectedComp}... pin connections, voltage, issues found...`}
                    className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition resize-none"
                    rows={4}
                  />
                  <button
                    onClick={handleSaveCompNote}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition"
                  >
                    💾 Save Note
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-600 text-sm">
                  Click a component above to add notes
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PrototypeNotes