import { useState, useEffect } from 'react'
import {
  ROLES,
  getTeam,
  addMember,
  removeMember,
  addCollabNote,
  deleteNote,
  addTask,
  updateTaskStatus,
  deleteTask,
} from '../services/teamService'
import { notify } from '../services/toast'

const PRIORITY_COLORS = {
  High: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800' },
  Medium: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800' },
  Low: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800' },
}

const STATUS_COLORS = {
  Todo: { color: 'text-slate-400', bg: 'bg-slate-900' },
  'In Progress': { color: 'text-yellow-400', bg: 'bg-yellow-950' },
  Done: { color: 'text-green-400', bg: 'bg-green-950' },
}

function MemberAvatar({ member, size = 'md' }) {
  const role = ROLES.find(r => r.id === member.role)
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm'

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold shrink-0`}
      style={{ backgroundColor: (role?.color || '#6366f1') + '30', color: role?.color || '#6366f1', border: '2px solid ' + (role?.color || '#6366f1') + '50' }}
      title={member.name + ' — ' + (role?.label || member.role)}
    >
      {member.avatar}
    </div>
  )
}

function TeamCollaboration({ idea, components }) {
  const [team, setTeam] = useState(getTeam(idea))
  const [activeTab, setActiveTab] = useState('members')
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('hardware')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [noteText, setNoteText] = useState('')
  const [noteAuthor, setNoteAuthor] = useState('')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskAssignee, setNewTaskAssignee] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('Medium')
  const [showAddTask, setShowAddTask] = useState(false)

  useEffect(() => {
    setTeam(getTeam(idea))
  }, [idea])

  function refresh() {
    setTeam(getTeam(idea))
  }

  function handleAddMember() {
    if (!newMemberName.trim()) {
      notify.warning('Name is required')
      return
    }
    addMember(idea, { name: newMemberName, role: newMemberRole, email: newMemberEmail })
    refresh()
    setNewMemberName('')
    setNewMemberEmail('')
    setShowAddMember(false)
    notify.success(newMemberName + ' added to the team!')
  }

  function handleRemoveMember(memberId, name) {
    removeMember(idea, memberId)
    refresh()
    notify.success(name + ' removed from team')
  }

  function handleAddNote() {
    if (!noteText.trim()) return
    const author = noteAuthor.trim() || 'Anonymous'
    addCollabNote(idea, noteText, author)
    refresh()
    setNoteText('')
    notify.success('Note added!')
  }

  function handleDeleteNote(noteId) {
    deleteNote(idea, noteId)
    refresh()
  }

  function handleAddTask() {
    if (!newTaskTitle.trim()) {
      notify.warning('Task title is required')
      return
    }
    addTask(idea, {
      title: newTaskTitle,
      assignedTo: newTaskAssignee,
      priority: newTaskPriority,
    })
    refresh()
    setNewTaskTitle('')
    setNewTaskAssignee('')
    setShowAddTask(false)
    notify.success('Task added!')
  }

  function handleStatusChange(taskId, status) {
    updateTaskStatus(idea, taskId, status)
    refresh()
  }

  function handleDeleteTask(taskId) {
    deleteTask(idea, taskId)
    refresh()
  }

  const TABS = [
    { id: 'members', label: '👥 Team' },
    { id: 'tasks', label: '✅ Tasks' },
    { id: 'notes', label: '💬 Notes' },
  ]

  const doneTasks = (team.tasks || []).filter(t => t.status === 'Done').length
  const totalTasks = (team.tasks || []).length

  return (
    <div className="space-y-4">

      {/* Team summary */}
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {team.members.slice(0, 5).map(member => (
            <MemberAvatar key={member.id} member={member} size="sm" />
          ))}
          {team.members.length === 0 && (
            <div className="w-7 h-7 rounded-full bg-[#1e1e2e] border border-[#2e2e4e] flex items-center justify-center text-slate-600 text-xs">
              +
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-white text-sm font-medium">
            {team.members.length > 0
              ? team.members.length + ' team member' + (team.members.length !== 1 ? 's' : '')
              : 'No team members yet'}
          </p>
          {totalTasks > 0 && (
            <p className="text-slate-500 text-xs">{doneTasks}/{totalTasks} tasks done</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
              activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Members tab */}
      {activeTab === 'members' && (
        <div className="space-y-3">
          {team.members.length === 0 && !showAddMember && (
            <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl text-slate-500 text-sm">
              <div className="text-4xl mb-2">👥</div>
              <p>No team members yet</p>
              <p className="text-xs mt-1">Add team members to collaborate</p>
            </div>
          )}

          {team.members.map(member => {
            const role = ROLES.find(r => r.id === member.role)
            return (
              <div key={member.id} className="flex items-center gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
                <MemberAvatar member={member} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{member.name}</p>
                  <p className="text-xs" style={{ color: role?.color || '#6366f1' }}>
                    {role?.icon} {role?.label || member.role}
                  </p>
                  {member.email && (
                    <p className="text-slate-600 text-xs">{member.email}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveMember(member.id, member.name)}
                  className="text-slate-600 hover:text-red-400 text-xs transition shrink-0"
                >
                  🗑
                </button>
              </div>
            )
          })}

          {/* Add member form */}
          {showAddMember ? (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 space-y-3">
              <p className="text-white text-sm font-semibold">Add Team Member</p>
              <input
                value={newMemberName}
                onChange={e => setNewMemberName(e.target.value)}
                placeholder="Full name"
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
              />
              <select
                value={newMemberRole}
                onChange={e => setNewMemberRole(e.target.value)}
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
              >
                {ROLES.map(role => (
                  <option key={role.id} value={role.id}>{role.icon} {role.label}</option>
                ))}
              </select>
              <input
                value={newMemberEmail}
                onChange={e => setNewMemberEmail(e.target.value)}
                placeholder="Email (optional)"
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
              />
              <div className="flex gap-2">
                <button onClick={handleAddMember} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition">
                  Add Member
                </button>
                <button onClick={() => setShowAddMember(false)} className="px-4 py-2 bg-[#1e1e2e] text-slate-400 rounded-xl text-sm transition">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddMember(true)}
              className="w-full py-2.5 border-2 border-dashed border-[#2e2e4e] hover:border-indigo-700 text-slate-500 hover:text-indigo-400 rounded-xl text-sm transition"
            >
              + Add Team Member
            </button>
          )}

          {/* Roles reference */}
          {team.members.length === 0 && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Available Roles</p>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(role => (
                  <div key={role.id} className="flex items-center gap-2">
                    <span className="text-lg">{role.icon}</span>
                    <div>
                      <p className="text-xs font-medium" style={{ color: role.color }}>{role.label}</p>
                      <p className="text-slate-600 text-xs">{role.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tasks tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">

          {/* Task progress */}
          {totalTasks > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-[#1e1e2e] rounded-full h-2">
                <div
                  className="h-2 bg-emerald-600 rounded-full transition-all"
                  style={{ width: totalTasks > 0 ? (doneTasks / totalTasks * 100) + '%' : '0%' }}
                />
              </div>
              <span className="text-xs text-slate-500 shrink-0">{doneTasks}/{totalTasks}</span>
            </div>
          )}

          {/* Tasks list */}
          {(team.tasks || []).length === 0 && !showAddTask && (
            <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl text-slate-500 text-sm">
              <div className="text-4xl mb-2">✅</div>
              <p>No tasks yet</p>
            </div>
          )}

          {(team.tasks || []).map(task => {
            const priority = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium
            const status = STATUS_COLORS[task.status] || STATUS_COLORS.Todo
            const assignedMember = team.members.find(m => m.id === task.assignedTo)

            return (
              <div key={task.id} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
                <div className="flex items-start gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.status === 'Done' ? 'line-through text-slate-500' : 'text-white'}`}>
                      {task.title}
                    </p>
                    {assignedMember && (
                      <div className="flex items-center gap-1 mt-1">
                        <MemberAvatar member={assignedMember} size="sm" />
                        <span className="text-xs text-slate-500">{assignedMember.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full border ${priority.color} ${priority.bg} ${priority.border}`}>
                      {task.priority}
                    </span>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-slate-600 hover:text-red-400 text-xs transition ml-1"
                    >
                      🗑
                    </button>
                  </div>
                </div>

                <div className="flex gap-1">
                  {['Todo', 'In Progress', 'Done'].map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(task.id, s)}
                      className={`flex-1 py-1 rounded-lg text-xs transition ${
                        task.status === s
                          ? (STATUS_COLORS[s]?.bg || 'bg-[#1e1e2e]') + ' ' + (STATUS_COLORS[s]?.color || 'text-white') + ' font-semibold'
                          : 'bg-[#0d0d1a] text-slate-600 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Add task form */}
          {showAddTask ? (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 space-y-2">
              <input
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="Task title..."
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newTaskAssignee}
                  onChange={e => setNewTaskAssignee(e.target.value)}
                  className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-xs outline-none"
                >
                  <option value="">Unassigned</option>
                  {team.members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <select
                  value={newTaskPriority}
                  onChange={e => setNewTaskPriority(e.target.value)}
                  className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-xs outline-none"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddTask} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition">
                  Add Task
                </button>
                <button onClick={() => setShowAddTask(false)} className="px-4 py-2 bg-[#1e1e2e] text-slate-400 rounded-xl text-xs transition">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddTask(true)}
              className="w-full py-2.5 border-2 border-dashed border-[#2e2e4e] hover:border-indigo-700 text-slate-500 hover:text-indigo-400 rounded-xl text-sm transition"
            >
              + Add Task
            </button>
          )}
        </div>
      )}

      {/* Notes tab */}
      {activeTab === 'notes' && (
        <div className="space-y-3">

          {/* Add note */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 space-y-2">
            <input
              value={noteAuthor}
              onChange={e => setNoteAuthor(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-indigo-500"
            />
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Add a collaboration note... progress update, question, or idea"
              className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500 resize-none placeholder-slate-600"
              rows={2}
            />
            <button
              onClick={handleAddNote}
              disabled={!noteText.trim()}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition disabled:opacity-50"
            >
              + Post Note
            </button>
          </div>

          {/* Notes list */}
          {(team.notes || []).length === 0 && (
            <div className="text-center py-6 text-slate-600 text-sm">
              No collaboration notes yet
            </div>
          )}

          {(team.notes || []).map(note => (
            <div key={note.id} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-900 border border-indigo-700 flex items-center justify-center text-xs font-bold text-indigo-400">
                    {note.author?.slice(0, 2).toUpperCase() || 'AN'}
                  </div>
                  <p className="text-white text-xs font-medium">{note.author || 'Anonymous'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 text-xs">
                    {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button onClick={() => handleDeleteNote(note.id)} className="text-slate-600 hover:text-red-400 text-xs transition">
                    🗑
                  </button>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{note.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TeamCollaboration