import { useState } from 'react'
import {
  getTeamNotes,
  addMember,
  addTeamNote,
  addTask,
  toggleTask,
  TEAM_ROLES,
  NOTE_TYPES,
} from '../services/collaborationService'
import { notify } from '../services/toast'

const PRIORITY_STYLES = {
  High: 'text-red-400 bg-red-950 border-red-800',
  Medium: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Low: 'text-green-400 bg-green-950 border-green-800',
}

const NOTE_TYPE_STYLES = {
  note: { bg: 'bg-indigo-950', border: 'border-indigo-800', color: 'text-indigo-400' },
  decision: { bg: 'bg-green-950', border: 'border-green-800', color: 'text-green-400' },
  issue: { bg: 'bg-red-950', border: 'border-red-800', color: 'text-red-400' },
  idea: { bg: 'bg-yellow-950', border: 'border-yellow-800', color: 'text-yellow-400' },
}

function formatTime(dateStr) {
  const diff = (new Date() - new Date(dateStr)) / 1000
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
  return Math.floor(diff / 86400) + 'd ago'
}

function TeamCollaboration({ idea }) {
  const projectId = 'collab_' + idea.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')
  const [data, setData] = useState(getTeamNotes(projectId))
  const [activeTab, setActiveTab] = useState('feed')
  const [newNote, setNewNote] = useState('')
  const [noteType, setNoteType] = useState('note')
  const [noteAuthor, setNoteAuthor] = useState(localStorage.getItem('protomind_username') || '')
  const [newTask, setNewTask] = useState({ title: '', assignee: '', priority: 'Medium' })
  const [newMember, setNewMember] = useState({ name: '', role: TEAM_ROLES[0], avatar: '👤' })
  const [showMemberForm, setShowMemberForm] = useState(false)

  function refresh() {
    setData(getTeamNotes(projectId))
  }

  function handleAddNote() {
    if (!newNote.trim()) {
      notify.warning('Write a note first')
      return
    }
    const author = noteAuthor.trim() || 'Anonymous'
    localStorage.setItem('protomind_username', author)
    addTeamNote(projectId, { text: newNote, author, type: noteType })
    setNewNote('')
    refresh()
    notify.success('Note added!')
  }

  function handleAddTask() {
    if (!newTask.title.trim()) {
      notify.warning('Add a task title')
      return
    }
    addTask(projectId, newTask)
    setNewTask({ title: '', assignee: '', priority: 'Medium' })
    refresh()
    notify.success('Task added!')
  }

  function handleAddMember() {
    if (!newMember.name.trim()) {
      notify.warning('Add member name')
      return
    }
    addMember(projectId, newMember)
    setNewMember({ name: '', role: TEAM_ROLES[0], avatar: '👤' })
    setShowMemberForm(false)
    refresh()
    notify.success('Team member added!')
  }

  function handleToggleTask(taskId) {
    toggleTask(projectId, taskId)
    refresh()
  }

  const doneTasks = (data.tasks || []).filter(function(t) { return t.done }).length
  const totalTasks = (data.tasks || []).length

  const TABS = [
    { id: 'feed', label: '📢 Feed' },
    { id: 'tasks', label: '✅ Tasks (' + (totalTasks - doneTasks) + ')' },
    { id: 'team', label: '👥 Team' },
  ]

  return (
    <div className="space-y-4">
      {/* Month 6 banner */}
      <div className="bg-gradient-to-r from-purple-950 to-indigo-950 border border-purple-700 rounded-xl p-3 flex items-center gap-2">
        <span className="text-xl">🚀</span>
        <p className="text-purple-300 text-xs font-semibold">Month 6 — Collaboration Features! Days 151-180</p>
      </div>

      <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 overflow-x-auto">
        {TABS.map(function(tab) {
          return (
            <button key={tab.id}
              onClick={function() { setActiveTab(tab.id) }}
              className={'flex-1 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ' + (
                activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
              )}>
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'feed' && (
        <div className="space-y-3">
          {/* Post note */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 space-y-3">
            <div className="flex gap-2 flex-wrap">
              {NOTE_TYPES.map(function(nt) {
                const style = NOTE_TYPE_STYLES[nt.value]
                return (
                  <button key={nt.value}
                    onClick={function() { setNoteType(nt.value) }}
                    className={'text-xs px-2 py-1 rounded-lg border transition ' + (
                      noteType === nt.value
                        ? style.bg + ' ' + style.color + ' ' + style.border
                        : 'bg-[#0d0d1a] text-slate-500 border-[#2e2e4e]'
                    )}>
                    {nt.label}
                  </button>
                )
              })}
            </div>
            <input
              value={noteAuthor}
              onChange={function(e) { setNoteAuthor(e.target.value) }}
              placeholder="Your name"
              className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-indigo-500"
            />
            <textarea
              value={newNote}
              onChange={function(e) { setNewNote(e.target.value) }}
              placeholder="Share an update, decision, issue or idea..."
              className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none resize-none"
              rows={3}
            />
            <button onClick={handleAddNote}
              disabled={!newNote.trim()}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50">
              Post Update
            </button>
          </div>

          {/* Feed */}
          {(data.notes || []).length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-4">No updates yet — post the first one!</p>
          ) : (
            (data.notes || []).map(function(note) {
              const typeStyle = NOTE_TYPE_STYLES[note.type] || NOTE_TYPE_STYLES.note
              const typeInfo = NOTE_TYPES.find(function(t) { return t.value === note.type })
              return (
                <div key={note.id} className={'rounded-xl border p-4 ' + typeStyle.bg + ' ' + typeStyle.border}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{note.avatar}</span>
                    <p className="text-white text-xs font-semibold">{note.author}</p>
                    <span className={'text-xs ' + typeStyle.color}>{typeInfo?.label}</span>
                    <span className="text-slate-600 text-xs ml-auto">{formatTime(note.createdAt)}</span>
                  </div>
                  <p className="text-slate-300 text-sm">{note.text}</p>
                </div>
              )
            })
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {/* Add task */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 space-y-2">
            <input
              value={newTask.title}
              onChange={function(e) { setNewTask(function(p) { return Object.assign({}, p, { title: e.target.value }) }) }}
              placeholder="Task title..."
              className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={newTask.assignee}
                onChange={function(e) { setNewTask(function(p) { return Object.assign({}, p, { assignee: e.target.value }) }) }}
                placeholder="Assign to..."
                className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-xs outline-none"
              />
              <select
                value={newTask.priority}
                onChange={function(e) { setNewTask(function(p) { return Object.assign({}, p, { priority: e.target.value }) }) }}
                className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-xs outline-none"
              >
                {['High', 'Medium', 'Low'].map(function(p) { return <option key={p} value={p}>{p}</option> })}
              </select>
            </div>
            <button onClick={handleAddTask} disabled={!newTask.title.trim()}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50">
              + Add Task
            </button>
          </div>

          {/* Progress */}
          {totalTasks > 0 && (
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-500">{doneTasks}/{totalTasks} done</span>
              <div className="flex-1 bg-[#1e1e2e] rounded-full h-1.5">
                <div className="h-1.5 bg-green-600 rounded-full"
                  style={{ width: (doneTasks / totalTasks * 100) + '%' }} />
              </div>
            </div>
          )}

          {/* Task list */}
          <div className="space-y-2">
            {(data.tasks || []).map(function(task) {
              const pStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium
              return (
                <div key={task.id}
                  onClick={function() { handleToggleTask(task.id) }}
                  className={'flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition hover:opacity-80 ' + (
                    task.done ? 'bg-[#13131f] border-[#1e1e2e] opacity-50' : 'bg-[#13131f] border-[#2e2e4e]'
                  )}>
                  <div className={'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ' + (
                    task.done ? 'bg-green-600 border-green-500' : 'border-[#2e2e4e]'
                  )}>
                    {task.done && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div className="flex-1">
                    <p className={'text-sm ' + (task.done ? 'text-slate-500 line-through' : 'text-white')}>{task.title}</p>
                    {task.assignee && <p className="text-slate-600 text-xs">{task.assignee}</p>}
                  </div>
                  <span className={'text-xs px-1.5 py-0.5 rounded border ' + pStyle}>{task.priority}</span>
                </div>
              )
            })}
            {(data.tasks || []).length === 0 && (
              <p className="text-slate-600 text-sm text-center py-4">No tasks yet</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-3">
          {/* Members */}
          <div className="grid grid-cols-2 gap-2">
            {(data.members || []).map(function(member) {
              return (
                <div key={member.id} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 flex items-center gap-2">
                  <span className="text-2xl">{member.avatar}</span>
                  <div>
                    <p className="text-white text-xs font-semibold">{member.name}</p>
                    <p className="text-slate-500 text-xs">{member.role}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={function() { setShowMemberForm(!showMemberForm) }}
            className="w-full py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition">
            + Add Team Member
          </button>

          {showMemberForm && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 space-y-2">
              <input
                value={newMember.name}
                onChange={function(e) { setNewMember(function(p) { return Object.assign({}, p, { name: e.target.value }) }) }}
                placeholder="Name"
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
              />
              <div className="flex gap-2">
                <select
                  value={newMember.role}
                  onChange={function(e) { setNewMember(function(p) { return Object.assign({}, p, { role: e.target.value }) }) }}
                  className="flex-1 bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-xs outline-none">
                  {TEAM_ROLES.map(function(r) { return <option key={r} value={r}>{r}</option> })}
                </select>
                <input
                  value={newMember.avatar}
                  onChange={function(e) { setNewMember(function(p) { return Object.assign({}, p, { avatar: e.target.value }) }) }}
                  placeholder="👤"
                  className="w-12 bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg text-center text-2xl outline-none"
                />
              </div>
              <button onClick={handleAddMember}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition">
                Add Member
              </button>
            </div>
          )}

          {(data.members || []).length === 0 && !showMemberForm && (
            <p className="text-slate-600 text-sm text-center py-4">No team members yet — add your first collaborator</p>
          )}
        </div>
      )}
    </div>
  )
}

export default TeamCollaboration