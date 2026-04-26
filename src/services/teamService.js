const TEAM_KEY = 'protomind_teams'

export const ROLES = [
  { id: 'hardware', label: 'Hardware Engineer', icon: '🔧', color: '#6366f1', desc: 'Circuit design and component selection' },
  { id: 'software', label: 'Software Developer', icon: '💻', color: '#0ea5e9', desc: 'Code writing and programming' },
  { id: 'designer', label: 'Product Designer', icon: '🎨', color: '#a855f7', desc: 'Enclosure and user interface design' },
  { id: 'tester', label: 'QA Tester', icon: '🧪', color: '#22c55e', desc: 'Testing and validation' },
  { id: 'manager', label: 'Project Manager', icon: '📋', color: '#f59e0b', desc: 'Coordination and planning' },
  { id: 'researcher', label: 'Researcher', icon: '🔬', color: '#ef4444', desc: 'Research and documentation' },
]

export function getAllTeams() {
  try {
    const data = localStorage.getItem(TEAM_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export function getTeam(idea) {
  const all = getAllTeams()
  return all[idea] || {
    members: [],
    notes: [],
    tasks: [],
    createdAt: new Date().toISOString(),
  }
}

export function saveTeam(idea, team) {
  const all = getAllTeams()
  all[idea] = { ...team, updatedAt: new Date().toISOString() }
  localStorage.setItem(TEAM_KEY, JSON.stringify(all))
}

export function addMember(idea, member) {
  const team = getTeam(idea)
  const newMember = {
    id: 'member_' + Date.now(),
    name: member.name,
    role: member.role,
    email: member.email || '',
    avatar: member.name.slice(0, 2).toUpperCase(),
    joinedAt: new Date().toISOString(),
    assignedComponents: member.assignedComponents || [],
  }
  team.members.push(newMember)
  saveTeam(idea, team)
  return team
}

export function removeMember(idea, memberId) {
  const team = getTeam(idea)
  team.members = team.members.filter(m => m.id !== memberId)
  saveTeam(idea, team)
  return team
}

export function addCollabNote(idea, note, authorName) {
  const team = getTeam(idea)
  if (!team.notes) team.notes = []
  team.notes.unshift({
    id: 'note_' + Date.now(),
    text: note,
    author: authorName,
    createdAt: new Date().toISOString(),
  })
  saveTeam(idea, team)
  return team
}

export function deleteNote(idea, noteId) {
  const team = getTeam(idea)
  team.notes = (team.notes || []).filter(n => n.id !== noteId)
  saveTeam(idea, team)
  return team
}

export function addTask(idea, task) {
  const team = getTeam(idea)
  if (!team.tasks) team.tasks = []
  team.tasks.push({
    id: 'task_' + Date.now(),
    title: task.title,
    assignedTo: task.assignedTo || '',
    priority: task.priority || 'Medium',
    status: 'Todo',
    createdAt: new Date().toISOString(),
  })
  saveTeam(idea, team)
  return team
}

export function updateTaskStatus(idea, taskId, status) {
  const team = getTeam(idea)
  team.tasks = (team.tasks || []).map(t =>
    t.id === taskId ? { ...t, status } : t
  )
  saveTeam(idea, team)
  return team
}

export function deleteTask(idea, taskId) {
  const team = getTeam(idea)
  team.tasks = (team.tasks || []).filter(t => t.id !== taskId)
  saveTeam(idea, team)
  return team
}