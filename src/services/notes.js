const NOTES_KEY = 'protomind_notes'

export function getAllNotes() {
  try {
    const data = localStorage.getItem(NOTES_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export function getNotesForProject(idea) {
  const all = getAllNotes()
  return all[idea] || {
    mainNote: '',
    componentNotes: {},
    buildLog: [],
    nextSteps: [],
    status: 'Planning',
  }
}

export function saveMainNote(idea, note) {
  const all = getAllNotes()
  if (!all[idea]) all[idea] = getNotesForProject(idea)
  all[idea].mainNote = note
  all[idea].updatedAt = new Date().toISOString()
  localStorage.setItem(NOTES_KEY, JSON.stringify(all))
}

export function saveComponentNote(idea, componentName, note) {
  const all = getAllNotes()
  if (!all[idea]) all[idea] = getNotesForProject(idea)
  if (!all[idea].componentNotes) all[idea].componentNotes = {}
  all[idea].componentNotes[componentName] = note
  localStorage.setItem(NOTES_KEY, JSON.stringify(all))
}

export function addBuildLogEntry(idea, entry) {
  const all = getAllNotes()
  if (!all[idea]) all[idea] = getNotesForProject(idea)
  if (!all[idea].buildLog) all[idea].buildLog = []
  all[idea].buildLog.unshift({
    id: Date.now().toString(),
    text: entry,
    timestamp: new Date().toISOString(),
    type: 'log',
  })
  localStorage.setItem(NOTES_KEY, JSON.stringify(all))
}

export function deleteBuildLogEntry(idea, entryId) {
  const all = getAllNotes()
  if (!all[idea]) return
  all[idea].buildLog = (all[idea].buildLog || []).filter(e => e.id !== entryId)
  localStorage.setItem(NOTES_KEY, JSON.stringify(all))
}

export function addNextStep(idea, step) {
  const all = getAllNotes()
  if (!all[idea]) all[idea] = getNotesForProject(idea)
  if (!all[idea].nextSteps) all[idea].nextSteps = []
  all[idea].nextSteps.push({
    id: Date.now().toString(),
    text: step,
    done: false,
  })
  localStorage.setItem(NOTES_KEY, JSON.stringify(all))
}

export function toggleNextStep(idea, stepId) {
  const all = getAllNotes()
  if (!all[idea]) return
  all[idea].nextSteps = (all[idea].nextSteps || []).map(s =>
    s.id === stepId ? { ...s, done: !s.done } : s
  )
  localStorage.setItem(NOTES_KEY, JSON.stringify(all))
}

export function deleteNextStep(idea, stepId) {
  const all = getAllNotes()
  if (!all[idea]) return
  all[idea].nextSteps = (all[idea].nextSteps || []).filter(s => s.id !== stepId)
  localStorage.setItem(NOTES_KEY, JSON.stringify(all))
}

export function updateProjectStatus(idea, status) {
  const all = getAllNotes()
  if (!all[idea]) all[idea] = getNotesForProject(idea)
  all[idea].status = status
  localStorage.setItem(NOTES_KEY, JSON.stringify(all))
}