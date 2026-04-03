const STORAGE_KEY = 'protomind_projects'

export function saveProject(idea, components, positions) {
  const projects = getAllProjects()
  const newProject = {
    id: Date.now(),
    idea,
    components,
    positions,
    createdAt: new Date().toISOString(),
    thumbnail: components.slice(0, 3).map(c => c.icon).join(''),
  }
  projects.unshift(newProject)
  const trimmed = projects.slice(0, 20)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  return newProject
}

export function getAllProjects() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function deleteProject(id) {
  const projects = getAllProjects().filter(p => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function getProject(id) {
  return getAllProjects().find(p => p.id === id) || null
}