const PROJECTS_KEY = 'protomind_projects'
const VERSIONS_KEY = 'protomind_versions'

export function saveProject(idea, components, positions, tags = []) {
  const projects = getAllProjects()
  const existing = projects.find(p => p.idea === idea)

  const project = {
    id: existing?.id || Date.now().toString(),
    idea,
    components,
    positions,
    tags: tags.length > 0 ? tags : (existing?.tags || autoTagProject(idea, components)),
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    thumbnail: components.slice(0, 3).map(c => c.icon).join(''),
    version: (existing?.version || 0) + 1,
  }

  const updated = existing
    ? projects.map(p => p.idea === idea ? project : p)
    : [project, ...projects]

  localStorage.setItem(PROJECTS_KEY, JSON.stringify(updated.slice(0, 20)))
  saveVersion(project)
  return project
}

export function autoTagProject(idea, components) {
  const tags = []
  const ideaLower = idea.toLowerCase()

  if (ideaLower.includes('watch') || ideaLower.includes('wearable') || ideaLower.includes('band')) tags.push('Wearable')
  if (ideaLower.includes('robot') || ideaLower.includes('arm') || ideaLower.includes('servo')) tags.push('Robotics')
  if (ideaLower.includes('smart') || ideaLower.includes('iot') || ideaLower.includes('wifi') || ideaLower.includes('bluetooth')) tags.push('IoT')
  if (ideaLower.includes('plant') || ideaLower.includes('garden') || ideaLower.includes('water')) tags.push('Agriculture')
  if (ideaLower.includes('health') || ideaLower.includes('heart') || ideaLower.includes('medical') || ideaLower.includes('pulse')) tags.push('Health')
  if (ideaLower.includes('home') || ideaLower.includes('door') || ideaLower.includes('light') || ideaLower.includes('alarm')) tags.push('Home Automation')
  if (ideaLower.includes('car') || ideaLower.includes('vehicle') || ideaLower.includes('drone') || ideaLower.includes('fly')) tags.push('Vehicle')
  if (ideaLower.includes('weather') || ideaLower.includes('temperature') || ideaLower.includes('sensor') || ideaLower.includes('monitor')) tags.push('Monitoring')
  if (ideaLower.includes('game') || ideaLower.includes('display') || ideaLower.includes('led') || ideaLower.includes('matrix')) tags.push('Display')
  if (ideaLower.includes('security') || ideaLower.includes('camera') || ideaLower.includes('lock')) tags.push('Security')

  const categories = [...new Set(components.map(c => c.category))]
  if (categories.includes('Communication')) tags.push('Connected')
  if (categories.includes('Power') && components.some(c => c.name.toLowerCase().includes('battery') || c.name.toLowerCase().includes('solar'))) tags.push('Portable')

  return tags.length > 0 ? tags : ['Electronics']
}

export function updateProjectTags(id, tags) {
  const projects = getAllProjects()
  const updated = projects.map(p => p.id === id ? { ...p, tags } : p)
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(updated))
}

export function saveVersion(project) {
  const versions = getAllVersions()
  const version = {
    id: Date.now().toString(),
    projectId: project.id,
    idea: project.idea,
    components: project.components,
    positions: project.positions,
    savedAt: new Date().toISOString(),
    version: project.version,
    componentCount: project.components.length,
    thumbnail: project.thumbnail,
  }
  const updated = [version, ...versions].slice(0, 100)
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(updated))
}

export function getAllProjects() {
  try {
    const data = localStorage.getItem(PROJECTS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function getAllVersions() {
  try {
    const data = localStorage.getItem(VERSIONS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function getVersionsForProject(projectId) {
  return getAllVersions().filter(v => v.projectId === projectId)
}

export function getProject(id) {
  return getAllProjects().find(p => p.id === id) || null
}

export function deleteProject(id) {
  const projects = getAllProjects().filter(p => p.id !== id)
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
  const versions = getAllVersions().filter(v => v.projectId !== id)
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions))
}

export function restoreVersion(version) {
  return saveProject(version.idea, version.components, version.positions)
}

export function getAllTags() {
  const projects = getAllProjects()
  const allTags = projects.flatMap(p => p.tags || [])
  return [...new Set(allTags)].sort()
}