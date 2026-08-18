const COLLAB_KEY = 'protomind_collaboration'

export function getTeamNotes(projectId) {
  try {
    const raw = localStorage.getItem(COLLAB_KEY)
    const all = raw ? JSON.parse(raw) : {}
    return all[projectId] || { members: [], notes: [], tasks: [] }
  } catch {
    return { members: [], notes: [], tasks: [] }
  }
}

export function saveTeamNotes(projectId, data) {
  try {
    const raw = localStorage.getItem(COLLAB_KEY)
    const all = raw ? JSON.parse(raw) : {}
    all[projectId] = data
    localStorage.setItem(COLLAB_KEY, JSON.stringify(all))
  } catch {}
}

export function addMember(projectId, member) {
  const data = getTeamNotes(projectId)
  const newMember = {
    id: 'member_' + Date.now(),
    name: member.name,
    role: member.role,
    avatar: member.avatar || '👤',
    joinedAt: new Date().toISOString(),
  }
  data.members = (data.members || []).concat([newMember])
  saveTeamNotes(projectId, data)
  return newMember
}

export function addTeamNote(projectId, note) {
  const data = getTeamNotes(projectId)
  const newNote = {
    id: 'tnote_' + Date.now(),
    text: note.text,
    author: note.author,
    avatar: note.avatar || '👤',
    type: note.type || 'note',
    createdAt: new Date().toISOString(),
  }
  data.notes = [newNote].concat(data.notes || [])
  saveTeamNotes(projectId, data)
  return newNote
}

export function addTask(projectId, task) {
  const data = getTeamNotes(projectId)
  const newTask = {
    id: 'task_' + Date.now(),
    title: task.title,
    assignee: task.assignee || 'Unassigned',
    priority: task.priority || 'Medium',
    done: false,
    createdAt: new Date().toISOString(),
  }
  data.tasks = (data.tasks || []).concat([newTask])
  saveTeamNotes(projectId, data)
  return newTask
}

export function toggleTask(projectId, taskId) {
  const data = getTeamNotes(projectId)
  data.tasks = (data.tasks || []).map(function(t) {
    if (t.id === taskId) return Object.assign({}, t, { done: !t.done })
    return t
  })
  saveTeamNotes(projectId, data)
}

export const TEAM_ROLES = ['Lead Engineer', 'Hardware', 'Software', 'Design', 'Testing', 'Documentation', 'Project Manager']
export const NOTE_TYPES = [
  { value: 'note', label: '📝 Note', color: 'indigo' },
  { value: 'decision', label: '✅ Decision', color: 'green' },
  { value: 'issue', label: '🐛 Issue', color: 'red' },
  { value: 'idea', label: '💡 Idea', color: 'yellow' },
]