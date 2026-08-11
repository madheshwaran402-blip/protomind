const NOTES_KEY = 'protomind_notes_v2'

export function getAllNotes() {
  try {
    const raw = localStorage.getItem(NOTES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function getNotesForProject(projectId) {
  const all = getAllNotes()
  return all[projectId] || []
}

export function addNote(projectId, note) {
  const all = getAllNotes()
  if (!all[projectId]) all[projectId] = []
  const newNote = {
    id: 'note_' + Date.now(),
    title: note.title || 'Untitled Note',
    content: note.content || '',
    category: note.category || 'General',
    tags: note.tags || [],
    pinned: false,
    color: note.color || 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  all[projectId].unshift(newNote)
  localStorage.setItem(NOTES_KEY, JSON.stringify(all))
  return newNote
}

export function updateNote(projectId, noteId, updates) {
  const all = getAllNotes()
  if (!all[projectId]) return
  all[projectId] = all[projectId].map(function(note) {
    if (note.id === noteId) {
      return Object.assign({}, note, updates, { updatedAt: new Date().toISOString() })
    }
    return note
  })
  localStorage.setItem(NOTES_KEY, JSON.stringify(all))
}

export function deleteNote(projectId, noteId) {
  const all = getAllNotes()
  if (!all[projectId]) return
  all[projectId] = all[projectId].filter(function(n) { return n.id !== noteId })
  localStorage.setItem(NOTES_KEY, JSON.stringify(all))
}

export function togglePin(projectId, noteId) {
  const all = getAllNotes()
  if (!all[projectId]) return
  all[projectId] = all[projectId].map(function(note) {
    if (note.id === noteId) return Object.assign({}, note, { pinned: !note.pinned })
    return note
  })
  localStorage.setItem(NOTES_KEY, JSON.stringify(all))
}

export function exportAllNotes(projectId, idea) {
  const notes = getNotesForProject(projectId)
  if (notes.length === 0) return

  const lines = [
    'PROTOTYPE NOTES: ' + idea,
    '='.repeat(60),
    'Exported: ' + new Date().toLocaleString(),
    'Total notes: ' + notes.length,
    '',
  ]

  const pinned = notes.filter(function(n) { return n.pinned })
  const unpinned = notes.filter(function(n) { return !n.pinned })
  const ordered = pinned.concat(unpinned)

  ordered.forEach(function(note) {
    lines.push((note.pinned ? '📌 ' : '') + note.title)
    lines.push('[' + note.category + ']' + (note.tags.length > 0 ? ' #' + note.tags.join(' #') : ''))
    lines.push(new Date(note.updatedAt).toLocaleDateString())
    lines.push('')
    lines.push(note.content)
    lines.push('')
    lines.push('-'.repeat(40))
    lines.push('')
  })

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'Notes_' + idea.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20) + '.txt'
  link.click()
  URL.revokeObjectURL(url)
}