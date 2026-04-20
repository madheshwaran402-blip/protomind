const PROJECTS_KEY = 'protomind_projects'
const VERSIONS_KEY = 'protomind_versions'

function safeGet(key, fallback = []) {
  try {
    const data = localStorage.getItem(key)
    if (!data) return fallback
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    console.warn('Storage read error for:', key)
    return fallback
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    console.warn('Storage write error for:', key)
    return false
  }
}

export function autoTagProject(idea, components) {
  const tags = []
  const ideaLower = idea.toLowerCase()
  if (ideaLower.includes('watch') || ideaLower.includes('wearable')) tags.push('Wearable')
  if (ideaLower.includes('robot') || ideaLower.includes('arm')) tags.push('Robotics')
  if (ideaLower.includes('smart') || ideaLower.includes('iot') || ideaLower.includes('wifi')) tags.push('IoT')
  if (ideaLower.includes('plant') || ideaLower.includes('garden')) tags.push('Agriculture')
  if (ideaLower.includes('health') || ideaLower.includes('heart') || ideaLower.includes('medical')) tags.push('Health')
  if (ideaLower.includes('home') || ideaLower.includes('door') || ideaLower.includes('alarm')) tags.push('Home Automation')
  if (ideaLower.includes('car') || ideaLower.includes('vehicle') || ideaLower.includes('drone')) tags.push('Vehicle')
  if (ideaLower.includes('weather') || ideaLower.includes('temperature') || ideaLower.includes('monitor')) tags.push('Monitoring')
  if (ideaLower.includes('security') || ideaLower.includes('camera') || ideaLower.includes('lock')) tags.push('Security')
  const categories = [...new Set(components.map(c => c.category))]
  if (categories.includes('Communication')) tags.push('Connected')
  if (categories.includes('Power')) tags.push('Portable')
  return tags.length > 0 ? tags : ['Electronics']
}

export function saveProject(idea, components, positions, tags = []) {
  try {
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
    safeSet(PROJECTS_KEY, updated.slice(0, 20))
    saveVersion(project)
    return project
  } catch (err) {
    console.error('saveProject error:', err)
    return null
  }
}

export function saveVersion(project) {
  try {
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
    safeSet(VERSIONS_KEY, [version, ...versions].slice(0, 100))
  } catch (err) {
    console.error('saveVersion error:', err)
  }
}

export function getAllProjects() {
  return safeGet(PROJECTS_KEY, [])
}

export function getAllVersions() {
  return safeGet(VERSIONS_KEY, [])
}

export function getVersionsForProject(projectId) {
  return getAllVersions().filter(v => v.projectId === projectId)
}

export function getProject(id) {
  return getAllProjects().find(p => p.id === id) || null
}

export function deleteProject(id) {
  try {
    safeSet(PROJECTS_KEY, getAllProjects().filter(p => p.id !== id))
    safeSet(VERSIONS_KEY, getAllVersions().filter(v => v.projectId !== id))
  } catch (err) {
    console.error('deleteProject error:', err)
  }
}

export function restoreVersion(version) {
  return saveProject(version.idea, version.components, version.positions)
}

export function updateProjectTags(id, tags) {
  try {
    const projects = getAllProjects()
    safeSet(PROJECTS_KEY, projects.map(p => p.id === id ? { ...p, tags } : p))
  } catch (err) {
    console.error('updateProjectTags error:', err)
  }
}

export function getAllTags() {
  try {
    const projects = getAllProjects()
    const allTags = projects.flatMap(p => p.tags || [])
    return [...new Set(allTags)].sort()
  } catch {
    return []
  }
}