import { getAllProjects, saveProject, getAllVersions } from './storage'
import { getAllNotes, saveMainNote, saveComponentNote } from './notes'
import { getAllRatings, saveRating } from './ratings'
import { getPinAssignments, savePinAssignments } from './pinAssignment'

export function exportProject(projectId) {
  const projects = getAllProjects()
  const project = projects.find(p => p.id === projectId)
  if (!project) throw new Error('Project not found')

  const versions = getAllVersions().filter(v => v.projectId === projectId)
  const notes = getAllNotes()[project.idea] || {}
  const ratings = getAllRatings()[project.idea] || {}
  const pins = getPinAssignments(project.idea)

  const bundle = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    exportedFrom: 'ProtoMind',
    project: {
      idea: project.idea,
      components: project.components,
      tags: project.tags || [],
      thumbnail: project.thumbnail,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    },
    versions: versions.slice(0, 10),
    notes,
    ratings,
    pins,
  }

  const json = JSON.stringify(bundle, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'ProtoMind_' + project.idea.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30) + '.json'
  link.click()
  URL.revokeObjectURL(url)

  return bundle
}

export function exportAllProjects() {
  const projects = getAllProjects()
  const versions = getAllVersions()
  const notes = getAllNotes()
  const ratings = getAllRatings()

  const bundle = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    exportedFrom: 'ProtoMind',
    totalProjects: projects.length,
    projects: projects.map(p => ({
      idea: p.idea,
      components: p.components,
      tags: p.tags || [],
      thumbnail: p.thumbnail,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      notes: notes[p.idea] || {},
      ratings: ratings[p.idea] || {},
      pins: getPinAssignments(p.idea),
      versions: versions.filter(v => v.projectId === p.id).slice(0, 5),
    })),
  }

  const json = JSON.stringify(bundle, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'ProtoMind_All_Projects_' + new Date().toISOString().slice(0, 10) + '.json'
  link.click()
  URL.revokeObjectURL(url)

  return bundle
}

export function importProject(jsonString) {
  const bundle = JSON.parse(jsonString)

  if (!bundle.exportedFrom || bundle.exportedFrom !== 'ProtoMind') {
    throw new Error('Invalid ProtoMind export file')
  }

  const results = { imported: 0, skipped: 0, errors: [] }

  if (bundle.project) {
    try {
      const p = bundle.project
      saveProject(p.idea, p.components, null, p.tags || [])

      if (bundle.notes?.mainNote) {
        saveMainNote(p.idea, bundle.notes.mainNote)
      }
      if (bundle.notes?.componentNotes) {
        Object.entries(bundle.notes.componentNotes).forEach(([compName, note]) => {
          saveComponentNote(p.idea, compName, note)
        })
      }
      if (bundle.ratings?.stars) {
        saveRating(p.idea, bundle.ratings)
      }
      if (bundle.pins?.length > 0) {
        savePinAssignments(p.idea, bundle.pins)
      }

      results.imported++
    } catch (err) {
      results.errors.push(bundle.project.idea + ': ' + err.message)
      results.skipped++
    }
  }

  if (bundle.projects?.length > 0) {
    bundle.projects.forEach(p => {
      try {
        saveProject(p.idea, p.components, null, p.tags || [])

        if (p.notes?.mainNote) {
          saveMainNote(p.idea, p.notes.mainNote)
        }
        if (p.ratings?.stars) {
          saveRating(p.idea, p.ratings)
        }
        if (p.pins?.length > 0) {
          savePinAssignments(p.idea, p.pins)
        }

        results.imported++
      } catch (err) {
        results.errors.push(p.idea + ': ' + err.message)
        results.skipped++
      }
    })
  }

  return results
}